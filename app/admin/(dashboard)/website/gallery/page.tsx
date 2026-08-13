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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Image = {
  id: string
  url: string
  caption: string
  alt: string
  category: string
  isFeatured: boolean
  isPublished: boolean
}

export default function GalleryPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    url: "",
    caption: "",
    alt: "",
    category: "events",
  })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const res = await fetch("/api/admin/cms/gallery")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body.items as Image[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/admin/cms/gallery", {
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
      setForm({ url: "", caption: "", alt: "", category: "events" })
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Manage bakery gallery images."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                Add image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New gallery image</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {(
                  [
                    ["url", "Image URL *"],
                    ["caption", "Caption"],
                    ["alt", "Alt text"],
                    ["category", "Category"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button
                  className="bg-dadda-primary hover:bg-dadda-primary-dark"
                  disabled={!form.url || saveMutation.isPending}
                  onClick={() => saveMutation.mutate(form)}
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
          title="Couldn’t load gallery"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (data || []).length === 0 ? (
        <EmptyState title="No gallery images" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data || []).map((img) => (
            <Card key={img.id} className="overflow-hidden border-outline-variant/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || img.caption} className="h-44 w-full object-cover" />
              <CardContent className="space-y-2 pt-3">
                <p className="line-clamp-1 text-sm font-medium">{img.caption || img.alt || "Untitled"}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{img.category}</Badge>
                  {img.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
                  <Badge variant="outline">{img.isPublished ? "Published" : "Draft"}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      saveMutation.mutate({ id: img.id, isPublished: !img.isPublished })
                    }
                  >
                    {img.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete image?"))
                        saveMutation.mutate({ id: img.id, delete: true })
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
