"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { AdminPagination } from "@/components/admin/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatZAR } from "@/lib/format"
import { ORDER_STATUS_LABELS } from "@/lib/admin/labels"
import type { OrderStatus } from "@prisma/client"

type OrderRow = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  customerFirstName?: string
  customerLastName?: string
  customerEmail?: string
  customerPhone?: string
  customer?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  } | null
  requiredDate?: string | null
  createdAt: string
  total: number
  amountPaid?: number
  fulfillment?: string
  items?: Array<{ name: string; quantity: number }>
}

type OrdersResponse = {
  items: OrderRow[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  error?: string
}

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "NEW", label: "New" },
  { value: "AWAITING_DEPOSIT", label: "Awaiting deposit" },
  { value: "PAYMENT_VERIFICATION", label: "Verify payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PRODUCTION", label: "In production" },
  { value: "READY_FOR_COLLECTION", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

function customerName(row: OrderRow) {
  const first = row.customer?.firstName || row.customerFirstName || ""
  const last = row.customer?.lastName || row.customerLastName || ""
  return `${first} ${last}`.trim() || "—"
}

async function fetchOrders(params: URLSearchParams): Promise<OrdersResponse> {
  const res = await fetch(`/api/admin/orders?${params.toString()}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || "Failed to load orders")
  return body
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const status = searchParams.get("status") || "all"
  const qParam = searchParams.get("q") || ""
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
  const [q, setQ] = React.useState(qParam)

  React.useEffect(() => {
    setQ(qParam)
  }, [qParam])

  const queryParams = React.useMemo(() => {
    const p = new URLSearchParams()
    if (status && status !== "all") p.set("status", status)
    if (qParam) p.set("q", qParam)
    p.set("page", String(page))
    p.set("pageSize", "20")
    return p
  }, [status, qParam, page])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders", queryParams.toString()],
    queryFn: () => fetchOrders(queryParams),
  })

  function updateParams(next: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value == null || value === "" || value === "all") p.delete(key)
      else p.set(key, value)
    }
    if (!("page" in next)) p.delete("page")
    router.push(`${pathname}?${p.toString()}`)
  }

  const columns: DataTableColumn<OrderRow>[] = [
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
      cell: (row) => (
        <div>
          <div className="font-medium">{customerName(row)}</div>
          <div className="text-xs text-muted-foreground">
            {row.customer?.email || row.customerEmail || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (row) => (
        <span className="line-clamp-1 max-w-[12rem] text-sm text-muted-foreground">
          {(row.items || []).map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "requiredDate",
      header: "Due",
      cell: (row) => formatDate(row.requiredDate),
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
        title="Orders"
        description="Manage all bakery orders, payments, and fulfilment."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders/board">Board</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </>
        }
      />

      <Tabs
        value={status}
        onValueChange={(value) => updateParams({ status: value, page: null })}
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-surface-container-low/60 p-1">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          updateParams({ q: q.trim() || null, page: null })
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order #, name, email, phone…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load orders"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            rowKey={(row) => row.id}
            empty={
              <EmptyState
                title="No orders found"
                description={
                  status !== "all"
                    ? `No orders with status “${ORDER_STATUS_LABELS[status as OrderStatus] || status}”.`
                    : "Orders will appear here once placed."
                }
                className="border-0 bg-transparent py-6"
              />
            }
          />
          <AdminPagination
            page={data?.page ?? page}
            pageCount={data?.pageCount ?? 1}
            total={data?.total}
            onPageChange={(next) => updateParams({ page: String(next) })}
            disabled={isFetching}
          />
        </>
      )}
    </div>
  )
}
