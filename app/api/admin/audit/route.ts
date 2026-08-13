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
    const entity = searchParams.get("entity") || undefined
    const action = searchParams.get("action") || undefined
    const q = searchParams.get("q")?.trim() || ""

    const where: Prisma.AuditLogWhereInput = {}
    if (entity) where.entity = entity
    if (action) where.action = { contains: action, mode: "insensitive" }
    if (q) {
      where.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { entity: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { firstName: { contains: q, mode: "insensitive" } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin audit list failed:", error)
    return NextResponse.json({ error: "Could not load audit logs." }, { status: 500 })
  }
}
