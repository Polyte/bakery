"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

type Business = {
  name: string
  description: string
  phone: string
  email: string
  address: string
  currency: string
  currencySymbol: string
  defaultDepositPercent: number
  minimumOrderValue: number
}

const defaults: Business = {
  name: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  currency: "ZAR",
  currencySymbol: "R",
  defaultDepositPercent: 50,
  minimumOrderValue: 0,
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = React.useState<Business>(defaults)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load")
      return body as { map: Record<string, string> }
    },
  })

  React.useEffect(() => {
    if (!data?.map?.business) return
    try {
      const parsed = JSON.parse(data.map.business) as Partial<Business>
      setForm({ ...defaults, ...parsed })
    } catch {
      /* ignore */
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "business", value: form }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to save")
      return body
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] }),
  })

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load settings"
        description={error instanceof Error ? error.message : "Please try again."}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Business settings"
        description="Core bakery identity and order defaults."
      />
      <Card className="border-outline-variant/50">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Tagline</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deposit">Default deposit %</Label>
            <Input
              id="deposit"
              type="number"
              value={form.defaultDepositPercent}
              onChange={(e) =>
                setForm((f) => ({ ...f, defaultDepositPercent: Number(e.target.value) }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minOrder">Minimum order value</Label>
            <Input
              id="minOrder"
              type="number"
              value={form.minimumOrderValue}
              onChange={(e) =>
                setForm((f) => ({ ...f, minimumOrderValue: Number(e.target.value) }))
              }
            />
          </div>
          {saveMutation.isError ? (
            <p className="text-sm text-destructive sm:col-span-2">
              {saveMutation.error instanceof Error ? saveMutation.error.message : "Error"}
            </p>
          ) : null}
          {saveMutation.isSuccess ? (
            <p className="text-sm text-emerald-700 sm:col-span-2">Saved.</p>
          ) : null}
          <div className="sm:col-span-2">
            <Button
              className="bg-dadda-primary hover:bg-dadda-primary-dark"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
