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
import { cn } from "@/lib/utils"
import { formatZAR } from "@/lib/format"

type Item = {
  id: string
  name: string
  sku: string
  unit: string
  quantity: number
  minStock: number
  costPerUnit: number
  supplier?: { name: string } | null
}

type Response = {
  items: Item[]
  total: number
  page: number
  pageCount: number
}

export default function InventoryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qParam = searchParams.get("q") || ""
  const lowStock = searchParams.get("lowStock") === "1" || searchParams.get("lowStock") === "true"
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
  const [q, setQ] = React.useState(qParam)

  const params = React.useMemo(() => {
    const p = new URLSearchParams()
    if (qParam) p.set("q", qParam)
    if (lowStock) p.set("lowStock", "true")
    p.set("page", String(page))
    return p
  }, [qParam, lowStock, page])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-inventory", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/inventory?${params}`)
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

  const columns: DataTableColumn<Item>[] = [
    {
      key: "name",
      header: "Item",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.sku}</div>
        </div>
      ),
    },
    {
      key: "qty",
      header: "Qty",
      className: "text-right",
      cell: (row) => (
        <span
          className={cn(
            "tabular-nums font-medium",
            row.quantity <= row.minStock && "text-rose-700",
          )}
        >
          {row.quantity} {row.unit}
        </span>
      ),
    },
    {
      key: "min",
      header: "Min",
      className: "text-right",
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {row.minStock} {row.unit}
        </span>
      ),
    },
    {
      key: "cost",
      header: "Cost/unit",
      className: "text-right",
      cell: (row) => formatZAR(row.costPerUnit),
    },
    {
      key: "supplier",
      header: "Supplier",
      cell: (row) => row.supplier?.name || "—",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Ingredient stock levels. Low stock is highlighted."
        actions={
          <Button
            variant={lowStock ? "default" : "outline"}
            size="sm"
            className={lowStock ? "bg-dadda-primary hover:bg-dadda-primary-dark" : undefined}
            onClick={() => updateParams({ lowStock: lowStock ? null : "1" })}
          >
            {lowStock ? "Showing low stock" : "Low stock only"}
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
          placeholder="Search name or SKU…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load inventory"
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
            empty={<EmptyState title="No inventory items" className="border-0 py-6" />}
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
