import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { slugify } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const items = await prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    })
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Admin categories list failed:", error)
    return NextResponse.json({ error: "Could not load categories." }, { status: 500 })
  }
}

type CreateBody = {
  name?: string
  slug?: string
  description?: string
  image?: string | null
  sortOrder?: number
  isActive?: boolean
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 })

  try {
    const baseSlug = slugify(body.slug || name) || `category-${Date.now()}`
    let slug = baseSlug
    const existing = await prisma.productCategory.findUnique({ where: { slug } })
    if (existing) slug = `${baseSlug}-${Date.now().toString(36)}`

    const category = await prisma.productCategory.create({
      data: {
        name,
        slug,
        description: body.description || "",
        image: body.image ?? null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "category.create",
      entity: "ProductCategory",
      entityId: category.id,
      newValue: { name: category.name, slug: category.slug },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Admin category create failed:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Could not create category." }, { status: 500 })
  }
}
