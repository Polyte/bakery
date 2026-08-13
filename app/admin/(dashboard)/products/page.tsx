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
import { formatZAR } from "@/lib/format"

type Product = {
  id: string
  name: string
  sku: string
  price: number
  salePrice?: number | null
  isAvailable: boolean
  stockStatus: string
  category?: { id: string; name: string } | null
  image?: string | null
}

type Response = {
  items: Product[]
  total: number
  page: number
  pageCount: number
}

async function fetchProducts(params: URLSearchParams): Promise<Response> {
  const res = await fetch(`/api/admin/products?${params}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || "Failed to load products")
  return body
}

export default function ProductsPage() {
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
    queryKey: ["admin-products", params.toString()],
    queryFn: () => fetchProducts(params),
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

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.image} alt="" className="h-10 w-10 rounded-md object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-md bg-surface-container-high" />
          )}
          <div>
            <Link
              href={`/admin/products/${row.id}`}
              className="font-medium text-dadda-primary hover:underline"
            >
              {row.name}
            </Link>
            <div className="text-xs text-muted-foreground">{row.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => row.category?.name || "—",
    },
    {
      key: "price",
      header: "Price",
      className: "text-right",
      cell: (row) => (
        <div>
          <div className="tabular-nums">{formatZAR(row.salePrice ?? row.price)}</div>
          {row.salePrice != null ? (
            <div className="text-xs text-muted-foreground line-through">
              {formatZAR(row.price)}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.stockStatus.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "available",
      header: "Available",
      cell: (row) => (
        <Badge
          variant="outline"
          className={
            row.isAvailable
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-stone-200 bg-stone-100 text-stone-700"
          }
        >
          {row.isAvailable ? "Yes" : "No"}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Catalogue items, pricing, and availability."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products/categories">Categories</Link>
            </Button>
            <Button asChild size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
              <Link href="/admin/products/new">New product</Link>
            </Button>
          </>
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
          placeholder="Search name, SKU, slug…"
          className="sm:max-w-md"
        />
        <Button type="submit" className="bg-dadda-primary hover:bg-dadda-primary-dark">
          Search
        </Button>
      </form>

      {isError ? (
        <EmptyState
          title="Couldn’t load products"
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
                title="No products"
                action={{ label: "Add product", href: "/admin/products/new" }}
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
