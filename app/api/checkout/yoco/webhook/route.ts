import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { verifyYocoWebhookSignature } from "@/lib/yoco"

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

  if (event.type === "payment.succeeded") {
    await notifyPayment(event).catch((error) => {
      console.error("Yoco payment email failed:", error)
    })
  }

  return NextResponse.json({ received: true })
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
