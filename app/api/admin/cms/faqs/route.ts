import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const items = await prisma.faq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Admin faqs list failed:", error)
    return NextResponse.json({ error: "Could not load FAQs." }, { status: 500 })
  }
}

type Body = {
  reorder?: Array<{ id: string; sortOrder: number }>
  id?: string
  question?: string
  answer?: string
  category?: string
  sortOrder?: number
  isPublished?: boolean
  delete?: boolean
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    if (Array.isArray(body.reorder)) {
      await prisma.$transaction(
        body.reorder.map((row) =>
          prisma.faq.update({
            where: { id: row.id },
            data: { sortOrder: row.sortOrder },
          }),
        ),
      )
      const items = await prisma.faq.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      })
      return NextResponse.json({ items })
    }

    if (body.id && body.delete) {
      await prisma.faq.delete({ where: { id: body.id } })
      return NextResponse.json({ ok: true })
    }

    if (body.id) {
      const item = await prisma.faq.update({
        where: { id: body.id },
        data: {
          question: body.question,
          answer: body.answer,
          category: body.category,
          sortOrder: body.sortOrder,
          isPublished: body.isPublished,
        },
      })
      return NextResponse.json({ item })
    }

    if (!body.question?.trim() || !body.answer?.trim()) {
      return NextResponse.json({ error: "question and answer are required." }, { status: 400 })
    }

    const item = await prisma.faq.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category || "general",
        sortOrder: body.sortOrder ?? 0,
        isPublished: body.isPublished ?? true,
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "cms.faq.create",
      entity: "Faq",
      entityId: item.id,
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Admin faq write failed:", error)
    return NextResponse.json({ error: "Could not save FAQ." }, { status: 500 })
  }
}
