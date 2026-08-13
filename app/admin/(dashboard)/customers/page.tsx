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

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string | null
  lifetimeSpend: number
  orderCount: number
  createdAt: string
  tagAssignments?: Array<{ tag: { id: string; name: string; color: string } }>
}

type Response = {
  items: Customer[]
  total: number
  page: number
  pageCount: number
}

async function fetchCustomers(params: URLSearchParams): Promise<Response> {
  const res = await fetch(`/api/admin/customers?${params}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || "Failed to load customers")
  return body
}

export default function CustomersPage() {
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
    queryKey: ["admin-customers", params.toString()],
    queryFn: () => fetchCustomers(params),
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

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/customers/${row.id}`}
            className="font-medium text-dadda-primary hover:underline"
          >
            {row.firstName} {row.lastName}
          </Link>
          {row.company ? (
            <div className="text-xs text-muted-foreground">{row.company}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (row) => (
        <div className="text-sm">
          <div>{row.email}</div>
          <div className="text-muted-foreground">{row.phone || "—"}</div>
        </div>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.tagAssignments || []).length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            row.tagAssignments!.map((a) => (
              <Badge
                key={a.tag.id}
                variant="outline"
                style={{ borderColor: a.tag.color, color: a.tag.color }}
              >
                {a.tag.name}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      className: "text-right",
      cell: (row) => row.orderCount,
    },
    {
      key: "spend",
      header: "Lifetime spend",
      className: "text-right",
      cell: (row) => formatZAR(row.lifetimeSpend),
    },
    {
      key: "created",
      header: "Joined",
      cell: (row) => formatDate(row.createdAt),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="CRM profiles, spend, and order history."
        actions={
          <Button asChild size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
            <Link href="/admin/customers/new">New customer</Link>
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
          placeholder="Search name, email, phone…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load customers"
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
                title="No customers yet"
                description="Create a customer or wait for the first online order."
                action={{ label: "New customer", href: "/admin/customers/new" }}
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
