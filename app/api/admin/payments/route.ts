import { NextResponse } from "next/server"
import { PaymentRecordStatus, Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { allocatePaymentNumber, writeAuditLog } from "@/lib/admin/domain"
import { derivePaymentStatus, parsePageParams } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = parsePageParams(searchParams)
    const status = searchParams.get("status") as PaymentRecordStatus | null
    const orderId = searchParams.get("orderId") || undefined
    const q = searchParams.get("q")?.trim() || ""

    const where: Prisma.PaymentWhereInput = {}
    if (status && Object.values(PaymentRecordStatus).includes(status)) where.status = status
    if (orderId) where.orderId = orderId
    if (q) {
      where.OR = [
        { paymentNumber: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: { select: { id: true, orderNumber: true, total: true, amountPaid: true } },
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin payments list failed:", error)
    return NextResponse.json({ error: "Could not load payments." }, { status: 500 })
  }
}

type CreateBody = {
  orderId?: string
  customerId?: string
  invoiceId?: string
  amount?: number
  method?: string
  status?: PaymentRecordStatus
  reference?: string
  proofUrl?: string
  notes?: string
  paidAt?: string
  applyToOrder?: boolean
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const amount = Number(body.amount)
  const method = body.method?.trim()
  if (!amount || amount <= 0 || !method) {
    return NextResponse.json({ error: "Amount and method are required." }, { status: 400 })
  }

  try {
    const order = body.orderId
      ? await prisma.order.findUnique({ where: { id: body.orderId } })
      : null
    if (body.orderId && !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    const status =
      body.status && Object.values(PaymentRecordStatus).includes(body.status)
        ? body.status
        : method === "eft"
          ? PaymentRecordStatus.VERIFICATION_REQUIRED
          : PaymentRecordStatus.SUCCEEDED

    const paymentNumber = await allocatePaymentNumber()
    const applyToOrder = body.applyToOrder !== false && status === PaymentRecordStatus.SUCCEEDED

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          orderId: body.orderId,
          customerId: body.customerId || order?.customerId || undefined,
          invoiceId: body.invoiceId,
          amount,
          method,
          status,
          reference: body.reference || order?.orderNumber || null,
          proofUrl: body.proofUrl,
          notes: body.notes || "",
          paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
          verifiedAt: status === PaymentRecordStatus.SUCCEEDED ? new Date() : null,
          verifiedBy: status === PaymentRecordStatus.SUCCEEDED ? session!.id : null,
        },
        include: { order: true, customer: true },
      })

      let updatedOrder = order
      if (order && applyToOrder) {
        const amountPaid = Math.round((order.amountPaid + amount) * 100) / 100
        const paymentStatus = derivePaymentStatus(order.total, amountPaid)
        updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: { amountPaid, paymentStatus },
        })
        if (order.customerId) {
          await tx.customer.update({
            where: { id: order.customerId },
            data: { lifetimeSpend: { increment: amount } },
          })
        }
      }

      return { payment, order: updatedOrder }
    })

    await writeAuditLog({
      userId: session!.id,
      action: "payment.create",
      entity: "Payment",
      entityId: result.payment.id,
      newValue: { amount, method, status, orderId: body.orderId },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Admin payment create failed:", error)
    return NextResponse.json({ error: "Could not record payment." }, { status: 500 })
  }
}
