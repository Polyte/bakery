import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const items = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Admin gallery list failed:", error)
    return NextResponse.json({ error: "Could not load gallery." }, { status: 500 })
  }
}

type Body = {
  reorder?: Array<{ id: string; sortOrder: number }>
  id?: string
  url?: string
  thumbnail?: string | null
  caption?: string
  alt?: string
  category?: string
  tags?: string
  isFeatured?: boolean
  isPublished?: boolean
  sortOrder?: number
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
          prisma.galleryImage.update({
            where: { id: row.id },
            data: { sortOrder: row.sortOrder },
          }),
        ),
      )
      const items = await prisma.galleryImage.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      })
      return NextResponse.json({ items })
    }

    if (body.id && body.delete) {
      await prisma.galleryImage.delete({ where: { id: body.id } })
      return NextResponse.json({ ok: true })
    }

    if (body.id) {
      const item = await prisma.galleryImage.update({
        where: { id: body.id },
        data: {
          url: body.url,
          thumbnail: body.thumbnail,
          caption: body.caption,
          alt: body.alt,
          category: body.category,
          tags: body.tags,
          isFeatured: body.isFeatured,
          isPublished: body.isPublished,
          sortOrder: body.sortOrder,
        },
      })
      return NextResponse.json({ item })
    }

    if (!body.url?.trim()) {
      return NextResponse.json({ error: "url is required." }, { status: 400 })
    }

    const item = await prisma.galleryImage.create({
      data: {
        url: body.url,
        thumbnail: body.thumbnail,
        caption: body.caption || "",
        alt: body.alt || "",
        category: body.category || "events",
        tags: body.tags || "[]",
        isFeatured: body.isFeatured ?? false,
        isPublished: body.isPublished ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "cms.gallery.create",
      entity: "GalleryImage",
      entityId: item.id,
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Admin gallery write failed:", error)
    return NextResponse.json({ error: "Could not save gallery image." }, { status: 500 })
  }
}
