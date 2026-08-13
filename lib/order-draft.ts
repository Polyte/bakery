import { z } from "zod"
import { type CakeDraft, defaultDraft } from "@/lib/cake-order"
import { deliveryFeeFromKm, MAX_DELIVERY_KM } from "@/lib/delivery"

const extrasSchema = z.object({
  id: z.string().max(80),
  name: z.string().max(200),
  price: z.number().finite().min(0).max(20_000),
  qty: z.number().finite().min(0).max(200),
  image: z.string().max(500).optional(),
  kind: z.string().max(40).optional(),
})

const draftSchema = z.object({
  productName: z.string().max(200).default(""),
  productImage: z.string().max(500).default(""),
  sizeLabel: z.string().max(80).default(""),
  serves: z.string().max(80).default(""),
  sizePrice: z.number().finite().min(0).max(50_000).default(0),
  flavorLabel: z.string().max(120).default(""),
  category: z.enum(["wedding", "birthday", "anniversary", "children", "corporate"]).nullable().default(null),
  fillingId: z.enum(["strawberry", "caramel", "chocolate", "vanilla"]).nullable().default(null),
  decorations: z.array(z.string().max(80)).max(20).default([]),
  delivery: z.enum(["pickup", "delivery"]),
  deliveryFee: z.number().finite().min(0).max(MAX_DELIVERY_KM * 5).default(0),
  deliveryKm: z.number().finite().min(0).max(500).nullable().default(null),
  deliveryLat: z.number().finite().nullable().default(null),
  deliveryLng: z.number().finite().nullable().default(null),
  date: z.string().max(32).default(""),
  timeSlot: z.string().max(80).default(""),
  notes: z.string().max(2000).default(""),
  messageCard: z.boolean().default(false),
  cardMessage: z.string().max(500).default(""),
  contactPref: z.enum(["call", "whatsapp"]).default("whatsapp"),
  address: z.string().max(400).default(""),
  customer: z.object({
    firstName: z.string().max(80).default(""),
    lastName: z.string().max(80).default(""),
    email: z.string().max(254).default(""),
    phone: z.string().max(40).default(""),
    birthday: z.string().max(32).default(""),
  }),
  paymentMethod: z.enum(["yoco", "eft"]).default("yoco"),
  orderNumber: z.string().max(40).regex(/^[\w#.-]*$/).nullable().default(null),
  confirmedAt: z.string().max(40).nullable().default(null),
  extras: z.array(extrasSchema).max(50).default([]),
})

export function sanitizeCakeDraft(input: unknown): CakeDraft | null {
  const parsed = draftSchema.safeParse(input)
  if (!parsed.success) return null

  const data = parsed.data
  const base = defaultDraft()
  const next: CakeDraft = {
    ...base,
    ...data,
    customer: {
      ...base.customer,
      ...data.customer,
    },
    extras: data.extras
      .filter((item) => item.qty >= 1)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: Math.floor(item.qty),
        image: item.image,
        kind: item.kind,
      })),
  }

  if (next.delivery === "pickup") {
    next.deliveryFee = 0
    next.deliveryKm = null
    next.deliveryLat = null
    next.deliveryLng = null
    next.address = ""
    return next
  }

  if (next.deliveryKm == null || next.deliveryKm > MAX_DELIVERY_KM) return null
  next.deliveryFee = deliveryFeeFromKm(next.deliveryKm)
  return next
}
