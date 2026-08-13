import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
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
    const q = searchParams.get("q")?.trim() || ""
    const lowStock = searchParams.get("lowStock") === "true"

    const where: Prisma.InventoryItemWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}

    let items = await prisma.inventoryItem.findMany({
      where,
      include: { supplier: true },
      orderBy: { name: "asc" },
      skip: lowStock ? undefined : skip,
      take: lowStock ? undefined : take,
    })

    if (lowStock) {
      items = items.filter((item) => item.quantity <= item.minStock)
      const total = items.length
      items = items.slice(skip, skip + take)
      return NextResponse.json({
        items,
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize) || 1,
      })
    }

    const total = await prisma.inventoryItem.count({ where })
    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin inventory list failed:", error)
    return NextResponse.json({ error: "Could not load inventory." }, { status: 500 })
  }
}

type CreateBody = {
  name?: string
  sku?: string
  unit?: string
  quantity?: number
  minStock?: number
  costPerUnit?: number
  supplierId?: string | null
  expiryDate?: string | null
  batchNumber?: string
  notes?: string
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
    const sku = body.sku?.trim() || `ING-${Date.now()}`
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        sku,
        unit: body.unit || "g",
        quantity: body.quantity ?? 0,
        minStock: body.minStock ?? 0,
        costPerUnit: body.costPerUnit ?? 0,
        supplierId: body.supplierId || null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        batchNumber: body.batchNumber,
        notes: body.notes || "",
      },
      include: { supplier: true },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "inventory.create",
      entity: "InventoryItem",
      entityId: item.id,
      newValue: { name: item.name, sku: item.sku },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Admin inventory create failed:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "SKU already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Could not create inventory item." }, { status: 500 })
  }
}
