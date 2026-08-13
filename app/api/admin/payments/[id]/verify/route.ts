import { NextResponse } from "next/server"
import { OrderStatus, PaymentRecordStatus } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { derivePaymentStatus } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: { note?: string } = {}
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      body = (await request.json()) as { note?: string }
    }
  } catch {
    body = {}
  }

  try {
    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    })
    if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 })
    if (payment.status === PaymentRecordStatus.SUCCEEDED) {
      return NextResponse.json({ payment, order: payment.order })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentRecordStatus.SUCCEEDED,
          verifiedAt: new Date(),
          verifiedBy: session!.id,
          notes: body.note
            ? `${payment.notes ? `${payment.notes}\n` : ""}${body.note}`
            : payment.notes,
        },
      })

      let order = payment.order
      if (payment.orderId && payment.order) {
        const paidAgg = await tx.payment.aggregate({
          where: {
            orderId: payment.orderId,
            status: PaymentRecordStatus.SUCCEEDED,
          },
          _sum: { amount: true },
        })
        const amountPaid = Math.round((paidAgg._sum.amount ?? 0) * 100) / 100
        const previousPaid = payment.order.amountPaid
        const paymentStatus = derivePaymentStatus(payment.order.total, amountPaid)
        order = await tx.order.update({
          where: { id: payment.orderId },
          data: {
            amountPaid,
            paymentStatus,
            ...(payment.order.status === OrderStatus.PAYMENT_VERIFICATION ||
            payment.order.status === OrderStatus.AWAITING_DEPOSIT
              ? { status: OrderStatus.CONFIRMED, confirmedAt: new Date() }
              : {}),
          },
        })
        if (payment.order.customerId && amountPaid > previousPaid) {
          await tx.customer.update({
            where: { id: payment.order.customerId },
            data: { lifetimeSpend: { increment: amountPaid - previousPaid } },
          })
        }
      }

      return { payment: updatedPayment, order }
    })

    await writeAuditLog({
      userId: session!.id,
      action: "payment.verify",
      entity: "Payment",
      entityId: payment.id,
      previousValue: { status: payment.status },
      newValue: { status: PaymentRecordStatus.SUCCEEDED },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Admin payment verify failed:", error)
    return NextResponse.json({ error: "Could not verify payment." }, { status: 500 })
  }
}
