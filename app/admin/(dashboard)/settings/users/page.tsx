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
import { formatDateTime } from "@/lib/format"

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
}

type Response = {
  items: User[]
  total: number
  page: number
  pageCount: number
}

export default function UsersPage() {
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
    queryKey: ["admin-users", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?${params}`)
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

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "User",
      cell: (row) => (
        <div>
          <div className="font-medium">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.role.toLowerCase().replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "active",
      header: "Status",
      cell: (row) => (
        <Badge
          variant="outline"
          className={
            row.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-stone-200 bg-stone-100"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "login",
      header: "Last login",
      cell: (row) => formatDateTime(row.lastLoginAt),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Users & roles" description="Staff accounts with admin access." />

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
          placeholder="Search name or email…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load users"
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
            empty={<EmptyState title="No users" className="border-0 py-6" />}
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
