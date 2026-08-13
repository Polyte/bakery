"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatZAR } from "@/lib/format"

type Order = {
  id: string
  orderNumber: string
  status: string
  requiredDate?: string | null
  requiredTime?: string | null
  total: number
  customerFirstName?: string
  customerLastName?: string
  customer?: { firstName?: string; lastName?: string } | null
  fulfillment?: string
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function customerName(o: Order) {
  const first = o.customer?.firstName || o.customerFirstName || ""
  const last = o.customer?.lastName || o.customerLastName || ""
  return `${first} ${last}`.trim() || "—"
}

export default function CalendarPage() {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-calendar", monthKey(cursor)],
    queryFn: async () => {
      // Fetch a large page; filter client-side by requiredDate in month
      const res = await fetch(`/api/admin/orders?pageSize=100`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return (body.items || []) as Order[]
    },
  })

  const grouped = React.useMemo(() => {
    const map = new Map<string, Order[]>()
    const start = from.getTime()
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).getTime()
    for (const order of data || []) {
      if (!order.requiredDate) continue
      const d = new Date(order.requiredDate)
      const t = d.getTime()
      if (t < start || t > end) continue
      const key = d.toISOString().slice(0, 10)
      const list = map.get(key) || []
      list.push(order)
      map.set(key, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [data, from, to])

  const label = cursor.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Orders grouped by required date."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const n = new Date()
                setCursor(new Date(n.getFullYear(), n.getMonth(), 1))
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
              }
            >
              Next
            </Button>
          </div>
        }
      />

      <h2 className="font-display text-xl font-semibold text-chocolate-text">{label}</h2>

      {isError ? (
        <EmptyState
          title="Couldn’t load calendar"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : grouped.length === 0 ? (
        <EmptyState
          title="No dated orders this month"
          description="Orders with a required date will appear here."
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, orders]) => (
            <Card key={date} className="border-outline-variant/50">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">
                  {formatDate(date)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {orders.length} order{orders.length === 1 ? "" : "s"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low/40 px-3 py-2"
                  >
                    <div>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-dadda-primary hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {customerName(o)}
                        {o.requiredTime ? ` · ${o.requiredTime}` : ""}
                        {o.fulfillment ? ` · ${o.fulfillment}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-sm">{formatZAR(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
