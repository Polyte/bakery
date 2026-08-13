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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatZAR } from "@/lib/format"

type Delivery = {
  id: string
  status: string
  address: string
  fee: number
  scheduledDate?: string | null
  scheduledWindow?: string | null
  driver?: { name: string; phone: string } | null
  order: {
    id: string
    orderNumber: string
    customerFirstName: string
    customerLastName: string
    total: number
    status: string
  }
}

type Response = {
  items: Delivery[]
  total: number
  page: number
  pageCount: number
}

export default function DeliveriesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qParam = searchParams.get("q") || ""
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
  const [q, setQ] = React.useState(qParam)

  const params = React.useMemo(() => {
    const p = new URLSearchParams()
    if (qParam) p.set("q", qParam)
    p.set("page", String(page))
    return p
  }, [qParam, page])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-deliveries", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/deliveries?${params}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body as Response
    },
  })

  function updateParams(next: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(next)) {
      if (!v) p.delete(k)
      else p.set(k, v)
    }
    if (!("page" in next)) p.delete("page")
    router.push(`${pathname}?${p}`)
  }

  const columns: DataTableColumn<Delivery>[] = [
    {
      key: "order",
      header: "Order",
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.order.id}`}
          className="font-medium text-dadda-primary hover:underline"
        >
          {row.order.orderNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) =>
        `${row.order.customerFirstName} ${row.order.customerLastName}`.trim() || "—",
    },
    {
      key: "address",
      header: "Address",
      cell: (row) => (
        <span className="line-clamp-2 max-w-[16rem] text-sm text-muted-foreground">
          {row.address}
        </span>
      ),
    },
    {
      key: "when",
      header: "Scheduled",
      cell: (row) => (
        <span className="text-sm">
          {formatDate(row.scheduledDate)}
          {row.scheduledWindow ? ` · ${row.scheduledWindow}` : ""}
        </span>
      ),
    },
    {
      key: "driver",
      header: "Driver",
      cell: (row) => row.driver?.name || "—",
    },
    {
      key: "fee",
      header: "Fee",
      className: "text-right",
      cell: (row) => formatZAR(row.fee),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Deliveries" description="Scheduled and in-progress deliveries." />

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          updateParams({ q: q.trim() || null })
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order #, address, customer…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load deliveries"
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
            rowKey={(r) => r.id}
            empty={<EmptyState title="No deliveries" className="border-0 py-6" />}
          />
          <AdminPagination
            page={data?.page ?? page}
            pageCount={data?.pageCount ?? 1}
            total={data?.total}
            onPageChange={(n) => updateParams({ page: String(n) })}
            disabled={isFetching}
          />
        </>
      )}
    </div>
  )
}
