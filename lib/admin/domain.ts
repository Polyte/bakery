import { UserRole, type Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

export { ORDER_STATUS_LABELS, BOARD_COLUMNS } from "@/lib/admin/labels"
export type { AdminSession } from "@/lib/admin/types"

const STAFF_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.MANAGER,
  UserRole.SALES,
  UserRole.PRODUCTION,
  UserRole.FINANCE,
  UserRole.MARKETING,
  UserRole.DELIVERY,
]

export function isStaffRole(role: UserRole) {
  return STAFF_ROLES.includes(role)
}

export async function writeAuditLog(input: {
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  previousValue?: unknown
  newValue?: unknown
  ip?: string | null
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? undefined,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? undefined,
      previousValue: input.previousValue != null ? JSON.stringify(input.previousValue) : undefined,
      newValue: input.newValue != null ? JSON.stringify(input.newValue) : undefined,
      ip: input.ip ?? undefined,
    },
  })
}

export async function createNotification(input: {
  userId?: string | null
  title: string
  body?: string
  type?: string
  href?: string
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId ?? undefined,
      title: input.title,
      body: input.body ?? "",
      type: input.type ?? "info",
      href: input.href,
    },
  })
}

export function outstandingBalance(order: { total: number; amountPaid: number }) {
  return Math.max(0, Math.round((order.total - order.amountPaid) * 100) / 100)
}

export function nextDocumentNumber(prefix: string, seq: number, year = new Date().getFullYear()) {
  return `${prefix}-${year}-${String(seq).padStart(6, "0")}`
}

export async function allocateOrderNumber() {
  const year = new Date().getFullYear()
  const count = await prisma.order.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  })
  return nextDocumentNumber("DAD", count + 1, year)
}

export async function allocateQuoteNumber() {
  const year = new Date().getFullYear()
  const count = await prisma.quote.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  })
  return nextDocumentNumber("QT", count + 1, year)
}

export async function allocateInvoiceNumber() {
  const year = new Date().getFullYear()
  const count = await prisma.invoice.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  })
  return nextDocumentNumber("INV", count + 1, year)
}

export async function allocatePaymentNumber() {
  const year = new Date().getFullYear()
  const count = await prisma.payment.count({
    where: { createdAt: { gte: new Date(`${year}-01-01`) } },
  })
  return nextDocumentNumber("PAY", count + 1, year)
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export function paginate(page: number, pageSize: number): Prisma.OrderFindManyArgs {
  const safePage = Math.max(1, page)
  const safeSize = Math.min(100, Math.max(1, pageSize))
  return {
    skip: (safePage - 1) * safeSize,
    take: safeSize,
  }
}
