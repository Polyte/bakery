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

type Faq = {
  id: string
  question: string
  answer: string
  category: string
  isPublished: boolean
  sortOrder: number
}

export default function FaqsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    question: "",
    answer: "",
    category: "general",
  })

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/cms/faqs")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body.items as Faq[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/admin/cms/faqs", {
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
      setForm({ question: "", answer: "", category: "general" })
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        description="Frequently asked questions on the website."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dadda-primary hover:bg-dadda-primary-dark">
                Add FAQ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New FAQ</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="question">Question *</Label>
                  <Input
                    id="question"
                    value={form.question}
                    onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="answer">Answer *</Label>
                  <Textarea
                    id="answer"
                    value={form.answer}
                    onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-dadda-primary hover:bg-dadda-primary-dark"
                  disabled={!form.question || !form.answer || saveMutation.isPending}
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
          title="Couldn’t load FAQs"
          description={error instanceof Error ? error.message : "Please try again."}
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (data || []).length === 0 ? (
        <EmptyState title="No FAQs yet" />
      ) : (
        <div className="space-y-3">
          {(data || []).map((faq) => (
            <Card key={faq.id} className="border-outline-variant/50">
              <CardContent className="space-y-2 pt-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium">{faq.question}</p>
                  <div className="flex gap-1">
                    <Badge variant="outline">{faq.category}</Badge>
                    <Badge variant="outline">{faq.isPublished ? "Published" : "Draft"}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      saveMutation.mutate({ id: faq.id, isPublished: !faq.isPublished })
                    }
                  >
                    {faq.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Delete FAQ?"))
                        saveMutation.mutate({ id: faq.id, delete: true })
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
