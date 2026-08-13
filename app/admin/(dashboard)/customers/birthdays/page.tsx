"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Cake, Send } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/format"
import { BIRTHDAY_DISCOUNT_PERCENT, BIRTHDAY_PROMO_CODE } from "@/lib/loyalty"

type BirthdayCustomer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  birthday: string | null
  birthdayOfferSentYear: number | null
  loyaltyPoints: number
  orderCount: number
}

async function fetchBirthdays(scope: "today" | "month") {
  const q = scope === "month" ? "?scope=month" : ""
  const res = await fetch(`/api/admin/birthday-offers${q}`)
  if (!res.ok) throw new Error("Failed to load birthdays")
  return res.json() as Promise<{
    count: number
    promoCode: string
    discountPercent: number
    customers: BirthdayCustomer[]
  }>
}

export default function BirthdayOffersPage() {
  const queryClient = useQueryClient()
  const [scope, setScope] = React.useState<"today" | "month">("today")
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-birthdays", scope],
    queryFn: () => fetchBirthdays(scope),
  })

  const send = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/birthday-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Send failed")
      return json as { sent: number; skipped: number }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-birthdays"] }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Birthday offers"
        description={`Automatically wish customers a happy birthday and share ${BIRTHDAY_DISCOUNT_PERCENT}% off with code ${BIRTHDAY_PROMO_CODE}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant={scope === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setScope("today")}
            >
              Today
            </Button>
            <Button
              variant={scope === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setScope("month")}
            >
              This month
            </Button>
            <Button
              size="sm"
              className="bg-dadda-primary text-white hover:bg-dadda-primary-dark"
              disabled={send.isPending || scope !== "today"}
              onClick={() => send.mutate()}
            >
              <Send className="mr-1.5 h-4 w-4" />
              {send.isPending ? "Sending…" : "Send today’s wishes"}
            </Button>
          </div>
        }
      />

      <Card className="border-outline-variant/50">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Cake className="h-5 w-5 text-dadda-primary" />
            {scope === "today" ? "Birthdays today" : "Birthdays this month"}
          </CardTitle>
          <CardDescription>
            Promo code <strong>{BIRTHDAY_PROMO_CODE}</strong> · {BIRTHDAY_DISCOUNT_PERCENT}% off · each customer is
            emailed at most once per year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : error ? (
            <p className="text-sm text-destructive">Could not load birthdays.</p>
          ) : !data?.customers?.length ? (
            <EmptyState
              title="No birthdays"
              description={
                scope === "today"
                  ? "No customers with a birthday today. Birthdays are collected at checkout."
                  : "No customers with a birthday this month yet."
              }
            />
          ) : (
            <ul className="divide-y divide-outline-variant/40">
              {data.customers.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-chocolate-text">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-muted-foreground">
                      {c.email}
                      {c.birthday ? ` · ${formatDate(c.birthday)}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <p>{c.loyaltyPoints} pts · {c.orderCount} orders</p>
                    <p>
                      {c.birthdayOfferSentYear
                        ? `Offer sent ${c.birthdayOfferSentYear}`
                        : "Offer not sent yet"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {send.isSuccess ? (
            <p className="mt-4 text-sm text-emerald-700">
              Sent {send.data.sent} · skipped {send.data.skipped}
            </p>
          ) : null}
          {send.isError ? (
            <p className="mt-4 text-sm text-destructive">{(send.error as Error).message}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
