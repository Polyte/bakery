import { NextResponse } from "next/server"
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { allocateOrderNumber, writeAuditLog } from "@/lib/admin/domain"
import { parsePageParams } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = parsePageParams(searchParams)
    const status = searchParams.get("status") as OrderStatus | null
    const paymentStatus = searchParams.get("paymentStatus") as PaymentStatus | null
    const q = searchParams.get("q")?.trim() || ""
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const where: Prisma.OrderWhereInput = {}
    if (status && Object.values(OrderStatus).includes(status)) where.status = status
    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      where.paymentStatus = paymentStatus
    }
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(`${to}T23:59:59.999`)
    }
    if (q) {
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { customerFirstName: { contains: q, mode: "insensitive" } },
        { customerLastName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          items: { select: { id: true, name: true, quantity: true, totalPrice: true, kind: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin orders list failed:", error)
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 })
  }
}

type CreateBody = {
  customerId?: string
  customerFirstName?: string
  customerLastName?: string
  customerEmail?: string
  customerPhone?: string
  fulfillment?: string
  requiredDate?: string
  requiredTime?: string
  deliveryAddress?: string
  deliveryFee?: number
  subtotal?: number
  discount?: number
  tax?: number
  total?: number
  depositRequired?: number
  paymentMethod?: string
  customerNotes?: string
  internalNotes?: string
  source?: string
  items?: Array<{
    productId?: string
    name: string
    sku?: string
    image?: string
    quantity?: number
    unitPrice: number
    totalPrice?: number
    customisation?: string
    kind?: string
  }>
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

  try {
    const items = body.items ?? []
    if (!items.length) {
      return NextResponse.json({ error: "At least one line item is required." }, { status: 400 })
    }

    let customerId = body.customerId
    const email = body.customerEmail?.trim().toLowerCase()
    if (!customerId && email) {
      const customer = await prisma.customer.upsert({
        where: { email },
        create: {
          email,
          firstName: body.customerFirstName?.trim() || "Customer",
          lastName: body.customerLastName?.trim() || "",
          phone: body.customerPhone?.trim() || "",
        },
        update: {
          firstName: body.customerFirstName?.trim() || undefined,
          lastName: body.customerLastName?.trim() || undefined,
          phone: body.customerPhone?.trim() || undefined,
        },
      })
      customerId = customer.id
    }

    const computedSubtotal = items.reduce(
      (sum, item) => sum + (item.totalPrice ?? item.unitPrice * (item.quantity ?? 1)),
      0,
    )
    const subtotal = body.subtotal ?? computedSubtotal
    const deliveryFee = body.deliveryFee ?? 0
    const discount = body.discount ?? 0
    const tax = body.tax ?? 0
    const total = body.total ?? subtotal + deliveryFee + tax - discount
    const orderNumber = await allocateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: OrderStatus.NEW,
        paymentStatus: PaymentStatus.UNPAID,
        fulfillment: body.fulfillment === "delivery" ? "delivery" : "pickup",
        customerFirstName: body.customerFirstName?.trim() || "",
        customerLastName: body.customerLastName?.trim() || "",
        customerEmail: email || "",
        customerPhone: body.customerPhone?.trim() || "",
        requiredDate: body.requiredDate ? new Date(body.requiredDate) : null,
        requiredTime: body.requiredTime || null,
        deliveryAddress: body.deliveryAddress || null,
        deliveryFee,
        subtotal,
        discount,
        tax,
        total,
        depositRequired: body.depositRequired ?? Math.round(total * 50) / 100,
        paymentMethod: body.paymentMethod || null,
        customerNotes: body.customerNotes || "",
        internalNotes: body.internalNotes || "",
        source: body.source || "admin",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            image: item.image,
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice ?? item.unitPrice * (item.quantity ?? 1),
            customisation: item.customisation || "{}",
            kind: item.kind || "product",
          })),
        },
        statusHistory: {
          create: {
            toStatus: OrderStatus.NEW,
            note: "Created in admin",
            changedBy: session!.id,
          },
        },
      },
      include: { items: true, customer: true },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "order.create",
      entity: "Order",
      entityId: order.id,
      newValue: { orderNumber: order.orderNumber, total: order.total },
    })

    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { orderCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Admin order create failed:", error)
    return NextResponse.json({ error: "Could not create order." }, { status: 500 })
  }
}
