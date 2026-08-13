"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { AdminPagination } from "@/components/admin/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatZAR } from "@/lib/format"

type Invoice = {
  id: string
  invoiceNumber: string
  status: string
  total: number
  amountPaid: number
  invoiceDate: string
  dueDate?: string | null
  customer?: { firstName: string; lastName: string } | null
  order?: { id: string; orderNumber: string } | null
}

type Response = {
  items: Invoice[]
  total: number
  page: number
  pageCount: number
}

export default function InvoicesPage() {
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
    queryKey: ["admin-invoices", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/invoices?${params}`)
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

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "number",
      header: "Invoice",
      cell: (row) => <span className="font-medium">{row.invoiceNumber}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) =>
        row.customer ? `${row.customer.firstName} ${row.customer.lastName}`.trim() : "—",
    },
    {
      key: "order",
      header: "Order",
      cell: (row) =>
        row.order ? (
          <Link href={`/admin/orders/${row.order.id}`} className="text-dadda-primary hover:underline">
            {row.order.orderNumber}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      cell: (row) => formatZAR(row.total),
    },
    {
      key: "paid",
      header: "Paid",
      className: "text-right",
      cell: (row) => formatZAR(row.amountPaid),
    },
    {
      key: "due",
      header: "Due",
      cell: (row) => formatDate(row.dueDate),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.status.toLowerCase().replace(/_/g, " ")}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Customer invoices linked to orders." />

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
          placeholder="Search invoice # or customer…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load invoices"
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
            empty={<EmptyState title="No invoices yet" className="border-0 py-6" />}
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
