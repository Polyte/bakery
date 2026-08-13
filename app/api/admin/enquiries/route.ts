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
    const status = searchParams.get("status") || undefined
    const q = searchParams.get("q")?.trim() || ""

    const where: {
      status?: string
      OR?: Array<Record<string, unknown>>
    } = {}
    if (status) where.status = status
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.contactEnquiry.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.contactEnquiry.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin enquiries list failed:", error)
    return NextResponse.json({ error: "Could not load enquiries." }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  const id = new URL(request.url).searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Query parameter id is required." }, { status: 400 })
  }

  let body: { status?: string; notes?: string; assignedToId?: string | null }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    const existing = await prisma.contactEnquiry.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 })

    const enquiry = await prisma.contactEnquiry.update({
      where: { id },
      data: {
        status: body.status ?? existing.status,
        notes: body.notes ?? existing.notes,
        assignedToId: body.assignedToId === undefined ? existing.assignedToId : body.assignedToId,
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "enquiry.update",
      entity: "ContactEnquiry",
      entityId: id,
      previousValue: { status: existing.status },
      newValue: { status: enquiry.status },
    })

    return NextResponse.json({ enquiry })
  } catch (error) {
    console.error("Admin enquiry update failed:", error)
    return NextResponse.json({ error: "Could not update enquiry." }, { status: 500 })
  }
}
