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

    const where: Prisma.CustomCakeRequestWhereInput = {}
    if (status) where.status = status
    if (q) {
      where.OR = [
        { requestNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        { occasion: { contains: q, mode: "insensitive" } },
        { theme: { contains: q, mode: "insensitive" } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.customCakeRequest.findMany({
        where,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.customCakeRequest.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin custom requests list failed:", error)
    return NextResponse.json({ error: "Could not load custom requests." }, { status: 500 })
  }
}
