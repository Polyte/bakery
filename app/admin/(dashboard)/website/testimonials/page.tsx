"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

type Testimonial = {
  id: string
  customerName: string
  customerType: string
  body: string
  rating: number
  isFeatured: boolean
  isPublished: boolean
}

export default function TestimonialsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    customerName: "",
    customerType: "",
    body: "",
    rating: "5",
  })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/admin/cms/testimonials")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body.items as Testimonial[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/admin/cms/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to save")
      return body
    },
    onSuccess: () => {
      setOpen(false)
      setForm({ customerName: "", customerType: "", body: "", rating: "5" })
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Customer reviews shown on the website."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                Add testimonial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New testimonial</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName">Name *</Label>
                  <Input
                    id="customerName"
                    value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerType">Role / type</Label>
                  <Input
                    id="customerType"
                    value={form.customerType}
                    onChange={(e) => setForm((f) => ({ ...f, customerType: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="body">Quote *</Label>
                  <Textarea
                    id="body"
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-dadda-primary hover:bg-dadda-primary-dark"
                  disabled={!form.customerName || !form.body || saveMutation.isPending}
                  onClick={() =>
                    saveMutation.mutate({
                      ...form,
                      rating: Number(form.rating),
                      isPublished: true,
                    })
                  }
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
          title="Couldn’t load testimonials"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (data || []).length === 0 ? (
        <EmptyState title="No testimonials" />
      ) : (
        <div className="space-y-3">
          {(data || []).map((t) => (
            <Card key={t.id} className="border-outline-variant/50">
              <CardContent className="space-y-2 pt-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{t.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.customerType} · {"★".repeat(t.rating)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {t.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
                    <Badge variant="outline">{t.isPublished ? "Published" : "Draft"}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t.body}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      saveMutation.mutate({ id: t.id, isPublished: !t.isPublished })
                    }
                  >
                    {t.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      saveMutation.mutate({ id: t.id, isFeatured: !t.isFeatured })
                    }
                  >
                    {t.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete testimonial?"))
                        saveMutation.mutate({ id: t.id, delete: true })
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
