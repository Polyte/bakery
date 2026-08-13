import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: { status?: string; notes?: string; assignedToId?: string | null }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    const { id } = await params
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
