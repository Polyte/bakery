"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/admin/page-header"
import { EmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ProductForm = {
  name: string
  sku: string
  slug: string
  description: string
  shortDescription: string
  categoryId: string
  productType: string
  price: string
  salePrice: string
  costPrice: string
  image: string
  isAvailable: boolean
  isFeatured: boolean
  stockStatus: string
  sizeLabel: string
  serves: string
  flavor: string
}

const emptyForm: ProductForm = {
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
}

function ProductFormFields({
  form,
  setForm,
  categories,
}: {
  form: ProductForm
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>
  categories: Array<{ id: string; name: string }>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          placeholder="Auto from name"
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
        <Label htmlFor="salePrice">Sale price</Label>
        <Input
          id="salePrice"
          type="number"
          step="0.01"
          value={form.salePrice}
          onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="costPrice">Cost price</Label>
        <Input
          id="costPrice"
          type="number"
          step="0.01"
          value={form.costPrice}
          onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
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
            {categories.map((c) => (
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
        <Label htmlFor="productType">Type</Label>
        <Input
          id="productType"
          value={form.productType}
          onChange={(e) => setForm((f) => ({ ...f, productType: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sizeLabel">Size</Label>
        <Input
          id="sizeLabel"
          value={form.sizeLabel}
          onChange={(e) => setForm((f) => ({ ...f, sizeLabel: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="serves">Serves</Label>
        <Input
          id="serves"
          value={form.serves}
          onChange={(e) => setForm((f) => ({ ...f, serves: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="flavor">Flavour</Label>
        <Input
          id="flavor"
          value={form.flavor}
          onChange={(e) => setForm((f) => ({ ...f, flavor: e.target.value }))}
        />
      </div>
      <div className="flex items-center gap-4 sm:col-span-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
          />
          Available
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
          />
          Featured
        </label>
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
    </div>
  )
}

function toPayload(form: ProductForm) {
  return {
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
  }
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [form, setForm] = React.useState<ProductForm>(emptyForm)

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories")
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load categories")
      return body.items as Array<{ id: string; name: string }>
    },
  })

  const productQuery = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`)
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to load product")
      return body.product
    },
  })

  React.useEffect(() => {
    const p = productQuery.data
    if (!p) return
    setForm({
      name: p.name || "",
      sku: p.sku || "",
      slug: p.slug || "",
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      categoryId: p.categoryId || "",
      productType: p.productType || "standard",
      price: String(p.price ?? ""),
      salePrice: p.salePrice != null ? String(p.salePrice) : "",
      costPrice: String(p.costPrice ?? ""),
      image: p.image || "",
      isAvailable: Boolean(p.isAvailable),
      isFeatured: Boolean(p.isFeatured),
      stockStatus: p.stockStatus || "in_stock",
      sizeLabel: p.sizeLabel || "",
      serves: p.serves || "",
      flavor: p.flavor || "",
    })
  }, [productQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to save")
      return body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || "Failed to delete")
      return body
    },
    onSuccess: () => router.push("/admin/products"),
  })

  if (productQuery.isLoading) return <Skeleton className="h-96 w-full rounded-xl" />
  if (productQuery.isError || !productQuery.data) {
    return (
      <EmptyState
        title="Product not found"
        description={
          productQuery.error instanceof Error ? productQuery.error.message : "Could not load."
        }
        action={{ label: "Back", href: "/admin/products" }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={productQuery.data.name}
        description={productQuery.data.sku}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">All products</Link>
          </Button>
        }
      />
      <Card className="border-outline-variant/50">
        <CardContent className="space-y-4 pt-6">
          <ProductFormFields
            form={form}
            setForm={setForm}
            categories={categoriesQuery.data || []}
          />
          {saveMutation.isError || deleteMutation.isError ? (
            <p className="text-sm text-destructive">
              {(saveMutation.error || deleteMutation.error) instanceof Error
                ? ((saveMutation.error || deleteMutation.error) as Error).message
                : "Error"}
            </p>
          ) : null}
          {saveMutation.isSuccess ? (
            <p className="text-sm text-emerald-700">Saved.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-dadda-primary hover:bg-dadda-primary-dark"
              disabled={saveMutation.isPending || !form.name || !form.price}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm("Delete this product?")) deleteMutation.mutate()
              }}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
