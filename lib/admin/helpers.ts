import { PaymentStatus } from "@prisma/client"

export function derivePaymentStatus(total: number, amountPaid: number): PaymentStatus {
  const paid = Math.round(amountPaid * 100) / 100
  const due = Math.round(total * 100) / 100
  if (paid <= 0) return PaymentStatus.UNPAID
  if (paid + 0.009 >= due) return PaymentStatus.PAID
  return PaymentStatus.PARTIALLY_PAID
}

export function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function endOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function startOfYear(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1)
}

export function parsePageParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20) || 20))
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}
