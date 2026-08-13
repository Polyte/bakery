"use client"

import { Minus, Plus, ShoppingBag } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import { useCakeOrder } from "@/components/cake-order-provider"
import { extrasList, formatRand } from "@/lib/cake-order"
import { POPSTICLES } from "@/lib/popsticles"

export default function PopsticlesCatalog() {
  const { draft, addExtra, setExtraQty } = useCakeOrder()
  const extras = extrasList(draft)

  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3" data-stagger>
      {POPSTICLES.map((item) => {
        const inCart = extras.find((extra) => extra.id === item.id)
        const qty = inCart?.qty ?? 0

        return (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm"
            data-stagger-item
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <LazyImage
                src={item.image}
                alt={`${item.name} Popsticle`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <span className="absolute left-4 top-4 rounded-full bg-[#fff8ef]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-dadda-primary backdrop-blur-sm">
                {item.note}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-semibold text-chocolate-text">{item.name}</h3>
                <p className="shrink-0 text-sm font-semibold text-dadda-primary">{formatRand(item.price)}</p>
              </div>
              <p className="flex-1 text-sm leading-6 text-on-surface-variant">{item.description}</p>
              <p className="text-[12px] font-medium uppercase tracking-widest text-on-surface-variant">
                Standard bar · Pretoria pickup
              </p>

              {qty > 0 ? (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-full border border-outline-variant bg-surface">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center text-chocolate-text hover:text-dadda-primary"
                      onClick={() => setExtraQty(item.id, qty - 1)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-chocolate-text" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center text-chocolate-text hover:text-dadda-primary"
                      onClick={() => setExtraQty(item.id, qty + 1)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-sage-muted">In cart · {formatRand(item.price * qty)}</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-primary mt-2 inline-flex w-full items-center justify-center gap-2"
                  onClick={() =>
                    addExtra({
                      id: item.id,
                      name: `Popsticle · ${item.name}`,
                      price: item.price,
                      image: item.image,
                      qty: 1,
                    })
                  }
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to cart
                </button>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
