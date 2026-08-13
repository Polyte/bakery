import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { parsePageParams } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

const STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.MANAGER,
  UserRole.SALES,
  UserRole.PRODUCTION,
  UserRole.FINANCE,
  UserRole.MARKETING,
  UserRole.DELIVERY,
]

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = parsePageParams(searchParams)
    const q = searchParams.get("q")?.trim() || ""
    const includeCustomers = searchParams.get("includeCustomers") === "true"

    const where = {
      ...(includeCustomers ? {} : { role: { in: STAFF_ROLES } }),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" as const } },
              { firstName: { contains: q, mode: "insensitive" as const } },
              { lastName: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: [{ role: "asc" }, { firstName: "asc" }],
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin users list failed:", error)
    return NextResponse.json({ error: "Could not load users." }, { status: 500 })
  }
}
