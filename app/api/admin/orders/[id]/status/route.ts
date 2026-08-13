import { NextResponse } from "next/server"
import { OrderStatus } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { createNotification, writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

type Params = { params: Promise<{ id: string }> }

type Body = {
  status?: OrderStatus
  note?: string
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (!body.status || !Object.values(OrderStatus).includes(body.status)) {
    return NextResponse.json({ error: "Valid status is required." }, { status: 400 })
  }

  try {
    const { id } = await params
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    })
    if (!existing) return NextResponse.json({ error: "Order not found." }, { status: 404 })

    const fromStatus = existing.status
    const toStatus = body.status

    const data: {
      status: OrderStatus
      completedAt?: Date | null
      cancelledAt?: Date | null
      confirmedAt?: Date | null
    } = { status: toStatus }

    if (toStatus === OrderStatus.COMPLETED) data.completedAt = new Date()
    if (toStatus === OrderStatus.CANCELLED) data.cancelledAt = new Date()
    if (toStatus === OrderStatus.CONFIRMED && !existing.confirmedAt) data.confirmedAt = new Date()

    const [order] = await prisma.$transaction([
      prisma.order.update({
        where: { id: existing.id },
        data,
        include: {
          statusHistory: { orderBy: { createdAt: "asc" } },
          customer: true,
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: existing.id,
          fromStatus,
          toStatus,
          note: body.note || null,
          changedBy: session!.id,
        },
      }),
    ])

    await writeAuditLog({
      userId: session!.id,
      action: "order.status",
      entity: "Order",
      entityId: existing.id,
      previousValue: { status: fromStatus },
      newValue: { status: toStatus, note: body.note },
    })

    await createNotification({
      userId: session!.id,
      title: `Order ${existing.orderNumber} → ${toStatus}`,
      body: body.note || `Status updated from ${fromStatus}`,
      type: "order",
      href: `/admin/orders/${existing.id}`,
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin order status failed:", error)
    return NextResponse.json({ error: "Could not update order status." }, { status: 500 })
  }
}
