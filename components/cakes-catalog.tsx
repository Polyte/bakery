"use client"

import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingBag, Sparkles } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import { useCakeOrder } from "@/components/cake-order-provider"
import { extrasList, formatRand } from "@/lib/cake-order"
import { type CakeProduct, cakeKind } from "@/lib/cakes"

export default function CakesCatalog({ products }: { products: CakeProduct[] }) {
  const router = useRouter()
  const { draft, addExtra, setExtraQty, startCake } = useCakeOrder()
  const extras = extrasList(draft)

  const customise = (product: CakeProduct) => {
    startCake(product)
    router.push("/order/filling")
  }

  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3" data-stagger>
      {products.map((product) => {
        const inCart = extras.find((extra) => extra.id === product.id)
        const qty = inCart?.qty ?? 0
        const customising = draft.category === product.category && draft.productName === product.name

        return (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm"
            data-stagger-item
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <LazyImage
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              {product.note ? (
                <span className="absolute left-4 top-4 rounded-full bg-[#fff8ef]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#7d562d] backdrop-blur-sm">
                  {product.note}
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-semibold text-[#2D241E]">{product.name}</h3>
                <p className="shrink-0 text-sm font-semibold text-[#7d562d]">From {formatRand(product.price)}</p>
              </div>
              <p className="flex-1 text-sm leading-6 text-on-surface-variant">{product.description}</p>
              <p className="text-[12px] font-medium uppercase tracking-widest text-on-surface-variant">
                {product.flavor} · {product.serves} · Pretoria pickup
              </p>

              {qty > 0 ? (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-full border border-outline-variant bg-surface">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center text-[#2D241E] hover:text-[#7d562d]"
                      onClick={() => setExtraQty(product.id, qty - 1)}
                      aria-label={`Decrease ${product.name} quantity`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-[#2D241E]" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center text-[#2D241E] hover:text-[#7d562d]"
                      onClick={() => setExtraQty(product.id, qty + 1)}
                      aria-label={`Increase ${product.name} quantity`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-sage-muted">In cart · {formatRand(product.price * qty)}</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-primary mt-2 inline-flex w-full items-center justify-center gap-2 bg-[#7d562d] hover:bg-[#623f18]"
                  onClick={() =>
                    addExtra({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      kind: cakeKind(product.category),
                      qty: 1,
                    })
                  }
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to cart
                </button>
              )}

              <button
                type="button"
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-semibold uppercase tracking-widest ${
                  customising
                    ? "border-[#7d562d] bg-[#7d562d]/10 text-[#7d562d]"
                    : "border-[#7d562d] text-[#7d562d] hover:bg-[#7d562d]/5"
                }`}
                onClick={() => customise(product)}
              >
                <Sparkles className="h-4 w-4" />
                {customising ? "Customising" : "Customise"}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
