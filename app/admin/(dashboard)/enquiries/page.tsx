"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { AdminPagination } from "@/components/admin/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDateTime } from "@/lib/format"

type Enquiry = {
  id: string
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  status: string
  createdAt: string
}

type Response = {
  items: Enquiry[]
  total: number
  page: number
  pageCount: number
}

export default function EnquiriesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
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
    queryKey: ["admin-enquiries", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/enquiries?${params}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body as Response
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/enquiries?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to update")
      return body
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] }),
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

  const columns: DataTableColumn<Enquiry>[] = [
    {
      key: "from",
      header: "From",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <a href={`mailto:${row.email}`} className="text-xs text-dadda-primary hover:underline">
            {row.email}
          </a>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.subject || "—"}</div>
          <p className="line-clamp-2 max-w-md text-xs text-muted-foreground">{row.message}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Received",
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Select
          value={row.status}
          onValueChange={(v) => updateMutation.mutate({ id: row.id, status: v })}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Enquiries" description="Contact form messages from the website." />

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
          placeholder="Search name, email, subject…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load enquiries"
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
            empty={<EmptyState title="No enquiries" className="border-0 py-6" />}
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
