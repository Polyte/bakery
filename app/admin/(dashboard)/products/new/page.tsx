"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
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

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = React.useState({
    name: "",
    sku: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    productType: "standard",
    price: "",
    salePrice: "",
    costPrice: "",
    image: "",
    isAvailable: true,
    isFeatured: false,
    stockStatus: "in_stock",
    sizeLabel: "",
    serves: "",
    flavor: "",
  })

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load categories")
      return body.items as Array<{ id: string; name: string }>
    },
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku || undefined,
          slug: form.slug || undefined,
          description: form.description,
          shortDescription: form.shortDescription,
          categoryId: form.categoryId || null,
          productType: form.productType,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          costPrice: form.costPrice ? Number(form.costPrice) : 0,
          image: form.image || null,
          isAvailable: form.isAvailable,
          isFeatured: form.isFeatured,
          stockStatus: form.stockStatus,
          sizeLabel: form.sizeLabel || undefined,
          serves: form.serves || undefined,
          flavor: form.flavor || undefined,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to create")
      return body.product as { id: string }
    },
    onSuccess: (product) => router.push(`/admin/products/${product.id}`),
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="New product" description="Add an item to the catalogue." />
      <Card className="border-outline-variant/50">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="Auto if blank"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.categoryId || "none"}
              onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorised</SelectItem>
                {(categoriesQuery.data || []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Stock status</Label>
            <Select
              value={form.stockStatus}
              onValueChange={(v) => setForm((f) => ({ ...f, stockStatus: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In stock</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
                <SelectItem value="made_to_order">Made to order</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Input
              id="shortDescription"
              value={form.shortDescription}
              onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
            />
            Available for sale
          </label>
          {mutation.isError ? (
            <p className="text-sm text-destructive sm:col-span-2">
              {mutation.error instanceof Error ? mutation.error.message : "Error"}
            </p>
          ) : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button
              className="bg-dadda-primary hover:bg-dadda-primary-dark"
              disabled={mutation.isPending || !form.name || !form.price}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Creating…" : "Create product"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
