import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_LABELS } from "@/lib/admin/labels"

const orderStatusStyles: Record<string, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-800",
  QUOTE_REQUIRED: "border-violet-200 bg-violet-50 text-violet-800",
  QUOTE_SENT: "border-violet-200 bg-violet-50 text-violet-800",
  AWAITING_CUSTOMER_APPROVAL: "border-amber-200 bg-amber-50 text-amber-900",
  AWAITING_DEPOSIT: "border-amber-200 bg-amber-50 text-amber-900",
  PAYMENT_VERIFICATION: "border-orange-200 bg-orange-50 text-orange-900",
  CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  IN_PRODUCTION: "border-blue-200 bg-blue-50 text-blue-800",
  QUALITY_CHECK: "border-indigo-200 bg-indigo-50 text-indigo-800",
  READY_FOR_COLLECTION: "border-teal-200 bg-teal-50 text-teal-800",
  OUT_FOR_DELIVERY: "border-cyan-200 bg-cyan-50 text-cyan-800",
  DELIVERED: "border-green-200 bg-green-50 text-green-800",
  COLLECTED: "border-green-200 bg-green-50 text-green-800",
  COMPLETED: "border-emerald-300 bg-emerald-100 text-emerald-900",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-800",
  REFUNDED: "border-rose-200 bg-rose-50 text-rose-800",
  ON_HOLD: "border-stone-200 bg-stone-100 text-stone-700",
  FAILED: "border-red-200 bg-red-50 text-red-800",
}

const paymentStatusStyles: Record<string, string> = {
  UNPAID: "border-stone-200 bg-stone-100 text-stone-700",
  AWAITING_PAYMENT: "border-amber-200 bg-amber-50 text-amber-900",
  PARTIALLY_PAID: "border-orange-200 bg-orange-50 text-orange-900",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REFUNDED: "border-rose-200 bg-rose-50 text-rose-800",
  FAILED: "border-red-200 bg-red-50 text-red-800",
  VERIFICATION_REQUIRED: "border-orange-200 bg-orange-50 text-orange-900",
  PENDING: "border-amber-200 bg-amber-50 text-amber-900",
  SUCCEEDED: "border-emerald-200 bg-emerald-50 text-emerald-800",
}

function humanize(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

type StatusBadgeProps = {
  status: string
  kind?: "order" | "payment"
  className?: string
}

export function StatusBadge({ status, kind = "order", className }: StatusBadgeProps) {
  const styles =
    kind === "payment"
      ? paymentStatusStyles[status] || "border-border bg-muted text-foreground"
      : orderStatusStyles[status] || "border-border bg-muted text-foreground"

  const label =
    kind === "order" && status in ORDER_STATUS_LABELS
      ? ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]
      : humanize(status)

  return (
    <Badge
      variant="outline"
      className={cn("font-medium shadow-none", styles, className)}
    >
      {label}
    </Badge>
  )
}
