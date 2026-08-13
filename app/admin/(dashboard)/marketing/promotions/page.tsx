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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatZAR } from "@/lib/format"

type Promotion = {
  id: string
  name: string
  code?: string | null
  type: string
  value: number
  isActive: boolean
  usageCount: number
  usageLimit?: number | null
  startsAt?: string | null
  endsAt?: string | null
}

type Response = {
  items: Promotion[]
  total: number
  page: number
  pageCount: number
}

export default function PromotionsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    code: "",
    type: "percentage",
    value: "",
  })

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-promotions", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/promotions?page=${page}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body as Response
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          code: form.code || null,
          type: form.type,
          value: Number(form.value) || 0,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to create")
      return body
    },
    onSuccess: () => {
      setOpen(false)
      setForm({ name: "", code: "", type: "percentage", value: "" })
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] })
    },
  })

  const columns: DataTableColumn<Promotion>[] = [
    {
      key: "name",
      header: "Promotion",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.code ? (
            <div className="font-mono text-xs text-muted-foreground">{row.code}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => <span className="capitalize">{row.type.replace(/_/g, " ")}</span>,
    },
    {
      key: "value",
      header: "Value",
      className: "text-right",
      cell: (row) =>
        row.type === "percentage" ? `${row.value}%` : formatZAR(row.value),
    },
    {
      key: "usage",
      header: "Usage",
      cell: (row) =>
        `${row.usageCount}${row.usageLimit != null ? ` / ${row.usageLimit}` : ""}`,
    },
    {
      key: "dates",
      header: "Window",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.startsAt)} → {formatDate(row.endsAt)}
        </span>
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
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Discount codes and offers."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                Add promotion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New promotion</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                      <SelectItem value="free_delivery">Free delivery</SelectItem>
                      <SelectItem value="first_order">First order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  />
                </div>
                {createMutation.isError ? (
                  <p className="text-sm text-destructive">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : "Error"}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <Button
                  className="bg-dadda-primary hover:bg-dadda-primary-dark"
                  disabled={!form.name || createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isError ? (
        <EmptyState
          title="Couldn’t load promotions"
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
            empty={<EmptyState title="No promotions" className="border-0 py-6" />}
          />
          <AdminPagination
            page={data?.page ?? page}
            pageCount={data?.pageCount ?? 1}
            total={data?.total}
            onPageChange={(n) => router.push(`${pathname}?page=${n}`)}
            disabled={isFetching}
          />
        </>
      )}
    </div>
  )
}
