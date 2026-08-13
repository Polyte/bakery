const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateShort = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const dateLong = new Intl.DateTimeFormat("en-ZA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
})

const dateTime = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function toDate(value: string | number | Date) {
  if (value instanceof Date) return value
  if (typeof value === "number") return new Date(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`)
  }
  return new Date(value)
}

export function formatZAR(n: number) {
  if (!Number.isFinite(n)) return zar.format(0)
  return zar.format(n)
}

export function formatDate(value: string | number | Date | null | undefined) {
  if (value == null || value === "") return "—"
  const d = toDate(value)
  if (Number.isNaN(d.getTime())) return "—"
  return dateShort.format(d)
}

export function formatDateLong(value: string | number | Date | null | undefined) {
  if (value == null || value === "") return "—"
  const d = toDate(value)
  if (Number.isNaN(d.getTime())) return "—"
  return dateLong.format(d)
}

export function formatDateTime(value: string | number | Date | null | undefined) {
  if (value == null || value === "") return "—"
  const d = toDate(value)
  if (Number.isNaN(d.getTime())) return "—"
  return dateTime.format(d)
}
