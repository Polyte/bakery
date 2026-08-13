import { prisma } from "@/lib/db"
import {
  loyaltyCategoryFromOrderItem,
  pointsForAmount,
  type LoyaltyLineEarn,
} from "@/lib/loyalty"

export async function awardLoyaltyPointsForOrder(input: {
  customerId: string
  orderId: string
  orderNumber: string
  lines: LoyaltyLineEarn[]
}) {
  const totalPoints = input.lines.reduce((sum, line) => sum + line.points, 0)
  if (totalPoints <= 0) return { points: 0, balance: null as number | null }

  const existing = await prisma.loyaltyPointTransaction.findFirst({
    where: { orderId: input.orderId, reason: "earn_order" },
  })
  if (existing) {
    return { points: existing.points, balance: existing.balanceAfter }
  }

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.update({
      where: { id: input.customerId },
      data: { loyaltyPoints: { increment: totalPoints } },
      select: { loyaltyPoints: true },
    })

    // One summary row + per-category breakdown rows for reporting
    await tx.loyaltyPointTransaction.create({
      data: {
        customerId: input.customerId,
        orderId: input.orderId,
        points: totalPoints,
        balanceAfter: customer.loyaltyPoints,
        reason: "earn_order",
        category: "order",
        note: `Earned on ${input.orderNumber}`,
      },
    })

    for (const line of input.lines) {
      if (line.points <= 0) continue
      await tx.loyaltyPointTransaction.create({
        data: {
          customerId: input.customerId,
          orderId: input.orderId,
          points: line.points,
          balanceAfter: customer.loyaltyPoints,
          reason: "earn_line",
          category: line.category,
          note: `${line.label} · R${line.amount.toFixed(2)}`,
        },
      })
    }

    return { points: totalPoints, balance: customer.loyaltyPoints }
  })
}

export async function awardLoyaltyPointsFromOrderItems(input: {
  customerId: string
  orderId: string
  orderNumber: string
  items: Array<{ kind?: string | null; customisation?: string | null; name?: string; totalPrice: number }>
}) {
  const lines: LoyaltyLineEarn[] = input.items
    .filter((item) => item.kind !== "fee" && item.kind !== "delivery")
    .map((item) => {
      const category = loyaltyCategoryFromOrderItem(item)
      return {
        category,
        label: item.name || category,
        amount: item.totalPrice,
        points: pointsForAmount(item.totalPrice, category),
      }
    })
    .filter((line) => line.points > 0)

  return awardLoyaltyPointsForOrder({
    customerId: input.customerId,
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    lines,
  })
}
