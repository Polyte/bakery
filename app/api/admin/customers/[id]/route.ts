import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        tagAssignments: { include: { tag: true } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            items: { select: { name: true, quantity: true, totalPrice: true } },
          },
        },
        quotes: { orderBy: { createdAt: "desc" }, take: 20 },
        invoices: { orderBy: { createdAt: "desc" }, take: 20 },
        payments: { orderBy: { createdAt: "desc" }, take: 20 },
        communications: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    })
    if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 })

    const paidAgg = await prisma.order.aggregate({
      where: { customerId: id },
      _sum: { total: true, amountPaid: true },
      _count: true,
      _avg: { total: true },
    })

    return NextResponse.json({
      customer,
      stats: {
        orderCount: paidAgg._count,
        lifetimeSpend: customer.lifetimeSpend || paidAgg._sum.amountPaid || 0,
        totalOrdered: paidAgg._sum.total || 0,
        averageOrderValue: paidAgg._avg.total || 0,
      },
    })
  } catch (error) {
    console.error("Admin customer get failed:", error)
    return NextResponse.json({ error: "Could not load customer." }, { status: 500 })
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
    const existing = await prisma.customer.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Customer not found." }, { status: 404 })

    const data: Prisma.CustomerUpdateInput = {}
    const fields = [
      "firstName",
      "lastName",
      "company",
      "phone",
      "whatsapp",
      "preferredContact",
      "marketingConsent",
      "notes",
      "lifetimeSpend",
      "orderCount",
    ] as const
    for (const key of fields) {
      if (key in body) (data as Record<string, unknown>)[key] = body[key]
    }
    if (typeof body.email === "string") data.email = body.email.trim().toLowerCase()
    if (typeof body.birthday === "string" || body.birthday === null) {
      data.birthday = body.birthday ? new Date(String(body.birthday)) : null
    }

    const customer = await prisma.customer.update({ where: { id }, data })

    await writeAuditLog({
      userId: session!.id,
      action: "customer.update",
      entity: "Customer",
      entityId: id,
      previousValue: { email: existing.email },
      newValue: { email: customer.email },
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Admin customer update failed:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A customer with that email already exists." }, { status: 409 })
    }
    return NextResponse.json({ error: "Could not update customer." }, { status: 500 })
  }
}
