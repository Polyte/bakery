import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const items = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Admin testimonials list failed:", error)
    return NextResponse.json({ error: "Could not load testimonials." }, { status: 500 })
  }
}

type Body = {
  id?: string
  customerName?: string
  customerType?: string
  body?: string
  photo?: string | null
  rating?: number
  isFeatured?: boolean
  isPublished?: boolean
  delete?: boolean
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let payload: Body
  try {
    payload = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    if (payload.id && payload.delete) {
      await prisma.testimonial.delete({ where: { id: payload.id } })
      return NextResponse.json({ ok: true })
    }

    if (payload.id) {
      const item = await prisma.testimonial.update({
        where: { id: payload.id },
        data: {
          customerName: payload.customerName,
          customerType: payload.customerType,
          body: payload.body,
          photo: payload.photo,
          rating: payload.rating,
          isFeatured: payload.isFeatured,
          isPublished: payload.isPublished,
        },
      })
      return NextResponse.json({ item })
    }

    if (!payload.customerName?.trim() || !payload.body?.trim()) {
      return NextResponse.json({ error: "customerName and body are required." }, { status: 400 })
    }

    const item = await prisma.testimonial.create({
      data: {
        customerName: payload.customerName,
        customerType: payload.customerType || "",
        body: payload.body,
        photo: payload.photo,
        rating: payload.rating ?? 5,
        isFeatured: payload.isFeatured ?? false,
        isPublished: payload.isPublished ?? false,
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "cms.testimonial.create",
      entity: "Testimonial",
      entityId: item.id,
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Admin testimonial write failed:", error)
    return NextResponse.json({ error: "Could not save testimonial." }, { status: 500 })
  }
}
