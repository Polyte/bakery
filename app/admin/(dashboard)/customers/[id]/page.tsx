"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Mail, MessageCircle, Phone } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/admin/empty-state"
import { MetricCard } from "@/components/admin/metric-card"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatZAR } from "@/lib/format"

type CustomerDetail = {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    whatsapp?: string | null
    company?: string | null
    notes?: string
    birthday?: string | null
    loyaltyPoints?: number
    marketingConsent: boolean
    preferredContact: string
    createdAt: string
    tagAssignments?: Array<{ tag: { id: string; name: string; color: string } }>
    loyaltyLedger?: Array<{
      id: string
      points: number
      balanceAfter: number
      reason: string
      category: string
      note: string
      createdAt: string
    }>
    orders: Array<{
      id: string
      orderNumber: string
      status: string
      paymentStatus: string
      total: number
      requiredDate?: string | null
      createdAt: string
    }>
  }
  stats: {
    orderCount: number
    lifetimeSpend: number
    totalOrdered: number
    averageOrderValue: number
    loyaltyPoints?: number
  }
}

async function fetchCustomer(id: string): Promise<CustomerDetail> {
  const res = await fetch(`/api/admin/customers/${id}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || "Failed to load customer")
  return body
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: () => fetchCustomer(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Customer not found"
        description={error instanceof Error ? error.message : "Could not load profile."}
        action={{ label: "Back", href: "/admin/customers" }}
      />
    )
  }

  const c = data.customer
  const phone = c.whatsapp || c.phone
  const waDigits = phone.replace(/\D/g, "")
  const wa =
    waDigits.length > 0
      ? `https://wa.me/${waDigits.startsWith("0") ? `27${waDigits.slice(1)}` : waDigits}`
      : null

  const columns: DataTableColumn<(typeof c.orders)[number]>[] = [
    {
      key: "order",
      header: "Order",
      cell: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="font-medium text-dadda-primary hover:underline">
          {row.orderNumber}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Due",
      cell: (row) => formatDate(row.requiredDate || row.createdAt),
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      cell: (row) => formatZAR(row.total),
    },
    {
      key: "payment",
      header: "Payment",
      cell: (row) => <StatusBadge status={row.paymentStatus} kind="payment" />,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${c.firstName} ${c.lastName}`.trim()}
        description={c.company || c.email}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/customers">All customers</Link>
            </Button>
            {c.email ? (
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${c.email}`}>
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
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Orders" value={data.stats.orderCount} />
        <MetricCard title="Lifetime spend" value={formatZAR(data.stats.lifetimeSpend)} />
        <MetricCard title="Ordered total" value={formatZAR(data.stats.totalOrdered)} />
        <MetricCard title="AOV" value={formatZAR(data.stats.averageOrderValue)} />
        <MetricCard title="Loyalty points" value={data.stats.loyaltyPoints ?? c.loyaltyPoints ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-outline-variant/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {c.email}
            </p>
            {c.phone ? (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {c.phone}
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">Birthday: </span>
              {c.birthday ? formatDate(c.birthday) : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Loyalty points: </span>
              {c.loyaltyPoints ?? data.stats.loyaltyPoints ?? 0}
            </p>
            <p>
              <span className="text-muted-foreground">Preferred: </span>
              {c.preferredContact}
            </p>
            <p>
              <span className="text-muted-foreground">Marketing: </span>
              {c.marketingConsent ? "Yes" : "No"}
            </p>
            <p>
              <span className="text-muted-foreground">Joined: </span>
              {formatDate(c.createdAt)}
            </p>
            <div className="flex flex-wrap gap-1 pt-2">
              {(c.tagAssignments || []).map((a) => (
                <Badge
                  key={a.tag.id}
                  variant="outline"
                  style={{ borderColor: a.tag.color, color: a.tag.color }}
                >
                  {a.tag.name}
                </Badge>
              ))}
            </div>
            {c.notes ? (
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface-container-low/50 p-3">
                {c.notes}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recent orders
          </h2>
          <DataTable
            columns={columns}
            data={c.orders}
            rowKey={(r) => r.id}
            empty={
              <EmptyState
                title="No orders"
                description="This customer hasn’t placed an order yet."
                className="border-0 bg-transparent py-6"
              />
            }
          />
          {(c.loyaltyLedger?.length ?? 0) > 0 ? (
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Loyalty points history
              </h2>
              <ul className="divide-y divide-outline-variant/40 rounded-xl border border-outline-variant/40 bg-cream-surface">
                {c.loyaltyLedger!.map((row) => (
                  <li key={row.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-chocolate-text">
                        {row.reason === "earn_order"
                          ? "Order earned"
                          : row.reason === "earn_line"
                            ? `Category · ${row.category}`
                            : row.reason}
                      </p>
                      <p className="truncate text-muted-foreground">{row.note || formatDate(row.createdAt)}</p>
                    </div>
                    <span
                      className={
                        row.points >= 0
                          ? "shrink-0 font-semibold text-emerald-700"
                          : "shrink-0 font-semibold text-rose-700"
                      }
                    >
                      {row.points >= 0 ? "+" : ""}
                      {row.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}
