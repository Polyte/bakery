"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewCustomerPage() {
  const router = useRouter()
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    company: "",
    preferredContact: "whatsapp",
    marketingConsent: false,
    notes: "",
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to create customer")
      return body.customer as { id: string }
    },
    onSuccess: (customer) => {
      router.push(`/admin/customers/${customer.id}`)
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New customer"
        description="Add a customer profile to the CRM."
      />

      <Card className="border-outline-variant/50">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name *</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
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
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Preferred contact</Label>
            <Select
              value={form.preferredContact}
              onValueChange={(v) => setForm((f) => ({ ...f, preferredContact: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="marketing"
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(e) => setForm((f) => ({ ...f, marketingConsent: e.target.checked }))}
              className="h-4 w-4 rounded border"
            />
            <Label htmlFor="marketing">Marketing consent</Label>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
          </div>
          {mutation.isError ? (
            <p className="text-sm text-destructive sm:col-span-2">
              {mutation.error instanceof Error ? mutation.error.message : "Error"}
            </p>
          ) : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button
              type="button"
              className="bg-dadda-primary hover:bg-dadda-primary-dark"
              disabled={mutation.isPending || !form.firstName || !form.email}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Saving…" : "Create customer"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
