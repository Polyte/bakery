import { NextResponse } from "next/server"
import {
  OrderStatus,
  PaymentRecordStatus,
  PaymentStatus,
} from "@prisma/client"
import { allocatePaymentNumber, createNotification } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"
import { verifyYocoWebhookSignature } from "@/lib/yoco"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

type YocoWebhookEvent = {
  id?: string
  type?: string
  createdDate?: string
  payload?: {
    id?: string
    amount?: number
    currency?: string
    metadata?: Record<string, string>
    checkoutId?: string
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const secret = process.env.YOCO_WEBHOOK_SECRET
  const id = request.headers.get("webhook-id") ?? ""
  const timestamp = request.headers.get("webhook-timestamp") ?? ""
  const signature = request.headers.get("webhook-signature") ?? ""

  if (secret) {
    const valid = verifyYocoWebhookSignature({
      secret,
      body,
      id,
      timestamp,
      signatureHeader: signature,
    })
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 })
  }

  let event: YocoWebhookEvent
  try {
    event = JSON.parse(body) as YocoWebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  const idempotencyKey = event.id || event.payload?.id
  if (idempotencyKey) {
    const existing = await prisma.webhookEvent.findUnique({ where: { idempotencyKey } })
    if (existing?.processed) {
      return NextResponse.json({ received: true, duplicate: true })
    }
    await prisma.webhookEvent.upsert({
      where: { idempotencyKey },
      create: {
        provider: "yoco",
        eventType: event.type ?? "unknown",
        payload: body,
        signature,
        idempotencyKey,
        processed: false,
      },
      update: {},
    })
  }

  if (event.type === "payment.succeeded") {
    await persistYocoPayment(event).catch((error) => {
      console.error("Yoco payment persist failed:", error)
    })
    await notifyPayment(event).catch((error) => {
      console.error("Yoco payment email failed:", error)
    })
  }

  if (idempotencyKey) {
    await prisma.webhookEvent.updateMany({
      where: { idempotencyKey },
      data: { processed: true },
    })
  }

  return NextResponse.json({ received: true })
}

async function persistYocoPayment(event: YocoWebhookEvent) {
  const meta = event.payload?.metadata ?? {}
  const orderNumber = meta.orderNumber?.trim()
  if (!orderNumber) return

  const amountCents = event.payload?.amount ?? 0
  const amount = Math.round(amountCents) / 100
  if (amount <= 0) return

  const order = await prisma.order.findUnique({ where: { orderNumber } })
  if (!order) return

  const gatewayId = event.payload?.id
  if (gatewayId) {
    const existingPayment = await prisma.payment.findFirst({
      where: { gatewayId },
    })
    if (existingPayment) return
  }

  const paymentNumber = await allocatePaymentNumber()

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        paymentNumber,
        customerId: order.customerId,
        orderId: order.id,
        amount,
        method: "yoco",
        status: PaymentRecordStatus.SUCCEEDED,
        reference: orderNumber,
        gatewayId: gatewayId ?? undefined,
        gatewayPayload: JSON.stringify(event.payload ?? {}),
        paidAt: new Date(),
        verifiedAt: new Date(),
        notes: "Auto-verified via Yoco webhook",
      },
    })

    const amountPaid = Math.round((order.amountPaid + amount) * 100) / 100
    const paymentStatus =
      amountPaid >= order.total
        ? PaymentStatus.PAID
        : amountPaid > 0
          ? PaymentStatus.PARTIALLY_PAID
          : order.paymentStatus

    const nextStatus =
      paymentStatus === PaymentStatus.PAID &&
      (order.status === OrderStatus.NEW ||
        order.status === OrderStatus.AWAITING_DEPOSIT ||
        order.status === OrderStatus.PAYMENT_VERIFICATION)
        ? OrderStatus.CONFIRMED
        : order.status

    await tx.order.update({
      where: { id: order.id },
      data: {
        amountPaid,
        paymentStatus,
        paymentMethod: "yoco",
        status: nextStatus,
        confirmedAt: nextStatus === OrderStatus.CONFIRMED ? new Date() : order.confirmedAt,
      },
    })

    if (nextStatus !== order.status) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: nextStatus,
          note: "Payment confirmed via Yoco",
        },
      })
    }

    await tx.incomeTransaction.create({
      data: {
        category: amountPaid >= order.total ? "final_payment" : "deposit",
        description: `Yoco payment ${orderNumber}`,
        amount,
        orderId: order.id,
        date: new Date(),
      },
    })
  })

  await createNotification({
    title: "Yoco payment received",
    body: `${orderNumber} — R${amount.toFixed(2)}`,
    type: "payment",
    href: `/admin/orders/${orderNumber}`,
  })
}

async function notifyPayment(event: YocoWebhookEvent) {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) return

  const meta = event.payload?.metadata ?? {}
  const amountCents = event.payload?.amount ?? 0
  const amount = `R${(amountCents / 100).toFixed(2)}`

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: user,
    to: process.env.CONTACT_EMAIL || "info@daddasconfectionery.co.za",
    subject: `Yoco payment received${meta.orderNumber ? ` · ${meta.orderNumber}` : ""}`,
    text: [
      `A Yoco payment was confirmed.`,
      `Order: ${meta.orderNumber ?? "n/a"}`,
      `Customer: ${meta.customerName ?? "n/a"}`,
      `Email: ${meta.customerEmail ?? "n/a"}`,
      `Phone: ${meta.customerPhone ?? "n/a"}`,
      `Amount: ${amount} ${event.payload?.currency ?? "ZAR"}`,
      `Payment ID: ${event.payload?.id ?? "n/a"}`,
      `Checkout ID: ${event.payload?.checkoutId ?? "n/a"}`,
      `Event: ${event.id ?? "n/a"}`,
    ].join("\n"),
  })
}
