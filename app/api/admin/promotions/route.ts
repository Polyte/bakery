import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
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
    const q = searchParams.get("q")?.trim() || ""
    const active = searchParams.get("isActive")

    const where: Prisma.PromotionWhereInput = {}
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ]
    }
    if (active === "true") where.isActive = true
    if (active === "false") where.isActive = false

    const [items, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.promotion.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin promotions list failed:", error)
    return NextResponse.json({ error: "Could not load promotions." }, { status: 500 })
  }
}

type CreateBody = {
  name?: string
  code?: string | null
  type?: string
  value?: number
  minOrder?: number | null
  maxDiscount?: number | null
  startsAt?: string | null
  endsAt?: string | null
  usageLimit?: number | null
  customerSegment?: string | null
  isActive?: boolean
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

  const name = body.name?.trim()
  const type = body.type?.trim()
  if (!name || !type) {
    return NextResponse.json({ error: "Name and type are required." }, { status: 400 })
  }

  try {
    const promotion = await prisma.promotion.create({
      data: {
        name,
        code: body.code?.trim() || null,
        type,
        value: Number(body.value) || 0,
        minOrder: body.minOrder ?? null,
        maxDiscount: body.maxDiscount ?? null,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        usageLimit: body.usageLimit ?? null,
        customerSegment: body.customerSegment || null,
        isActive: body.isActive ?? true,
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "promotion.create",
      entity: "Promotion",
      entityId: promotion.id,
      newValue: { name, type, code: promotion.code },
    })

    return NextResponse.json({ promotion }, { status: 201 })
  } catch (error) {
    console.error("Admin promotion create failed:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Promotion code already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Could not create promotion." }, { status: 500 })
  }
}
