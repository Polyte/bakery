import { NextResponse } from "next/server"
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

type Params = { params: Promise<{ id: string }> }

async function findOrder(idOrNumber: string) {
  return prisma.order.findFirst({
    where: {
      OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
    },
    include: {
      customer: true,
      items: { include: { product: { select: { id: true, name: true, sku: true, image: true } } } },
      payments: { orderBy: { createdAt: "desc" } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      invoices: true,
      delivery: true,
    },
  })
}

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await params
    const order = await findOrder(id)
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 })
    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin order get failed:", error)
    return NextResponse.json({ error: "Could not load order." }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    const { id } = await params
    const existing = await findOrder(id)
    if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 })

    const data: Prisma.OrderUpdateInput = {}
    const assignable: Array<keyof Prisma.OrderUpdateInput> = [
      "fulfillment",
      "customerFirstName",
      "customerLastName",
      "customerEmail",
      "customerPhone",
      "requiredTime",
      "deliveryAddress",
      "deliveryFee",
      "deliveryKm",
      "deliveryLat",
      "deliveryLng",
      "subtotal",
      "discount",
      "tax",
      "total",
      "depositRequired",
      "amountPaid",
      "customerNotes",
      "internalNotes",
      "paymentMethod",
      "paymentReference",
      "source",
      "customisation",
    ]

    for (const key of assignable) {
      if (key in body) (data as Record<string, unknown>)[key as string] = body[key as string]
    }
    if (typeof body.requiredDate === "string" || body.requiredDate === null) {
      data.requiredDate = body.requiredDate ? new Date(String(body.requiredDate)) : null
    }
    if (typeof body.status === "string" && Object.values(OrderStatus).includes(body.status as OrderStatus)) {
      data.status = body.status as OrderStatus
    }
    if (
      typeof body.paymentStatus === "string" &&
      Object.values(PaymentStatus).includes(body.paymentStatus as PaymentStatus)
    ) {
      data.paymentStatus = body.paymentStatus as PaymentStatus
    }
    if (typeof body.customerId === "string") {
      data.customer = { connect: { id: body.customerId } }
    }

    const order = await prisma.order.update({
      where: { id: existing.id },
      data,
      include: {
        customer: true,
        items: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "order.update",
      entity: "Order",
      entityId: order.id,
      previousValue: {
        status: existing.status,
        paymentStatus: existing.paymentStatus,
        total: existing.total,
      },
      newValue: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin order update failed:", error)
    return NextResponse.json({ error: "Could not update order." }, { status: 500 })
  }
}
