import {
  OrderStatus,
  PaymentStatus,
  UserRole,
  type Prisma,
} from "@prisma/client"
import {
  type CakeDraft,
  cakeLineTotal,
  deliveryAmount,
  extrasList,
  fillingPrice,
  getFilling,
  grandTotal,
  includeCakeInTotal,
  messageCardAmount,
  MESSAGE_CARD_PRICE,
  subtotal,
} from "@/lib/cake-order"
import { allocateOrderNumber, createNotification } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"
import { loyaltyEarnFromDraft, parseBirthdayInput } from "@/lib/loyalty"
import { awardLoyaltyPointsForOrder } from "@/lib/loyalty-award"
import { sanitizeCakeDraft } from "@/lib/order-draft"

const STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.MANAGER,
  UserRole.SALES,
  UserRole.PRODUCTION,
  UserRole.FINANCE,
  UserRole.MARKETING,
  UserRole.DELIVERY,
]

function parseRequiredDate(iso: string | null | undefined): Date | null {
  if (!iso?.trim()) return null
  const d = new Date(`${iso.trim()}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function buildOrderItems(draft: CakeDraft): Prisma.OrderItemCreateWithoutOrderInput[] {
  const items: Prisma.OrderItemCreateWithoutOrderInput[] = []
  const filling = getFilling(draft.fillingId)

  if (includeCakeInTotal(draft)) {
    items.push({
      name: draft.productName || "Custom cake",
      image: draft.productImage || null,
      quantity: 1,
      unitPrice: draft.sizePrice,
      totalPrice: draft.sizePrice,
      kind: "cake",
      customisation: JSON.stringify({
        size: draft.sizeLabel,
        serves: draft.serves,
        flavour: draft.flavorLabel,
        category: draft.category,
        decorations: draft.decorations,
        fillingId: draft.fillingId,
        filling: filling?.name ?? null,
        fillingPrice: fillingPrice(draft),
        messageCard: draft.messageCard,
        cardMessage: draft.cardMessage,
        notes: draft.notes,
      }),
    })

    if (filling && filling.price > 0) {
      items.push({
        name: filling.name,
        image: filling.image,
        quantity: 1,
        unitPrice: filling.price,
        totalPrice: filling.price,
        kind: "filling",
        customisation: JSON.stringify({ fillingId: filling.id }),
      })
    }
  }

  for (const extra of extrasList(draft)) {
    items.push({
      name: extra.name,
      image: extra.image ?? null,
      quantity: extra.qty,
      unitPrice: extra.price,
      totalPrice: extra.price * extra.qty,
      kind: extra.kind || "addon",
      sku: extra.id,
      customisation: JSON.stringify({ catalogId: extra.id }),
    })
  }

  const fee = deliveryAmount(draft)
  if (fee > 0) {
    items.push({
      name: "Delivery",
      quantity: 1,
      unitPrice: fee,
      totalPrice: fee,
      kind: "fee",
      customisation: JSON.stringify({
        km: draft.deliveryKm,
        address: draft.address,
      }),
    })
  }

  const card = messageCardAmount(draft)
  if (card > 0) {
    items.push({
      name: "Message card",
      quantity: 1,
      unitPrice: MESSAGE_CARD_PRICE,
      totalPrice: card,
      kind: "addon",
      customisation: JSON.stringify({ message: draft.cardMessage }),
    })
  }

  return items
}

export async function persistOrderFromDraft(raw: CakeDraft) {
  const draft = sanitizeCakeDraft(raw)
  if (!draft) throw new Error("Invalid order details.")

  const email = draft.customer.email.trim().toLowerCase()
  if (!email) throw new Error("Customer email is required.")

  const firstName = draft.customer.firstName.trim() || "Customer"
  const lastName = draft.customer.lastName.trim() || ""
  const phone = draft.customer.phone.trim()
  const total = grandTotal(draft)
  const cakeSub = cakeLineTotal(draft)
  const extrasSub = extrasList(draft).reduce((sum, item) => sum + item.price * item.qty, 0)
  const orderSubtotal = cakeSub + extrasSub + messageCardAmount(draft)
  const deliveryFee = deliveryAmount(draft)
  const items = buildOrderItems(draft)

  const orderNumber =
    draft.orderNumber?.trim() ||
    (await allocateOrderNumber())

  const birthday = parseBirthdayInput(draft.customer.birthday)
  const { lines: loyaltyLines, totalPoints: loyaltyPointsEarned } = loyaltyEarnFromDraft(draft)

  const customer = await prisma.customer.upsert({
    where: { email },
    create: {
      email,
      firstName,
      lastName,
      phone,
      birthday: birthday ?? undefined,
      preferredContact: draft.contactPref === "call" ? "call" : "whatsapp",
      orderCount: 1,
      lifetimeSpend: 0,
      loyaltyPoints: 0,
    },
    update: {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
      ...(birthday ? { birthday } : {}),
      preferredContact: draft.contactPref === "call" ? "call" : "whatsapp",
      orderCount: { increment: 1 },
    },
  })

  const existing = await prisma.order.findUnique({ where: { orderNumber } })
  if (existing) {
    return existing
  }

  const paymentStatus =
    draft.paymentMethod === "yoco" ? PaymentStatus.AWAITING_PAYMENT : PaymentStatus.AWAITING_PAYMENT

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      status: OrderStatus.NEW,
      paymentStatus,
      fulfillment: draft.delivery === "delivery" ? "delivery" : "pickup",
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: email,
      customerPhone: phone,
      requiredDate: parseRequiredDate(draft.date),
      requiredTime: draft.timeSlot || null,
      deliveryAddress: draft.delivery === "delivery" ? draft.address : null,
      deliveryFee,
      deliveryKm: draft.deliveryKm,
      deliveryLat: draft.deliveryLat,
      deliveryLng: draft.deliveryLng,
      subtotal: orderSubtotal || subtotal(draft),
      total,
      depositRequired: Math.round(total * 50) / 100,
      amountPaid: 0,
      paymentMethod: draft.paymentMethod,
      paymentReference: orderNumber,
      customerNotes: draft.notes || "",
      source: "website",
      confirmedAt: draft.confirmedAt ? new Date(draft.confirmedAt) : new Date(),
      customisation: JSON.stringify({
        productName: draft.productName,
        sizeLabel: draft.sizeLabel,
        flavorLabel: draft.flavorLabel,
        category: draft.category,
        fillingId: draft.fillingId,
        decorations: draft.decorations,
        messageCard: draft.messageCard,
        cardMessage: draft.cardMessage,
        contactPref: draft.contactPref,
        birthday: draft.customer.birthday || null,
        loyaltyPointsEarned,
      }),
      items: { create: items },
      statusHistory: {
        create: {
          toStatus: OrderStatus.NEW,
          note: "Order placed on website",
          changedBy: "website",
        },
      },
    },
    include: { items: true },
  })

  if (loyaltyPointsEarned > 0) {
    await awardLoyaltyPointsForOrder({
      customerId: customer.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      lines: loyaltyLines,
    })
  }

  const staff = await prisma.user.findMany({
    where: { isActive: true, role: { in: STAFF_ROLES } },
    select: { id: true },
  })

  await Promise.all(
    staff.map((user) =>
      createNotification({
        userId: user.id,
        title: `New order ${order.orderNumber}`,
        body: `${firstName} ${lastName} · R${total.toFixed(2)}`.trim(),
        type: "order",
        href: `/admin/orders/${order.id}`,
      }),
    ),
  )

  return order
}
