import { NextResponse } from "next/server"
import {
  OrderStatus,
  PaymentRecordStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client"
import { requireAdminSession } from "@/lib/admin/auth"
import { addDays, endOfDay, startOfDay, startOfMonth, startOfYear } from "@/lib/admin/helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

async function sumAmountPaid(where: Prisma.OrderWhereInput) {
  const agg = await prisma.order.aggregate({
    where: {
      ...where,
      paymentStatus: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] },
    },
    _sum: { amountPaid: true },
  })
  return agg._sum.amountPaid ?? 0
}

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const yesterdayStart = startOfDay(addDays(now, -1))
    const yesterdayEnd = endOfDay(addDays(now, -1))
    const weekStart = startOfDay(addDays(now, -6))
    const monthStart = startOfMonth(now)
    const prevMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    const prevMonthEnd = endOfDay(new Date(monthStart.getTime() - 1))
    const ytdStart = startOfYear(now)
    const chartStart = startOfDay(addDays(now, -29))
    const upcomingEnd = endOfDay(addDays(now, 14))

    const [
      revenueToday,
      revenueYesterday,
      revenueWeek,
      revenueMonth,
      revenuePreviousMonth,
      revenueYtd,
      completedAgg,
      paidOrdersCount,
      ordersByStatus,
      paymentsAwaiting,
      ordersDueToday,
      overdueUnpaid,
      lowStockItems,
      upcoming,
      chartOrders,
      newOrdersToday,
      deliveriesToday,
      collectionsToday,
    ] = await Promise.all([
      sumAmountPaid({ createdAt: { gte: todayStart, lte: todayEnd } }),
      sumAmountPaid({ createdAt: { gte: yesterdayStart, lte: yesterdayEnd } }),
      sumAmountPaid({ createdAt: { gte: weekStart, lte: todayEnd } }),
      sumAmountPaid({ createdAt: { gte: monthStart, lte: todayEnd } }),
      sumAmountPaid({ createdAt: { gte: prevMonthStart, lte: prevMonthEnd } }),
      sumAmountPaid({ createdAt: { gte: ytdStart, lte: todayEnd } }),
      prisma.order.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.count({
        where: { paymentStatus: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] } },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.payment.count({
        where: { status: PaymentRecordStatus.VERIFICATION_REQUIRED },
      }),
      prisma.order.count({
        where: {
          requiredDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
      }),
      prisma.order.count({
        where: {
          requiredDate: { lt: todayStart },
          paymentStatus: { notIn: [PaymentStatus.PAID, PaymentStatus.REFUNDED] },
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.COMPLETED],
          },
        },
      }),
      prisma.$queryRaw<
        Array<{
          id: string
          name: string
          sku: string
          quantity: number
          minStock: number
          unit: string
        }>
      >`SELECT id, name, sku, quantity, "minStock", unit FROM "InventoryItem" WHERE quantity <= "minStock" ORDER BY quantity ASC LIMIT 20`,
      prisma.order.findMany({
        where: {
          requiredDate: { gte: todayStart, lte: upcomingEnd },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          items: { select: { name: true, quantity: true, kind: true } },
        },
        orderBy: { requiredDate: "asc" },
        take: 50,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: chartStart, lte: todayEnd } },
        select: { createdAt: true, amountPaid: true, paymentStatus: true, total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.order.count({
        where: {
          fulfillment: "delivery",
          requiredDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
      }),
      prisma.order.count({
        where: {
          fulfillment: "pickup",
          requiredDate: { gte: todayStart, lte: todayEnd },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
      }),
    ])

    const paidSum =
      (await prisma.order.aggregate({
        where: { paymentStatus: { in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_PAID] } },
        _sum: { amountPaid: true },
      }))._sum.amountPaid ?? 0
    const aov = paidOrdersCount > 0 ? paidSum / paidOrdersCount : 0

    const dailyMap = new Map<string, { date: string; revenue: number; orders: number }>()
    for (let i = 0; i < 30; i++) {
      const d = startOfDay(addDays(chartStart, i))
      const key = d.toISOString().slice(0, 10)
      dailyMap.set(key, { date: key, revenue: 0, orders: 0 })
    }
    for (const order of chartOrders) {
      const key = startOfDay(order.createdAt).toISOString().slice(0, 10)
      const row = dailyMap.get(key)
      if (!row) continue
      row.orders += 1
      if (
        order.paymentStatus === PaymentStatus.PAID ||
        order.paymentStatus === PaymentStatus.PARTIALLY_PAID
      ) {
        row.revenue += order.amountPaid
      }
    }

    return NextResponse.json({
      revenue: {
        today: revenueToday,
        yesterday: revenueYesterday,
        week: revenueWeek,
        month: revenueMonth,
        previousMonth: revenuePreviousMonth,
        ytd: revenueYtd,
        aov: Math.round(aov * 100) / 100,
        completedTotal: completedAgg._sum.total ?? 0,
        completedCount: completedAgg._count,
      },
      ordersByStatus: Object.fromEntries(
        ordersByStatus.map((row) => [row.status, row._count._all]),
      ),
      urgent: {
        paymentsAwaitingVerification: paymentsAwaiting,
        ordersDueToday,
        overdueUnpaid,
        lowStock: lowStockItems,
      },
      upcoming: upcoming.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        requiredDate: order.requiredDate,
        requiredTime: order.requiredTime,
        total: order.total,
        fulfillment: order.fulfillment,
        customer: order.customer
          ? {
              id: order.customer.id,
              name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
              email: order.customer.email,
              phone: order.customer.phone,
            }
          : {
              name: `${order.customerFirstName} ${order.customerLastName}`.trim(),
              email: order.customerEmail,
              phone: order.customerPhone,
            },
        productSummary: order.items.map((i) => `${i.quantity}× ${i.name}`).join(", "),
      })),
      charts: {
        daily: Array.from(dailyMap.values()),
      },
      today: {
        newOrders: newOrdersToday,
        deliveries: deliveriesToday,
        collections: collectionsToday,
      },
    })
  } catch (error) {
    console.error("Admin dashboard failed:", error)
    return NextResponse.json({ error: "Could not load dashboard." }, { status: 500 })
  }
}
