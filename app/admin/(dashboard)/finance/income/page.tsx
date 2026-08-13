"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
import { AdminPagination } from "@/components/admin/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

const CATEGORIES = [
  "product_sales",
  "deposit",
  "final_payment",
  "delivery",
  "other",
]

type Income = {
  id: string
  category: string
  description: string
  amount: number
  date: string
}

type Response = {
  items: Income[]
  total: number
  page: number
  pageCount: number
  sum: number
}

export default function IncomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    category: "product_sales",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-income", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/income?page=${page}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body as Response
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to create")
      return body
    },
    onSuccess: () => {
      setOpen(false)
      setForm({
        category: "product_sales",
        description: "",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      })
      queryClient.invalidateQueries({ queryKey: ["admin-income"] })
    },
  })

  const columns: DataTableColumn<Income>[] = [
    { key: "date", header: "Date", cell: (row) => formatDate(row.date) },
    {
      key: "category",
      header: "Category",
      cell: (row) => <span className="capitalize">{row.category.replace(/_/g, " ")}</span>,
    },
    { key: "description", header: "Description", cell: (row) => row.description },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      cell: (row) => formatZAR(row.amount),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        description={data ? `Period total: ${formatZAR(data.sum)}` : "Income transactions."}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                Add income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record income</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
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
                  disabled={
                    createMutation.isPending || !form.description || !form.amount
                  }
                  onClick={() => createMutation.mutate()}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isError ? (
        <EmptyState
          title="Couldn’t load income"
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
            empty={<EmptyState title="No income recorded" className="border-0 py-6" />}
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
