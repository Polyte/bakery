/** Client-safe labels — do not import @prisma/client here. */

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  QUOTE_REQUIRED: "Quote required",
  QUOTE_SENT: "Quote sent",
  AWAITING_CUSTOMER_APPROVAL: "Awaiting approval",
  AWAITING_DEPOSIT: "Awaiting deposit",
  PAYMENT_VERIFICATION: "Payment verification",
  CONFIRMED: "Confirmed",
  IN_PRODUCTION: "In production",
  QUALITY_CHECK: "Quality check",
  READY_FOR_COLLECTION: "Ready for collection",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  COLLECTED: "Collected",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  ON_HOLD: "On hold",
  FAILED: "Failed",
}

export const BOARD_COLUMNS = [
  "NEW",
  "AWAITING_DEPOSIT",
  "PAYMENT_VERIFICATION",
  "CONFIRMED",
  "IN_PRODUCTION",
  "QUALITY_CHECK",
  "READY_FOR_COLLECTION",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
] as const

export type BoardColumnStatus = (typeof BOARD_COLUMNS)[number]
