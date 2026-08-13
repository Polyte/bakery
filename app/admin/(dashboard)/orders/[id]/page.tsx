"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Mail, MessageCircle, Phone } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatDateTime, formatZAR } from "@/lib/format"
import { ORDER_STATUS_LABELS } from "@/lib/admin/labels"
import type { OrderStatus } from "@prisma/client"

type OrderDetail = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: string
  fulfillment: string
  customerId?: string | null
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  requiredDate?: string | null
  requiredTime?: string | null
  deliveryAddress?: string | null
  deliveryFee: number
  subtotal: number
  discount: number
  tax: number
  total: number
  depositRequired: number
  amountPaid: number
  paymentMethod?: string | null
  customerNotes?: string
  internalNotes?: string
  createdAt: string
  customer?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    whatsapp?: string | null
  } | null
  items: Array<{
    id: string
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    kind?: string
    customisation?: string
  }>
  payments: Array<{
    id: string
    paymentNumber: string
    amount: number
    method: string
    status: string
    reference?: string | null
    createdAt: string
  }>
  statusHistory: Array<{
    id: string
    fromStatus?: string | null
    toStatus: string
    note?: string | null
    createdAt: string
  }>
}

function whatsappHref(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  const normalized = digits.startsWith("0") ? `27${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`
}

async function fetchOrder(id: string): Promise<OrderDetail> {
  const res = await fetch(`/api/admin/orders/${id}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || "Failed to load order")
  return body.order
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const queryClient = useQueryClient()
  const [statusNote, setStatusNote] = React.useState("")
  const [nextStatus, setNextStatus] = React.useState<string>("")
  const [payOpen, setPayOpen] = React.useState(false)
  const [payForm, setPayForm] = React.useState({
    amount: "",
    method: "eft",
    reference: "",
    notes: "",
  })

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => fetchOrder(id),
  })

  React.useEffect(() => {
    if (order?.status) setNextStatus(order.status)
  }, [order?.status])

  const statusMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note: statusNote || undefined }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to update status")
      return body
    },
    onSuccess: () => {
      setStatusNote("")
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
  })

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order?.id,
          customerId: order?.customerId || order?.customer?.id,
          amount: Number(payForm.amount),
          method: payForm.method,
          reference: payForm.reference || order?.orderNumber,
          notes: payForm.notes,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to record payment")
      return body
    },
    onSuccess: () => {
      setPayOpen(false)
      setPayForm({ amount: "", method: "eft", reference: "", notes: "" })
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, { method: "POST" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to verify payment")
      return body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Order not found"
        description={error instanceof Error ? error.message : "This order could not be loaded."}
        action={{ label: "Back to orders", href: "/admin/orders" }}
      />
    )
  }

  const name =
    `${order.customer?.firstName || order.customerFirstName} ${order.customer?.lastName || order.customerLastName}`.trim()
  const email = order.customer?.email || order.customerEmail
  const phone = order.customer?.whatsapp || order.customer?.phone || order.customerPhone
  const wa = whatsappHref(
    phone,
    `Hi ${order.customerFirstName || "there"}, regarding your Dadda's order ${order.orderNumber}:`,
  )
  const balance = Math.max(0, Math.round((order.total - order.amountPaid) * 100) / 100)

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">All orders</Link>
            </Button>
            {email ? (
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${email}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`}>
                  <Mail className="mr-1.5 h-4 w-4" />
                  Email
                </a>
              </Button>
            ) : null}
            {wa ? (
              <Button asChild variant="outline" size="sm">
                <a href={wa} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1.5 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            ) : null}
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                  Record payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record payment</DialogTitle>
                  <DialogDescription>
                    Balance due: {formatZAR(balance)}. EFT payments require verification.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={payForm.amount}
                      onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder={String(balance || order.depositRequired || "")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Method</Label>
                    <Select
                      value={payForm.method}
                      onValueChange={(v) => setPayForm((f) => ({ ...f, method: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eft">EFT</SelectItem>
                        <SelectItem value="yoco">Yoco</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={payForm.reference}
                      onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))}
                      placeholder={order.orderNumber}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={payForm.notes}
                      onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  {paymentMutation.isError ? (
                    <p className="text-sm text-destructive">
                      {paymentMutation.error instanceof Error
                        ? paymentMutation.error.message
                        : "Error"}
                    </p>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPayOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-dadda-primary hover:bg-dadda-primary-dark"
                    disabled={paymentMutation.isPending || !payForm.amount}
                    onClick={() => paymentMutation.mutate()}
                  >
                    {paymentMutation.isPending ? "Saving…" : "Save payment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus} kind="payment" />
        <span className="text-sm capitalize text-muted-foreground">{order.fulfillment}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-outline-variant/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">Line items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {item.quantity}× {item.name}
                  </p>
                  {item.kind ? (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.kind}
                    </p>
                  ) : null}
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium tabular-nums">{formatZAR(item.totalPrice)}</p>
                  <p className="text-muted-foreground">{formatZAR(item.unitPrice)} each</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-outline-variant/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Payment summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatZAR(order.subtotal)} />
            <Row label="Delivery" value={formatZAR(order.deliveryFee)} />
            <Row label="Discount" value={formatZAR(order.discount)} />
            <Row label="Tax" value={formatZAR(order.tax)} />
            <Row label="Total" value={formatZAR(order.total)} bold />
            <Row label="Deposit required" value={formatZAR(order.depositRequired)} />
            <Row label="Amount paid" value={formatZAR(order.amountPaid)} />
            <Row label="Balance" value={formatZAR(balance)} bold />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-outline-variant/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Customer</CardTitle>
            <CardDescription>Contact & fulfilment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">
              {order.customerId ? (
                <Link href={`/admin/customers/${order.customerId}`} className="text-dadda-primary hover:underline">
                  {name || "—"}
                </Link>
              ) : (
                name || "—"
              )}
            </p>
            {email ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </p>
            ) : null}
            {phone ? (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </p>
            ) : null}
            <div className="border-t border-border pt-3">
              <p>
                <span className="text-muted-foreground">Required: </span>
                {formatDate(order.requiredDate)}
                {order.requiredTime ? ` · ${order.requiredTime}` : ""}
              </p>
              {order.deliveryAddress ? (
                <p className="mt-1">
                  <span className="text-muted-foreground">Address: </span>
                  {order.deliveryAddress}
                </p>
              ) : null}
              {order.customerNotes ? (
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-container-low/50 p-3">
                  {order.customerNotes}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-outline-variant/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Update status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={nextStatus} onValueChange={setNextStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Optional note for history…"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={2}
            />
            {statusMutation.isError ? (
              <p className="text-sm text-destructive">
                {statusMutation.error instanceof Error ? statusMutation.error.message : "Error"}
              </p>
            ) : null}
            <Button
              className="bg-dadda-primary hover:bg-dadda-primary-dark"
              disabled={statusMutation.isPending || nextStatus === order.status}
              onClick={() => statusMutation.mutate()}
            >
              {statusMutation.isPending ? "Updating…" : "Save status"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-outline-variant/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded.</p>
            ) : (
              order.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low/40 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.paymentNumber} · {formatZAR(p.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.method} · {formatDateTime(p.createdAt)}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} kind="payment" />
                    {p.status === "VERIFICATION_REQUIRED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={verifyMutation.isPending}
                        onClick={() => verifyMutation.mutate(p.id)}
                      >
                        Verify
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-outline-variant/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Status history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history yet.</p>
            ) : (
              order.statusHistory.map((h) => (
                <div key={h.id} className="border-l-2 border-dadda-primary/30 pl-3">
                  <p className="text-sm font-medium">
                    {h.fromStatus
                      ? `${ORDER_STATUS_LABELS[h.fromStatus as OrderStatus] || h.fromStatus} → `
                      : ""}
                    {ORDER_STATUS_LABELS[h.toStatus as OrderStatus] || h.toStatus}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(h.createdAt)}</p>
                  {h.note ? <p className="mt-1 text-sm text-muted-foreground">{h.note}</p> : null}
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</span>
    </div>
  )
}
