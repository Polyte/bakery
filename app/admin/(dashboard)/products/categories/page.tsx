"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { DataTable, type DataTableColumn } from "@/components/admin/data-table"
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

type Category = {
  id: string
  name: string
  slug: string
  description: string
  isActive: boolean
  sortOrder: number
  _count?: { products: number }
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", description: "" })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body.items as Category[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to create")
      return body
    },
    onSuccess: () => {
      setOpen(false)
      setForm({ name: "", description: "" })
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
    },
  })

  const columns: DataTableColumn<Category>[] = [
    {
      key: "name",
      header: "Category",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.slug}</div>
        </div>
      ),
    },
    {
      key: "products",
      header: "Products",
      className: "text-right",
      cell: (row) => row._count?.products ?? 0,
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
        title="Categories"
        description="Product categories for the catalogue."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                Add category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New category</DialogTitle>
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
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
          title="Couldn’t load categories"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <DataTable
          columns={columns}
          data={data || []}
          rowKey={(r) => r.id}
          empty={<EmptyState title="No categories yet" className="border-0 py-6" />}
        />
      )}
    </div>
  )
}
