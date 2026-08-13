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

type Slide = {
  id: string
  heading: string
  subheading: string
  ctaText: string
  ctaUrl: string
  desktopImage: string
  mobileImage?: string | null
  isActive: boolean
  sortOrder: number
}

export default function HeroSlidesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    heading: "",
    subheading: "",
    ctaText: "",
    ctaUrl: "",
    desktopImage: "",
  })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-hero"],
    queryFn: async () => {
      const res = await fetch("/api/admin/cms/hero")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body.items as Slide[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/admin/cms/hero", {
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
      setForm({ heading: "", subheading: "", ctaText: "", ctaUrl: "", desktopImage: "" })
      queryClient.invalidateQueries({ queryKey: ["admin-hero"] })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero carousel"
        description="Homepage hero slides."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                Add slide
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New hero slide</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {(
                  [
                    ["heading", "Heading"],
                    ["subheading", "Subheading"],
                    ["ctaText", "CTA text"],
                    ["ctaUrl", "CTA URL"],
                    ["desktopImage", "Desktop image URL *"],
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
                  disabled={!form.desktopImage || saveMutation.isPending}
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
          title="Couldn’t load slides"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (data || []).length === 0 ? (
        <EmptyState title="No hero slides" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(data || []).map((slide) => (
            <Card key={slide.id} className="overflow-hidden border-outline-variant/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.desktopImage}
                alt={slide.heading || "Hero"}
                className="h-40 w-full object-cover"
              />
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-semibold">{slide.heading || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">{slide.subheading}</p>
                  </div>
                  <Badge variant="outline">{slide.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      saveMutation.mutate({ id: slide.id, isActive: !slide.isActive })
                    }
                  >
                    {slide.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete this slide?"))
                        saveMutation.mutate({ id: slide.id, delete: true })
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
