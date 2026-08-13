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

    const where: Prisma.CustomerWhereInput = q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          tagAssignments: { include: { tag: true } },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize) || 1,
    })
  } catch (error) {
    console.error("Admin customers list failed:", error)
    return NextResponse.json({ error: "Could not load customers." }, { status: 500 })
  }
}

type CreateBody = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  whatsapp?: string
  company?: string
  preferredContact?: string
  marketingConsent?: boolean
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

  const email = body.email?.trim().toLowerCase()
  const firstName = body.firstName?.trim()
  if (!email || !firstName) {
    return NextResponse.json({ error: "Email and first name are required." }, { status: 400 })
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        email,
        firstName,
        lastName: body.lastName?.trim() || "",
        phone: body.phone?.trim() || "",
        whatsapp: body.whatsapp?.trim() || null,
        company: body.company?.trim() || null,
        preferredContact: body.preferredContact || "whatsapp",
        marketingConsent: Boolean(body.marketingConsent),
        notes: body.notes || "",
      },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "customer.create",
      entity: "Customer",
      entityId: customer.id,
      newValue: { email: customer.email },
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error("Admin customer create failed:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A customer with that email already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Could not create customer." }, { status: 500 })
  }
}
