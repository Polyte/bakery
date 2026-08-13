"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatZAR } from "@/lib/format"
import { ORDER_STATUS_LABELS } from "@/lib/admin/labels"
import type { OrderStatus } from "@prisma/client"

const PRODUCTION_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "IN_PRODUCTION",
  "QUALITY_CHECK",
  "READY_FOR_COLLECTION",
  "OUT_FOR_DELIVERY",
]

type Order = {
  id: string
  orderNumber: string
  status: OrderStatus
  customerFirstName?: string
  customerLastName?: string
  customer?: { firstName?: string; lastName?: string } | null
  requiredDate?: string | null
  requiredTime?: string | null
  total: number
  items?: Array<{ name: string; quantity: number }>
}

function customerName(o: Order) {
  const first = o.customer?.firstName || o.customerFirstName || ""
  const last = o.customer?.lastName || o.customerLastName || ""
  return `${first} ${last}`.trim() || "—"
}

export default function ProductionPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-production"],
    queryFn: async () => {
      const all: Order[] = []
      for (const status of PRODUCTION_STATUSES) {
        const res = await fetch(`/api/admin/orders?status=${status}&pageSize=50`)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error || "Failed to load")
        all.push(...(body.items || []))
      }
      return all
    },
  })

  const moveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to update")
      return body
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-production"] }),
  })

  const byStatus = React.useMemo(() => {
    const map = Object.fromEntries(
      PRODUCTION_STATUSES.map((s) => [s, [] as Order[]]),
    ) as Record<OrderStatus, Order[]>
    for (const order of data || []) {
      if (map[order.status]) map[order.status].push(order)
    }
    return map
  }, [data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production board"
        description="Orders currently in production and fulfilment."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders/board">Full board</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/calendar">Calendar</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              Refresh
            </Button>
          </>
        }
      />

      {isError ? (
        <EmptyState
          title="Couldn’t load production board"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-[480px] w-full rounded-xl" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PRODUCTION_STATUSES.map((status) => (
            <div key={status} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{ORDER_STATUS_LABELS[status]}</h2>
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs tabular-nums">
                  {byStatus[status]?.length || 0}
                </span>
              </div>
              <div className="min-h-[280px] space-y-2 rounded-xl bg-surface-container-low/50 p-2">
                {(byStatus[status] || []).map((order) => (
                  <Card key={order.id} className="border-outline-variant/40 shadow-sm">
                    <CardHeader className="space-y-1 p-3 pb-1">
                      <CardTitle className="text-sm">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-dadda-primary hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{customerName(order)}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-1">
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {(order.items || [])
                          .map((i) => `${i.quantity}× ${i.name}`)
                          .join(", ") || "—"}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span>
                          {formatDate(order.requiredDate)}
                          {order.requiredTime ? ` ${order.requiredTime}` : ""}
                        </span>
                        <span className="tabular-nums">{formatZAR(order.total)}</span>
                      </div>
                      <Select
                        value={order.status}
                        onValueChange={(v) =>
                          moveMutation.mutate({ id: order.id, status: v as OrderStatus })
                        }
                        disabled={moveMutation.isPending}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCTION_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
                {(byStatus[status] || []).length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">Empty</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
