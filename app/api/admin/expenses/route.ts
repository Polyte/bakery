import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { parsePageParams } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = parsePageParams(searchParams)
    const category = searchParams.get("category") || undefined
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const where: {
      category?: string
      date?: { gte?: Date; lte?: Date }
    } = {}
    if (category) where.category = category
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(`${to}T23:59:59.999`)
    }

    const [items, total, sum] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take,
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
      sum: sum._sum.amount ?? 0,
    })
  } catch (error) {
    console.error("Admin expenses list failed:", error)
    return NextResponse.json({ error: "Could not load expenses." }, { status: 500 })
  }
}

type CreateBody = {
  category?: string
  description?: string
  amount?: number
  date?: string
  supplierId?: string
  receiptUrl?: string
  notes?: string
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

  const category = body.category?.trim()
  const description = body.description?.trim()
  const amount = Number(body.amount)
  if (!category || !description || !amount || amount <= 0) {
    return NextResponse.json(
      { error: "Category, description, and amount are required." },
      { status: 400 },
    )
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount,
        date: body.date ? new Date(body.date) : new Date(),
        supplierId: body.supplierId,
        receiptUrl: body.receiptUrl,
        notes: body.notes || "",
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "expense.create",
      entity: "Expense",
      entityId: expense.id,
      newValue: { category, amount },
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    console.error("Admin expense create failed:", error)
    return NextResponse.json({ error: "Could not create expense." }, { status: 500 })
  }
}
