"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { PageHeader } from "@/components/admin/page-header"
import { MetricCard } from "@/components/admin/metric-card"
import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatDate, formatZAR } from "@/lib/format"

type SalesReport = {
  summary: {
    orderCount: number
    revenuePaid: number
    revenueTotal: number
    expenseTotal: number
    net: number
    aov: number
  }
  byDay: Array<{ date: string; orders: number; revenue: number; total: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
}

const revenueConfig = {
  revenue: { label: "Revenue", color: "#7d562d" },
} satisfies ChartConfig

const ordersConfig = {
  orders: { label: "Orders", color: "#a67c52" },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const defaultTo = now.toISOString().slice(0, 10)
  const [from, setFrom] = React.useState(defaultFrom)
  const [to, setTo] = React.useState(defaultTo)
  const [applied, setApplied] = React.useState({ from: defaultFrom, to: defaultTo })

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-sales-report", applied.from, applied.to],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/reports/sales?from=${applied.from}&to=${applied.to}`,
      )
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load report")
      return body as SalesReport
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales analytics"
        description="Revenue, orders, and top products."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
        }
      />

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          setApplied({ from, to })
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Apply
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load report"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            ) : (
              <>
                <MetricCard title="Orders" value={data?.summary.orderCount ?? 0} />
                <MetricCard
                  title="Revenue paid"
                  value={formatZAR(data?.summary.revenuePaid ?? 0)}
                />
                <MetricCard
                  title="Order total"
                  value={formatZAR(data?.summary.revenueTotal ?? 0)}
                />
                <MetricCard title="Expenses" value={formatZAR(data?.summary.expenseTotal ?? 0)} />
                <MetricCard title="Net" value={formatZAR(data?.summary.net ?? 0)} />
              </>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-outline-variant/50">
              <CardHeader>
                <CardTitle className="font-display text-xl">Revenue by day</CardTitle>
                <CardDescription>Paid amounts in selected range</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[240px] w-full" />
                ) : !(data?.byDay.length) ? (
                  <EmptyState title="No data" className="border-0 py-8" />
                ) : (
                  <ChartContainer config={revenueConfig} className="aspect-auto h-[260px] w-full">
                    <AreaChart data={data.byDay}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatDate(v)}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={64}
                        tickFormatter={(v) => `R${Number(v).toLocaleString("en-ZA")}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        fill="var(--color-revenue)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-outline-variant/50">
              <CardHeader>
                <CardTitle className="font-display text-xl">Orders by day</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[240px] w-full" />
                ) : !(data?.byDay.length) ? (
                  <EmptyState title="No data" className="border-0 py-8" />
                ) : (
                  <ChartContainer config={ordersConfig} className="aspect-auto h-[260px] w-full">
                    <BarChart data={data.byDay}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatDate(v)}
                      />
                      <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-outline-variant/50">
            <CardHeader>
              <CardTitle className="font-display text-xl">Top products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : !(data?.topProducts.length) ? (
                <p className="text-sm text-muted-foreground">No product sales in range.</p>
              ) : (
                data.topProducts.slice(0, 10).map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low/50 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.quantity} sold</p>
                    </div>
                    <span className="tabular-nums font-medium">{formatZAR(p.revenue)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
