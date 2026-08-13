import { NextResponse } from "next/server"
import { QuoteStatus, Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { allocateQuoteNumber, writeAuditLog } from "@/lib/admin/domain"
import { parsePageParams } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = parsePageParams(searchParams)
    const status = searchParams.get("status") as QuoteStatus | null
    const q = searchParams.get("q")?.trim() || ""

    const where: Prisma.QuoteWhereInput = {}
    if (status && Object.values(QuoteStatus).includes(status)) where.status = status
    if (q) {
      where.OR = [
        { quoteNumber: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { customer: { email: { contains: q, mode: "insensitive" } } },
        { customer: { firstName: { contains: q, mode: "insensitive" } } },
        { customer: { lastName: { contains: q, mode: "insensitive" } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.quote.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin quotes list failed:", error)
    return NextResponse.json({ error: "Could not load quotes." }, { status: 500 })
  }
}

type CreateBody = {
  customerId?: string
  status?: QuoteStatus
  subtotal?: number
  discount?: number
  deliveryFee?: number
  labourCharge?: number
  tax?: number
  total?: number
  depositRequired?: number
  expiryDate?: string
  terms?: string
  notes?: string
  items?: Array<{
    productId?: string
    name: string
    description?: string
    quantity?: number
    unitPrice: number
    totalPrice?: number
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
    const computedSubtotal = items.reduce(
      (sum, item) => sum + (item.totalPrice ?? item.unitPrice * (item.quantity ?? 1)),
      0,
    )
    const subtotal = body.subtotal ?? computedSubtotal
    const deliveryFee = body.deliveryFee ?? 0
    const labourCharge = body.labourCharge ?? 0
    const discount = body.discount ?? 0
    const tax = body.tax ?? 0
    const total = body.total ?? subtotal + deliveryFee + labourCharge + tax - discount
    const quoteNumber = await allocateQuoteNumber()

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerId: body.customerId,
        status:
          body.status && Object.values(QuoteStatus).includes(body.status)
            ? body.status
            : QuoteStatus.DRAFT,
        subtotal,
        discount,
        deliveryFee,
        labourCharge,
        tax,
        total,
        depositRequired: body.depositRequired ?? Math.round(total * 50) / 100,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        terms: body.terms || "",
        notes: body.notes || "",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            description: item.description || "",
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice ?? item.unitPrice * (item.quantity ?? 1),
          })),
        },
      },
      include: { items: true, customer: true },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "quote.create",
      entity: "Quote",
      entityId: quote.id,
      newValue: { quoteNumber, total },
    })

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    console.error("Admin quote create failed:", error)
    return NextResponse.json({ error: "Could not create quote." }, { status: 500 })
  }
}
