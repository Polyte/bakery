import type { CakeCategoryId, CakeDraft, CatalogLineItem } from "@/lib/cake-order"
import { cakeLineTotal, extrasList, extraKindLabel, includeCakeInTotal } from "@/lib/cake-order"

/** Birthday returning-customer offer (percent off). */
export const BIRTHDAY_DISCOUNT_PERCENT = 10
export const BIRTHDAY_PROMO_CODE = "BIRTHDAY10"

/**
 * Loyalty points earned per R1 spent, by product category / line kind.
 * Higher for celebration cakes; treats earn a little less.
 */
export const LOYALTY_POINTS_PER_RAND: Record<string, number> = {
  wedding: 0.15,
  birthday: 0.12,
  anniversary: 0.12,
  children: 0.12,
  corporate: 0.1,
  cakes: 0.1,
  cupcakes: 0.08,
  popsticles: 0.06,
  scones: 0.05,
  treats: 0.05,
  filling: 0.04,
  addon: 0.04,
  fee: 0,
  delivery: 0,
  default: 0.05,
}

export function normalizeLoyaltyCategory(raw: string | null | undefined): string {
  if (!raw?.trim()) return "default"
  const key = raw.trim().toLowerCase()
  if (key in LOYALTY_POINTS_PER_RAND) return key
  if (key.includes("wedding")) return "wedding"
  if (key.includes("birthday")) return "birthday"
  if (key.includes("anniversary")) return "anniversary"
  if (key.includes("children") || key.includes("kids")) return "children"
  if (key.includes("corporate")) return "corporate"
  if (key.includes("cupcake")) return "cupcakes"
  if (key.includes("popsticle") || key.includes("popsicle")) return "popsticles"
  if (key.includes("scone")) return "scones"
  if (key.includes("treat")) return "treats"
  if (key.includes("cake")) return "cakes"
  if (key.includes("filling")) return "filling"
  return "default"
}

export function pointsRateForCategory(category: string | null | undefined) {
  const key = normalizeLoyaltyCategory(category)
  return LOYALTY_POINTS_PER_RAND[key] ?? LOYALTY_POINTS_PER_RAND.default
}

export function pointsForAmount(amount: number, category: string | null | undefined) {
  if (amount <= 0) return 0
  return Math.floor(amount * pointsRateForCategory(category))
}

export type LoyaltyLineEarn = {
  category: string
  label: string
  amount: number
  points: number
}

export function loyaltyEarnFromDraft(draft: CakeDraft): {
  lines: LoyaltyLineEarn[]
  totalPoints: number
} {
  const lines: LoyaltyLineEarn[] = []

  if (includeCakeInTotal(draft)) {
    const category = (draft.category as CakeCategoryId | null) || "cakes"
    const amount = cakeLineTotal(draft)
    const points = pointsForAmount(amount, category)
    if (points > 0) {
      lines.push({
        category: normalizeLoyaltyCategory(category),
        label: draft.productName || "Cake",
        amount,
        points,
      })
    }
  }

  for (const item of extrasList(draft)) {
    const category = normalizeLoyaltyCategory(item.kind || extraKindLabel(item))
    const amount = item.price * item.qty
    const points = pointsForAmount(amount, category)
    if (points > 0) {
      lines.push({
        category,
        label: item.name,
        amount,
        points,
      })
    }
  }

  const totalPoints = lines.reduce((sum, line) => sum + line.points, 0)
  return { lines, totalPoints }
}

/** MM-DD from ISO date string or Date (local calendar day). */
export function birthdayMonthDay(value: string | Date | null | undefined): string | null {
  if (!value) return null
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return `${m[2]}-${m[3]}`
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
  }
  return `${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`
}

export function isBirthdayToday(birthday: string | Date | null | undefined, now = new Date()) {
  const md = birthdayMonthDay(birthday)
  if (!md) return false
  const today = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  return md === today
}

export function isBirthdayThisMonth(birthday: string | Date | null | undefined, now = new Date()) {
  const md = birthdayMonthDay(birthday)
  if (!md) return false
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return md.startsWith(`${month}-`)
}

export function parseBirthdayInput(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatBirthdayInput(value: string | Date | null | undefined): string {
  if (!value) return ""
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/)
    return m ? m[1] : ""
  }
  return value.toISOString().slice(0, 10)
}

export function loyaltyCategoryFromOrderItem(item: {
  kind?: string | null
  customisation?: string | null
  name?: string
}): string {
  if (item.kind) {
    const fromKind = normalizeLoyaltyCategory(item.kind)
    if (fromKind !== "default") return fromKind
  }
  try {
    const custom = item.customisation ? (JSON.parse(item.customisation) as { category?: string }) : null
    if (custom?.category) return normalizeLoyaltyCategory(custom.category)
  } catch {
    /* ignore */
  }
  return normalizeLoyaltyCategory(item.name)
}

export function pointsForOrderItems(
  items: Array<{ kind?: string | null; customisation?: string | null; name?: string; totalPrice: number }>,
) {
  return items.reduce((sum, item) => {
    if (item.kind === "fee" || item.kind === "delivery") return sum
    return sum + pointsForAmount(item.totalPrice, loyaltyCategoryFromOrderItem(item))
  }, 0)
}

export function catalogLineLoyaltyPreview(item: CatalogLineItem) {
  const category = normalizeLoyaltyCategory(item.kind || extraKindLabel(item))
  return pointsForAmount(item.price * item.qty, category)
}
