import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { slugify } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await params
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }, { sku: id }] },
      include: {
        category: true,
        variants: true,
        options: true,
        images: { orderBy: { sortOrder: "asc" } },
        recipe: { include: { items: { include: { inventoryItem: true } } } },
      },
    })
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error) {
    console.error("Admin product get failed:", error)
    return NextResponse.json({ error: "Could not load product." }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    const { id } = await params
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }, { sku: id }] },
    })
    if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 })

    const data: Prisma.ProductUpdateInput = {}
    const scalars = [
      "name",
      "sku",
      "description",
      "shortDescription",
      "productType",
      "price",
      "salePrice",
      "costPrice",
      "image",
      "gallery",
      "isAvailable",
      "isFeatured",
      "isBestseller",
      "isNew",
      "stockStatus",
      "preparationHours",
      "leadTimeDays",
      "minQty",
      "maxQty",
      "sizeLabel",
      "serves",
      "flavor",
      "sortOrder",
      "seoTitle",
      "seoDescription",
    ] as const
    for (const key of scalars) {
      if (key in body) (data as Record<string, unknown>)[key] = body[key]
    }
    if (typeof body.slug === "string") data.slug = slugify(body.slug) || existing.slug
    if ("categoryId" in body) {
      data.category =
        body.categoryId == null
          ? { disconnect: true }
          : { connect: { id: String(body.categoryId) } }
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data,
      include: { category: true, variants: true, images: true },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "product.update",
      entity: "Product",
      entityId: product.id,
      previousValue: { name: existing.name, price: existing.price },
      newValue: { name: product.name, price: product.price },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Admin product update failed:", error)
    return NextResponse.json({ error: "Could not update product." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await params
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }, { sku: id }] },
    })
    if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 })

    await prisma.product.delete({ where: { id: existing.id } })

    await writeAuditLog({
      userId: session!.id,
      action: "product.delete",
      entity: "Product",
      entityId: existing.id,
      previousValue: { name: existing.name, sku: existing.sku },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Admin product delete failed:", error)
    return NextResponse.json(
      { error: "Could not delete product. It may be referenced by orders." },
      { status: 409 },
    )
  }
}
