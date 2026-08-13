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

type CustomRequest = {
  id: string
  requestNumber: string
  status: string
  occasion?: string | null
  eventDate?: string | null
  cakeSize?: string | null
  flavour?: string | null
  theme?: string | null
  budget?: number | null
  customerName: string
  customerEmail: string
  customerPhone: string
  customer?: { id: string; firstName: string; lastName: string } | null
  createdAt: string
}

type Response = {
  items: CustomRequest[]
  total: number
  page: number
  pageCount: number
}

async function fetchRequests(params: URLSearchParams): Promise<Response> {
  const res = await fetch(`/api/admin/custom-requests?${params}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || "Failed to load custom requests")
  return body
}

export default function CustomRequestsPage() {
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
    queryKey: ["admin-custom-requests", params.toString()],
    queryFn: () => fetchRequests(params),
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

  const columns: DataTableColumn<CustomRequest>[] = [
    {
      key: "requestNumber",
      header: "Request",
      cell: (row) => <span className="font-medium text-dadda-primary">{row.requestNumber}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) => (
        <div>
          <div>
            {row.customer
              ? `${row.customer.firstName} ${row.customer.lastName}`.trim()
              : row.customerName || "—"}
          </div>
          <div className="text-xs text-muted-foreground">{row.customerEmail || "—"}</div>
        </div>
      ),
    },
    {
      key: "details",
      header: "Cake",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {[row.occasion, row.cakeSize, row.flavour, row.theme].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "eventDate",
      header: "Event",
      cell: (row) => formatDate(row.eventDate),
    },
    {
      key: "budget",
      header: "Budget",
      className: "text-right",
      cell: (row) => (row.budget != null ? formatZAR(row.budget) : "—"),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom cake requests"
        description="Enquiries for bespoke cakes awaiting review or quoting."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">All orders</Link>
          </Button>
        }
      />

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
          placeholder="Search request #, name, email…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load requests"
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
            empty={
              <EmptyState
                title="No custom requests"
                description="New custom cake enquiries will show here."
                className="border-0 bg-transparent py-6"
              />
            }
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
