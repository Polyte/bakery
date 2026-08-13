"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { AdminPagination } from "@/components/admin/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime, formatZAR } from "@/lib/format"

type Payment = {
  id: string
  paymentNumber: string
  amount: number
  method: string
  status: string
  reference?: string | null
  createdAt: string
  order?: { id: string; orderNumber: string } | null
  customer?: { id: string; firstName: string; lastName: string } | null
}

type Response = {
  items: Payment[]
  total: number
  page: number
  pageCount: number
}

export default function PaymentsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const status = searchParams.get("status") || "all"
  const qParam = searchParams.get("q") || ""
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
  const [q, setQ] = React.useState(qParam)

  const params = React.useMemo(() => {
    const p = new URLSearchParams()
    if (status !== "all") p.set("status", status)
    if (qParam) p.set("q", qParam)
    p.set("page", String(page))
    return p
  }, [status, qParam, page])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-payments", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/payments?${params}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body as Response
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/payments/${id}/verify`, { method: "POST" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Verify failed")
      return body
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-payments"] }),
  })

  function updateParams(next: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") p.delete(k)
      else p.set(k, v)
    }
    if (!("page" in next)) p.delete("page")
    router.push(`${pathname}?${p}`)
  }

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "number",
      header: "Payment",
      cell: (row) => <span className="font-medium">{row.paymentNumber}</span>,
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
      key: "customer",
      header: "Customer",
      cell: (row) =>
        row.customer
          ? `${row.customer.firstName} ${row.customer.lastName}`.trim()
          : "—",
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      cell: (row) => formatZAR(row.amount),
    },
    {
      key: "method",
      header: "Method",
      cell: (row) => <span className="capitalize">{row.method}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} kind="payment" />,
    },
    {
      key: "date",
      header: "Date",
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      cell: (row) =>
        row.status === "VERIFICATION_REQUIRED" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={verifyMutation.isPending}
            onClick={() => verifyMutation.mutate(row.id)}
          >
            Verify
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Recorded payments and EFT verification queue."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
        }
      />

      <Tabs value={status} onValueChange={(v) => updateParams({ status: v })}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="VERIFICATION_REQUIRED">To verify</TabsTrigger>
          <TabsTrigger value="SUCCEEDED">Succeeded</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="FAILED">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

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
          placeholder="Search payment # or reference…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load payments"
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
            empty={<EmptyState title="No payments" className="border-0 py-6" />}
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
