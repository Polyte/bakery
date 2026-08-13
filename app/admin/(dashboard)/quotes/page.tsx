"use client"

import * as React from "react"
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

type Quote = {
  id: string
  quoteNumber: string
  status: string
  total: number
  depositRequired: number
  expiryDate?: string | null
  createdAt: string
  customer?: { firstName: string; lastName: string; email: string } | null
  items?: Array<{ name: string }>
}

type Response = {
  items: Quote[]
  total: number
  page: number
  pageCount: number
}

export default function QuotesPage() {
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
    queryKey: ["admin-quotes", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/quotes?${params}`)
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

  const columns: DataTableColumn<Quote>[] = [
    {
      key: "number",
      header: "Quote",
      cell: (row) => <span className="font-medium text-dadda-primary">{row.quoteNumber}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) =>
        row.customer
          ? `${row.customer.firstName} ${row.customer.lastName}`.trim()
          : "—",
    },
    {
      key: "items",
      header: "Items",
      cell: (row) => (
        <span className="line-clamp-1 max-w-[12rem] text-sm text-muted-foreground">
          {(row.items || []).map((i) => i.name).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      cell: (row) => formatZAR(row.total),
    },
    {
      key: "expiry",
      header: "Expires",
      cell: (row) => formatDate(row.expiryDate),
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
      <PageHeader title="Quotes" description="Custom cake and bulk order quotes." />

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
          placeholder="Search quote # or customer…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load quotes"
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
            empty={<EmptyState title="No quotes yet" className="border-0 py-6" />}
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
