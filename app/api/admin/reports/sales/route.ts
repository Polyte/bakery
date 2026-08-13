import { NextResponse } from "next/server"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { endOfDay, startOfDay } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const now = new Date()
    const from = fromParam ? startOfDay(new Date(fromParam)) : startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
    const to = toParam ? endOfDay(new Date(toParam)) : endOfDay(now)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.FAILED] },
      },
      include: {
        items: { select: { name: true, quantity: true, totalPrice: true, kind: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    const expenses = await prisma.expense.findMany({
      where: { date: { gte: from, lte: to } },
    })

    const revenuePaid = orders
      .filter(
        (o) =>
          o.paymentStatus === PaymentStatus.PAID ||
          o.paymentStatus === PaymentStatus.PARTIALLY_PAID,
      )
      .reduce((sum, o) => sum + o.amountPaid, 0)

    const revenueTotal = orders.reduce((sum, o) => sum + o.total, 0)
    const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

    const byDay = new Map<string, { date: string; orders: number; revenue: number; total: number }>()
    for (const order of orders) {
      const key = startOfDay(order.createdAt).toISOString().slice(0, 10)
      const row = byDay.get(key) || { date: key, orders: 0, revenue: 0, total: 0 }
      row.orders += 1
      row.total += order.total
      if (
        order.paymentStatus === PaymentStatus.PAID ||
        order.paymentStatus === PaymentStatus.PARTIALLY_PAID
      ) {
        row.revenue += order.amountPaid
      }
      byDay.set(key, row)
    }

    const byStatus: Record<string, number> = {}
    const byPaymentStatus: Record<string, number> = {}
    for (const order of orders) {
      byStatus[order.status] = (byStatus[order.status] || 0) + 1
      byPaymentStatus[order.paymentStatus] = (byPaymentStatus[order.paymentStatus] || 0) + 1
    }

    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.name
        const row = productSales.get(key) || { name: item.name, quantity: 0, revenue: 0 }
        row.quantity += item.quantity
        row.revenue += item.totalPrice
        productSales.set(key, row)
      }
    }

    return NextResponse.json({
      range: { from, to },
      summary: {
        orderCount: orders.length,
        revenuePaid,
        revenueTotal,
        expenseTotal,
        net: revenuePaid - expenseTotal,
        aov: orders.length ? revenueTotal / orders.length : 0,
      },
      byDay: Array.from(byDay.values()),
      byStatus,
      byPaymentStatus,
      topProducts: Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 20),
      expenses,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        status: o.status,
        paymentStatus: o.paymentStatus,
        total: o.total,
        amountPaid: o.amountPaid,
        customer: o.customer
          ? `${o.customer.firstName} ${o.customer.lastName}`.trim()
          : `${o.customerFirstName} ${o.customerLastName}`.trim(),
      })),
    })
  } catch (error) {
    console.error("Admin sales report failed:", error)
    return NextResponse.json({ error: "Could not load sales report." }, { status: 500 })
  }
}
