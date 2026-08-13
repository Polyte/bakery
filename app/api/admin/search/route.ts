import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  const q = new URL(request.url).searchParams.get("q")?.trim() || ""
  if (q.length < 2) {
    return NextResponse.json({
      orders: [],
      customers: [],
      products: [],
      quotes: [],
      invoices: [],
    })
  }

  try {
    const [orders, customers, products, quotes, invoices] = await Promise.all([
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { customerEmail: { contains: q, mode: "insensitive" } },
            { customerFirstName: { contains: q, mode: "insensitive" } },
            { customerLastName: { contains: q, mode: "insensitive" } },
            { customerPhone: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          customerFirstName: true,
          customerLastName: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.findMany({
        where: {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          orderCount: true,
        },
        take: 10,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          image: true,
          isAvailable: true,
        },
        take: 10,
        orderBy: { name: "asc" },
      }),
      prisma.quote.findMany({
        where: {
          OR: [
            { quoteNumber: { contains: q, mode: "insensitive" } },
            { notes: { contains: q, mode: "insensitive" } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
            { customer: { firstName: { contains: q, mode: "insensitive" } } },
            { customer: { lastName: { contains: q, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          total: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true, email: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: q, mode: "insensitive" } },
            { notes: { contains: q, mode: "insensitive" } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
            { customer: { firstName: { contains: q, mode: "insensitive" } } },
            { customer: { lastName: { contains: q, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true, email: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ])

    return NextResponse.json({ orders, customers, products, quotes, invoices })
  } catch (error) {
    console.error("Admin search failed:", error)
    return NextResponse.json({ error: "Search failed." }, { status: 500 })
  }
}
