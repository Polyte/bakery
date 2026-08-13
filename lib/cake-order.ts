export type FillingId = "strawberry" | "caramel" | "chocolate" | "vanilla"

export type Filling = {
  id: FillingId
  name: string
  description: string
  price: number
  image: string
  badge?: string
  badgeTone?: "popular" | "signature" | "included"
}

export const FILLINGS: Filling[] = [
  {
    id: "strawberry",
    name: "Fresh Strawberry Compote",
    description: "Made with hand-picked local strawberries, slowly simmered to preserve their bright, tart flavor.",
    price: 45,
    image: "/shop/filling-strawberry.jpg",
    badge: "Popular",
    badgeTone: "popular",
  },
  {
    id: "caramel",
    name: "Salted Caramel Drip",
    description: "Our signature house-made deep amber caramel finished with a delicate hint of fleur de sel.",
    price: 55,
    image: "/shop/filling-caramel.jpg",
    badge: "Signature",
    badgeTone: "signature",
  },
  {
    id: "chocolate",
    name: "Belgian Chocolate Ganache",
    description: "Rich, velvety 70% dark chocolate whipped to silky perfection for the ultimate indulgence.",
    price: 50,
    image: "/shop/filling-chocolate.jpg",
  },
  {
    id: "vanilla",
    name: "Madagascar Vanilla Cream",
    description: "Smooth, aromatic pastry cream infused heavily with premium Madagascar vanilla beans.",
    price: 0,
    image: "/shop/filling-vanilla.jpg",
    badge: "Included",
    badgeTone: "included",
  },
]

export const DECORATIONS = ["Gold Leaf Accents", "Fresh Cream Roses", "Custom Acrylic Topper"] as const

export const TIME_SLOT = "10:00 AM - 12:00 PM"
export const PICKUP_ADDRESS = "6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, Pretoria"
export const MESSAGE_CARD_PRICE = 75

export type CakeCategoryId = "wedding" | "birthday" | "anniversary" | "children" | "corporate"

export const CAKE_CATEGORY_LABELS: Record<CakeCategoryId, string> = {
  wedding: "Wedding Cakes",
  birthday: "Birthday Cakes",
  anniversary: "Anniversary Cakes",
  children: "Children's Cakes",
  corporate: "Corporate Cakes",
}

export type CatalogLineItem = {
  id: string
  name: string
  price: number
  qty: number
  image?: string
  kind?: string
}

export type CakeDraft = {
  productName: string
  productImage: string
  sizeLabel: string
  serves: string
  sizePrice: number
  flavorLabel: string
  category: CakeCategoryId | null
  fillingId: FillingId | null
  decorations: string[]
  delivery: "pickup" | "delivery"
  deliveryFee: number
  deliveryKm: number | null
  deliveryLat: number | null
  deliveryLng: number | null
  date: string
  timeSlot: string
  notes: string
  messageCard: boolean
  cardMessage: string
  contactPref: "call" | "whatsapp"
  address: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    /** ISO date YYYY-MM-DD for birthday wishes + annual offer */
    birthday: string
  }
  paymentMethod: "yoco" | "eft"
  orderNumber: string | null
  confirmedAt: string | null
  extras: CatalogLineItem[]
}

export const STORAGE_KEY = "dadda-cake-order"
export const LAST_ORDER_KEY = "dadda-last-order"

export function defaultDraft(): CakeDraft {
  return {
    productName: "15cm Fondant Cake",
    productImage: "/shop/signature-cake.jpg",
    sizeLabel: "15cm fondant",
    serves: "Serves 8–12",
    sizePrice: 1050,
    flavorLabel: "Classic Vanilla Bean",
    category: null,
    fillingId: null,
    decorations: [...DECORATIONS],
    delivery: "pickup",
    deliveryFee: 0,
    deliveryKm: null,
    deliveryLat: null,
    deliveryLng: null,
    date: nextSaturdayISO(),
    timeSlot: TIME_SLOT,
    notes: "",
    messageCard: false,
    cardMessage: "",
    contactPref: "whatsapp",
    address: "",
    customer: { firstName: "", lastName: "", email: "", phone: "", birthday: "" },
    paymentMethod: "yoco",
    orderNumber: null,
    confirmedAt: null,
    extras: [],
  }
}

export function getFilling(id: FillingId | null) {
  return FILLINGS.find((f) => f.id === id) ?? null
}

export function fillingPrice(draft: CakeDraft) {
  return getFilling(draft.fillingId)?.price ?? 0
}

export function subtotal(draft: CakeDraft) {
  return draft.sizePrice + fillingPrice(draft)
}

export function extrasList(draft: CakeDraft) {
  return draft.extras ?? []
}

export function extrasTotal(draft: CakeDraft) {
  return extrasList(draft).reduce((sum, item) => sum + item.price * item.qty, 0)
}

export function extrasCount(draft: CakeDraft) {
  return extrasList(draft).reduce((sum, item) => sum + item.qty, 0)
}

/** Cake stays in the total unless the cart is extras-only (no filling chosen). */
export function includeCakeInTotal(draft: CakeDraft) {
  if (draft.category) return true
  return draft.fillingId !== null || extrasCount(draft) === 0
}

export function cartCount(draft: CakeDraft) {
  return extrasCount(draft) + (draft.category ? 1 : 0)
}

/** Use the in-flight cart when it still has items so an older snapshot is not shown. */
export function displayConfirmedOrder(draft: CakeDraft, lastOrder: CakeDraft | null): CakeDraft {
  if (cartCount(draft) > 0) return draft
  if (draft.orderNumber && draft.orderNumber !== lastOrder?.orderNumber) return draft
  return lastOrder ?? draft
}

export function extraKindLabel(item: CatalogLineItem) {
  if (item.kind) return item.kind
  if (item.id.startsWith("popsticle")) return "Popsticles"
  if (item.id.startsWith("cupcake")) return "Cupcakes"
  if (item.id.startsWith("scone")) return "Scones"
  if (item.id.startsWith("treat-")) return "Treats"
  return "Cakes"
}

export function cakeLineTotal(draft: CakeDraft) {
  return includeCakeInTotal(draft) ? subtotal(draft) : 0
}

export function deliveryAmount(draft: CakeDraft) {
  return draft.delivery === "delivery" ? draft.deliveryFee : 0
}

export function messageCardAmount(draft: CakeDraft) {
  return draft.messageCard ? MESSAGE_CARD_PRICE : 0
}

export function isDeliveryReady(draft: CakeDraft) {
  if (draft.delivery !== "delivery") return true
  return Boolean(draft.address.trim() && draft.deliveryKm != null && draft.deliveryFee > 0)
}

export function deliveryPatchFromSelection(selection: {
  delivery: "pickup" | "delivery"
  address: string
  deliveryLat: number | null
  deliveryLng: number | null
  deliveryKm: number | null
  deliveryFee: number
}): Partial<CakeDraft> {
  if (selection.delivery === "pickup") {
    return {
      delivery: "pickup",
      address: "",
      deliveryFee: 0,
      deliveryKm: null,
      deliveryLat: null,
      deliveryLng: null,
    }
  }
  return {
    delivery: "delivery",
    address: selection.address,
    deliveryFee: selection.deliveryFee,
    deliveryKm: selection.deliveryKm,
    deliveryLat: selection.deliveryLat,
    deliveryLng: selection.deliveryLng,
  }
}

export function grandTotal(draft: CakeDraft) {
  return cakeLineTotal(draft) + extrasTotal(draft) + deliveryAmount(draft) + messageCardAmount(draft)
}

export function formatRand(amount: number) {
  return `R${amount.toFixed(2)}`
}

export function formatLongDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatCalendarDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function generateOrderNumber() {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `#DC-${n}`
}

function nextSaturdayISO() {
  const d = new Date()
  const day = d.getDay()
  const add = day === 6 ? 7 : (6 - day + 7) % 7 || 7
  d.setDate(d.getDate() + add)
  return d.toISOString().slice(0, 10)
}
