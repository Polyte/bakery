import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { parsePageParams } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = parsePageParams(searchParams)
    const status = searchParams.get("status") || undefined
    const q = searchParams.get("q")?.trim() || ""

    const where: Prisma.DeliveryWhereInput = {}
    if (status) where.status = status
    if (q) {
      where.OR = [
        { address: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { order: { orderNumber: { contains: q, mode: "insensitive" } } },
        {
          order: {
            OR: [
              { customerFirstName: { contains: q, mode: "insensitive" } },
              { customerLastName: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customerFirstName: true,
              customerLastName: true,
              customerPhone: true,
              total: true,
              status: true,
              requiredDate: true,
            },
          },
          driver: { select: { id: true, name: true, phone: true } },
        },
        orderBy: [{ scheduledDate: "asc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.delivery.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin deliveries list failed:", error)
    return NextResponse.json({ error: "Could not load deliveries." }, { status: 500 })
  }
}
