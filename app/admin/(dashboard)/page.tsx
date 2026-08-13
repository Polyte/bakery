"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  CalendarDays,
  PackagePlus,
  Receipt,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { PageHeader } from "@/components/admin/page-header"
import { MetricCard } from "@/components/admin/metric-card"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatDate, formatZAR } from "@/lib/format"
import { ORDER_STATUS_LABELS } from "@/lib/admin/labels"

export type DashboardData = {
  revenue?: {
    today?: number
    yesterday?: number
    week?: number
    month?: number
    previousMonth?: number
    ytd?: number
    aov?: number
  }
  ordersByStatus?: Array<{ status: string; count: number }> | Record<string, number>
  urgent?: {
    paymentsVerification?: number
    paymentsAwaitingVerification?: number
    ordersDueToday?: number
    overdueUnpaid?: number
    lowStock?: number
    lowStockInventory?: number
  }
  upcoming?: Array<{
    id: string
    orderNumber: string
    customerName?: string
    customer?: { firstName?: string; lastName?: string } | null
    customerFirstName?: string
    customerLastName?: string
    productSummary?: string
    summary?: string
    requiredDate?: string | null
    total?: number
    status: string
  }>
  charts?: {
    daily?: Array<{ date: string; revenue?: number; orders?: number }>
    revenueSeries?: Array<{ date: string; revenue?: number; orders?: number }>
  }
  today?: {
    newOrders?: number
    deliveries?: number
    collections?: number
  }
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#7d562d",
  },
} satisfies ChartConfig

const quickActions = [
  { href: "/admin/orders/new", label: "New Order", icon: ShoppingBag },
  { href: "/admin/customers/new", label: "New Customer", icon: Users },
  { href: "/admin/products/new", label: "New Product", icon: PackagePlus },
  { href: "/admin/quotes/new", label: "New Quote", icon: Receipt },
  { href: "/admin/payments/new", label: "Record Payment", icon: Wallet },
  { href: "/admin/finance/expenses/new", label: "Record Expense", icon: CalendarDays },
]

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/admin/dashboard")
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(typeof body.error === "string" ? body.error : "Failed to load dashboard")
  }
  return res.json()
}

function customerLabel(row: NonNullable<DashboardData["upcoming"]>[number]) {
  if (row.customerName) return row.customerName
  const first = row.customerFirstName || row.customer?.firstName || ""
  const last = row.customerLastName || row.customer?.lastName || ""
  const name = `${first} ${last}`.trim()
  return name || "—"
}

function normalizeStatusCounts(
  input: DashboardData["ordersByStatus"]
): Array<{ status: string; count: number }> {
  if (!input) return []
  if (Array.isArray(input)) return input
  return Object.entries(input).map(([status, count]) => ({ status, count: Number(count) || 0 }))
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchDashboard,
  })

  const revenue = data?.revenue
  const urgent = data?.urgent
  const paymentsVerification =
    urgent?.paymentsVerification ?? urgent?.paymentsAwaitingVerification ?? 0
  const ordersDueToday = urgent?.ordersDueToday ?? 0
  const lowStock = urgent?.lowStock ?? urgent?.lowStockInventory ?? 0
  const upcoming = data?.upcoming ?? []
  const series =
    data?.charts?.daily ?? data?.charts?.revenueSeries ?? []
  const statusCounts = normalizeStatusCounts(data?.ordersByStatus)

  const columns: DataTableColumn<(typeof upcoming)[number]>[] = [
    {
      key: "orderNumber",
      header: "Order",
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-medium text-dadda-primary hover:underline"
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) => customerLabel(row),
    },
    {
      key: "summary",
      header: "Items",
      cell: (row) => (
        <span className="line-clamp-1 max-w-[14rem] text-muted-foreground">
          {row.productSummary || row.summary || "—"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Due",
      cell: (row) => formatDate(row.requiredDate),
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      cell: (row) => formatZAR(row.total ?? 0),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="What needs your attention today at Dadda's."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>
        }
      />

      {isError ? (
        <EmptyState
          title="Couldn’t load dashboard"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Urgent attention
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : (
            <>
              <Link href="/admin/payments?status=VERIFICATION_REQUIRED">
                <MetricCard
                  title="Payments to verify"
                  value={paymentsVerification}
                  description="Awaiting verification"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  className={paymentsVerification > 0 ? "border-orange-200 bg-orange-50/40" : undefined}
                />
              </Link>
              <Link href="/admin/orders?due=today">
                <MetricCard
                  title="Orders due today"
                  value={ordersDueToday}
                  description="Pickup & delivery"
                  icon={<CalendarDays className="h-4 w-4" />}
                  className={ordersDueToday > 0 ? "border-amber-200 bg-amber-50/40" : undefined}
                />
              </Link>
              <Link href="/admin/inventory?lowStock=1">
                <MetricCard
                  title="Low stock"
                  value={lowStock}
                  description="At or below minimum"
                  icon={<PackagePlus className="h-4 w-4" />}
                  className={lowStock > 0 ? "border-rose-200 bg-rose-50/40" : undefined}
                />
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Revenue
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : (
            <>
              <MetricCard title="Today" value={formatZAR(revenue?.today ?? 0)} />
              <MetricCard title="This week" value={formatZAR(revenue?.week ?? 0)} />
              <MetricCard title="This month" value={formatZAR(revenue?.month ?? 0)} />
              <MetricCard title="Year to date" value={formatZAR(revenue?.ytd ?? 0)} />
              <MetricCard title="AOV" value={formatZAR(revenue?.aov ?? 0)} description="Average order value" />
            </>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-outline-variant/50 xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">Revenue (30 days)</CardTitle>
            <CardDescription>Paid & partially paid amounts by day</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[240px] w-full rounded-lg" />
            ) : series.length === 0 ? (
              <EmptyState
                title="No revenue data yet"
                description="Once payments are recorded, the chart will appear here."
                className="py-8"
              />
            ) : (
              <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
                <AreaChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={28}
                    tickFormatter={(v) => formatDate(v)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(v) => `R${Number(v).toLocaleString("en-ZA")}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(v) => formatDate(String(v))}
                        formatter={(value) => (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {formatZAR(Number(value))}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    fill="url(#fillRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-outline-variant/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Orders by status</CardTitle>
            <CardDescription>Current pipeline snapshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
            ) : statusCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              statusCounts
                .slice()
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map((row) => (
                  <div
                    key={row.status}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low/50 px-3 py-2"
                  >
                    <span className="text-sm">
                      {ORDER_STATUS_LABELS[row.status as keyof typeof ORDER_STATUS_LABELS] ||
                        row.status}
                    </span>
                    <span className="font-semibold tabular-nums text-dadda-primary">{row.count}</span>
                  </div>
                ))
            )}
            {!isLoading && data?.today ? (
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <p className="text-lg font-semibold tabular-nums">{data.today.newOrders ?? 0}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">New</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">{data.today.deliveries ?? 0}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Deliveries</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">{data.today.collections ?? 0}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Collections</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming orders
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/orders">View all</Link>
          </Button>
        </div>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <DataTable
            columns={columns}
            data={upcoming}
            rowKey={(row) => row.id}
            empty={
              <EmptyState
                title="No upcoming orders"
                description="Orders due in the next two weeks will show here."
                className="border-0 bg-transparent py-6"
              />
            }
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-card px-4 py-3 text-sm font-medium shadow-sm transition hover:border-dadda-primary/40 hover:bg-surface-container-low"
              >
                <Icon className="h-4 w-4 text-dadda-primary" />
                {action.label}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
