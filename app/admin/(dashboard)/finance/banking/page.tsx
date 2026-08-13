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

type Banking = {
  bankName: string
  accountHolder: string
  accountNumber: string
  accountType: string
  branchCode: string
  swift: string
  payshap: string
  referenceFormat: string
  paymentInstructions: string
}

const defaults: Banking = {
  bankName: "Capitec",
  accountHolder: "MISS MMABATHO SHAKOANE",
  accountNumber: "1398614864",
  accountType: "Main Account",
  branchCode: "470010",
  swift: "CABLZAJJ",
  payshap: "0726775070",
  referenceFormat: "",
  paymentInstructions: "",
}

export default function BankingPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = React.useState<Banking>(defaults)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load settings")
      return body as { map: Record<string, string> }
    },
  })

  React.useEffect(() => {
    if (!data?.map?.banking) return
    try {
      const parsed = JSON.parse(data.map.banking) as Partial<Banking>
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
        body: JSON.stringify({ key: "banking", value: form }),
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
        title="Couldn’t load banking details"
        description={error instanceof Error ? error.message : "Please try again."}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Banking details"
        description="EFT details shown to customers at checkout."
      />
      <Card className="border-outline-variant/50">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          {(
            [
              ["bankName", "Bank name"],
              ["accountHolder", "Account holder"],
              ["accountNumber", "Account number / IBAN"],
              ["accountType", "Account type"],
              ["branchCode", "Branch code"],
              ["swift", "SWIFT / BIC"],
              ["payshap", "PayShap (Standard Bank)"],
              ["referenceFormat", "Reference format"],
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="paymentInstructions">Payment instructions</Label>
            <Textarea
              id="paymentInstructions"
              value={form.paymentInstructions}
              onChange={(e) =>
                setForm((f) => ({ ...f, paymentInstructions: e.target.value }))
              }
              rows={3}
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
              {saveMutation.isPending ? "Saving…" : "Save banking details"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
