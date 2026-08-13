import { NextResponse } from "next/server"
import { InvoiceStatus, Prisma } from "@prisma/client"
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
    const status = searchParams.get("status") as InvoiceStatus | null
    const q = searchParams.get("q")?.trim() || ""

    const where: Prisma.InvoiceWhereInput = {}
    if (status && Object.values(InvoiceStatus).includes(status)) where.status = status
    if (q) {
      where.OR = [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { customer: { email: { contains: q, mode: "insensitive" } } },
        { customer: { firstName: { contains: q, mode: "insensitive" } } },
        { customer: { lastName: { contains: q, mode: "insensitive" } } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin invoices list failed:", error)
    return NextResponse.json({ error: "Could not load invoices." }, { status: 500 })
  }
}
