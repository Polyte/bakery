import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const items = await prisma.heroSlide.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Admin hero list failed:", error)
    return NextResponse.json({ error: "Could not load hero slides." }, { status: 500 })
  }
}

type Body = {
  reorder?: Array<{ id: string; sortOrder: number }>
  id?: string
  heading?: string
  subheading?: string
  ctaText?: string
  ctaUrl?: string
  desktopImage?: string
  mobileImage?: string | null
  isActive?: boolean
  startsAt?: string | null
  endsAt?: string | null
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
          prisma.heroSlide.update({
            where: { id: row.id },
            data: { sortOrder: row.sortOrder },
          }),
        ),
      )
      const items = await prisma.heroSlide.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      })
      await writeAuditLog({
        userId: session!.id,
        action: "cms.hero.reorder",
        entity: "HeroSlide",
        newValue: body.reorder,
      })
      return NextResponse.json({ items })
    }

    if (body.id && body.delete) {
      await prisma.heroSlide.delete({ where: { id: body.id } })
      return NextResponse.json({ ok: true })
    }

    if (body.id) {
      const item = await prisma.heroSlide.update({
        where: { id: body.id },
        data: {
          heading: body.heading,
          subheading: body.subheading,
          ctaText: body.ctaText,
          ctaUrl: body.ctaUrl,
          desktopImage: body.desktopImage,
          mobileImage: body.mobileImage,
          isActive: body.isActive,
          startsAt: body.startsAt === undefined ? undefined : body.startsAt ? new Date(body.startsAt) : null,
          endsAt: body.endsAt === undefined ? undefined : body.endsAt ? new Date(body.endsAt) : null,
          sortOrder: body.sortOrder,
        },
      })
      return NextResponse.json({ item })
    }

    if (!body.desktopImage?.trim()) {
      return NextResponse.json({ error: "desktopImage is required." }, { status: 400 })
    }

    const item = await prisma.heroSlide.create({
      data: {
        heading: body.heading || "",
        subheading: body.subheading || "",
        ctaText: body.ctaText || "",
        ctaUrl: body.ctaUrl || "",
        desktopImage: body.desktopImage,
        mobileImage: body.mobileImage,
        isActive: body.isActive ?? true,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        sortOrder: body.sortOrder ?? 0,
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "cms.hero.create",
      entity: "HeroSlide",
      entityId: item.id,
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Admin hero write failed:", error)
    return NextResponse.json({ error: "Could not save hero slides." }, { status: 500 })
  }
}
