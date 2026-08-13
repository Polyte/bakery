"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { AdminPagination } from "@/components/admin/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/format"

type Audit = {
  id: string
  action: string
  entity: string
  entityId?: string | null
  createdAt: string
  user?: { firstName: string; lastName: string; email: string } | null
}

type Response = {
  items: Audit[]
  total: number
  page: number
  pageCount: number
}

export default function AuditPage() {
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
    queryKey: ["admin-audit", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/audit?${params}`)
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

  const columns: DataTableColumn<Audit>[] = [
    {
      key: "when",
      header: "When",
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "user",
      header: "User",
      cell: (row) =>
        row.user ? `${row.user.firstName} ${row.user.lastName}`.trim() : "System",
    },
    {
      key: "action",
      header: "Action",
      cell: (row) => <span className="font-mono text-xs">{row.action}</span>,
    },
    {
      key: "entity",
      header: "Entity",
      cell: (row) => (
        <span className="text-sm">
          {row.entity}
          {row.entityId ? (
            <span className="text-muted-foreground"> · {row.entityId.slice(0, 8)}…</span>
          ) : null}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Audit logs" description="Who changed what in the admin." />

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
          placeholder="Search action, entity, user…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load audit logs"
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
            empty={<EmptyState title="No audit entries" className="border-0 py-6" />}
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
