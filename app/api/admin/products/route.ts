import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { parsePageParams, slugify } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const { page, pageSize, skip, take } = parsePageParams(searchParams)
    const q = searchParams.get("q")?.trim() || ""
    const categoryId = searchParams.get("categoryId") || undefined
    const available = searchParams.get("isAvailable")

    const where: Prisma.ProductWhereInput = {}
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (available === "true") where.isAvailable = true
    if (available === "false") where.isAvailable = false

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin products list failed:", error)
    return NextResponse.json({ error: "Could not load products." }, { status: 500 })
  }
}

type CreateBody = {
  name?: string
  sku?: string
  slug?: string
  description?: string
  shortDescription?: string
  categoryId?: string | null
  productType?: string
  price?: number
  salePrice?: number | null
  costPrice?: number
  image?: string | null
  gallery?: string
  isAvailable?: boolean
  isFeatured?: boolean
  isBestseller?: boolean
  isNew?: boolean
  stockStatus?: string
  preparationHours?: number
  leadTimeDays?: number
  sizeLabel?: string
  serves?: string
  flavor?: string
  sortOrder?: number
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
  if (!name || body.price == null) {
    return NextResponse.json({ error: "Name and price are required." }, { status: 400 })
  }

  try {
    const baseSlug = slugify(body.slug || name) || `product-${Date.now()}`
    let slug = baseSlug
    let sku = body.sku?.trim() || `SKU-${Date.now()}`

    const existingSlug = await prisma.product.findUnique({ where: { slug } })
    if (existingSlug) slug = `${baseSlug}-${Date.now().toString(36)}`
    const existingSku = await prisma.product.findUnique({ where: { sku } })
    if (existingSku) sku = `SKU-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        slug,
        description: body.description || "",
        shortDescription: body.shortDescription || "",
        categoryId: body.categoryId || null,
        productType: body.productType || "standard",
        price: Number(body.price),
        salePrice: body.salePrice ?? null,
        costPrice: body.costPrice ?? 0,
        image: body.image ?? null,
        gallery: body.gallery || "[]",
        isAvailable: body.isAvailable ?? true,
        isFeatured: body.isFeatured ?? false,
        isBestseller: body.isBestseller ?? false,
        isNew: body.isNew ?? false,
        stockStatus: body.stockStatus || "in_stock",
        preparationHours: body.preparationHours ?? 48,
        leadTimeDays: body.leadTimeDays ?? 2,
        sizeLabel: body.sizeLabel,
        serves: body.serves,
        flavor: body.flavor,
        sortOrder: body.sortOrder ?? 0,
      },
      include: { category: true, variants: true, images: true },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "product.create",
      entity: "Product",
      entityId: product.id,
      newValue: { name: product.name, sku: product.sku },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Admin product create failed:", error)
    return NextResponse.json({ error: "Could not create product." }, { status: 500 })
  }
}
