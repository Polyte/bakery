"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Check, Droplets, Ruler, Cake } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import { useCakeOrder } from "@/components/cake-order-provider"
import { CAKE_CATEGORY_LABELS, FILLINGS, formatRand, getFilling, subtotal, type FillingId } from "@/lib/cake-order"

export default function FillingPage() {
  const router = useRouter()
  const { draft, update } = useCakeOrder()
  const selected = getFilling(draft.fillingId)

  const choose = (id: FillingId) => update({ fillingId: id })

  const next = () => {
    if (!draft.fillingId) return
    router.push("/order/overview")
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col bg-background pt-24">
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 lg:px-margin-desktop">
        <div className="relative mx-auto mb-16 flex max-w-2xl items-center justify-between" data-animate="fade-up">
          <div className="absolute left-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 bg-surface-variant" />
          <div className="absolute left-0 top-1/2 z-0 h-[2px] w-2/3 -translate-y-1/2 bg-dadda-primary" />
          {[
            { label: "Size", done: true },
            { label: "Flavor", done: true },
            { label: "Filling", current: true, n: 3 },
            { label: "Design", n: 4 },
          ].map((step) => (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm shadow-sm ${
                  step.done
                    ? "bg-dadda-primary text-on-primary"
                    : step.current
                      ? "bg-surface-container text-dadda-primary shadow-lg ring-4 ring-dadda-primary/20"
                      : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {step.done ? <Check className="h-5 w-5" /> : step.n}
              </div>
              <span
                className={`absolute -bottom-6 whitespace-nowrap text-[12px] font-medium uppercase tracking-widest ${
                  step.current ? "font-bold text-dadda-primary" : "text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-container-max flex-col gap-gutter px-margin-mobile pb-section-gap lg:flex-row lg:px-margin-desktop">
        <aside className="flex w-full flex-col gap-6 lg:w-1/3">
          <div className="lg:sticky lg:top-[104px]">
            <h2 className="mb-4 font-display text-2xl font-semibold text-chocolate-text" data-animate="fade-up">
              {draft.productName}
            </h2>
            <div className="flex flex-col gap-6 rounded-2xl bg-surface-container p-6 shadow-sm">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-variant shadow-inner">
                <LazyImage
                  src={draft.productImage}
                  alt={draft.productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-variant/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span className="rounded-full bg-surface/90 px-3 py-1 text-[12px] font-medium uppercase tracking-wider text-on-surface shadow-sm backdrop-blur">
                    Live Preview
                  </span>
                </div>
              </div>
              {draft.category ? (
                <p className="text-[12px] font-semibold uppercase tracking-widest text-dadda-primary">
                  {CAKE_CATEGORY_LABELS[draft.category]}
                </p>
              ) : null}
              <div className="flex flex-col gap-3 text-on-surface-variant">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                  <span className="flex items-center gap-2">
                    <Ruler className="h-[18px] w-[18px] text-dadda-primary/70" /> {draft.sizeLabel} ({draft.serves})
                  </span>
                  <span className="text-sm font-semibold text-chocolate-text">{formatRand(draft.sizePrice)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                  <span className="flex items-center gap-2">
                    <Cake className="h-[18px] w-[18px] text-dadda-primary/70" /> {draft.flavorLabel}
                  </span>
                  <span className="text-sm font-semibold text-chocolate-text">Included</span>
                </div>
                <div className="flex items-center justify-between font-medium text-dadda-primary">
                  <span className="flex items-center gap-2">
                    <Droplets className="h-[18px] w-[18px]" /> {selected ? selected.name : "Select Filling"}
                  </span>
                  <span className="text-sm font-semibold">{selected ? (selected.price ? formatRand(selected.price) : "Included") : "--"}</span>
                </div>
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-6 overflow-hidden rounded-2xl bg-cream-surface p-6 shadow-md">
              <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-bl-full bg-primary-container/20 blur-xl" />
              <div className="relative z-10 flex items-end justify-between">
                <span className="font-display text-2xl font-semibold text-on-surface-variant">Estimated Total</span>
                <span className="font-display text-4xl font-bold text-chocolate-text">{formatRand(subtotal(draft))}</span>
              </div>
              <button
                type="button"
                onClick={next}
                disabled={!draft.fillingId}
                className="relative z-10 flex w-full items-center justify-center gap-2 rounded-full bg-dadda-primary py-4 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-sm hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next: Design <ArrowRight className="h-5 w-5" />
              </button>
              {!draft.fillingId && (
                <p className="text-center text-[12px] font-medium text-strawberry-accent">Please select a filling to continue.</p>
              )}
            </div>
          </div>
        </aside>

        <section className="flex w-full flex-col gap-8 lg:w-2/3">
          <div className="flex flex-col gap-2" data-animate="fade-up">
            <span className="text-sm font-semibold uppercase tracking-widest text-dadda-primary">Step 3 of 4</span>
            <h1 className="font-display text-[28px] font-bold leading-9 tracking-tight text-chocolate-text md:text-5xl md:leading-[56px]">
              The Heart of the Cake
            </h1>
            <p className="max-w-xl text-lg text-on-surface-variant">
              Choose a luscious center to complement your sponge. Our fillings are crafted daily using premium ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2" data-stagger>
            {FILLINGS.map((filling) => {
              const active = draft.fillingId === filling.id
              return (
                <button
                  key={filling.id}
                  type="button"
                  onClick={() => choose(filling.id)}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl p-4 text-left shadow-sm transition-shadow hover:shadow-md ${
                    active ? "bg-cream-surface shadow-md ring-2 ring-dadda-primary" : "bg-surface-container"
                  }`}
                  data-stagger-item
                >
                  <div
                    className={`absolute right-6 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 backdrop-blur ${
                      active
                        ? "border-dadda-primary bg-dadda-primary text-on-primary"
                        : "border-outline-variant bg-surface/50 text-transparent"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
                    <LazyImage src={filling.image} alt={filling.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
                    {filling.badge && (
                      <div
                        className={`absolute bottom-3 left-3 rounded-md px-2 py-1 text-[12px] font-medium shadow-sm ${
                          filling.badgeTone === "popular"
                            ? "bg-strawberry-accent text-white"
                            : filling.badgeTone === "signature"
                              ? "bg-dadda-primary text-on-primary"
                              : "bg-surface text-on-surface"
                        }`}
                      >
                        {filling.badge}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-grow flex-col justify-between gap-2">
                    <div>
                      <h3 className="mb-1 font-display text-xl font-semibold text-chocolate-text group-hover:text-dadda-primary">
                        {filling.name}
                      </h3>
                      <p className="line-clamp-2 text-sm text-on-surface-variant">{filling.description}</p>
                    </div>
                    <div className={`mt-2 text-sm font-semibold ${filling.price ? "text-dadda-primary" : "text-on-surface-variant"}`}>
                      {filling.price ? `+ ${formatRand(filling.price)}` : "Included"}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
