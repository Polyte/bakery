"use client"

import Link from "next/link"
import { ArrowRight, Cake, Calendar, Droplets, Flower2, Lock, Ruler, Sparkles, Star } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import { useCakeOrder } from "@/components/cake-order-provider"
import { cakeLineTotal, deliveryAmount, deliveryPatchFromSelection, extrasList, extrasTotal, extraKindLabel, formatLongDate, formatRand, getFilling, grandTotal, isDeliveryReady, messageCardAmount, CAKE_CATEGORY_LABELS } from "@/lib/cake-order"
import DeliveryPicker from "@/components/delivery-picker"
import { deliveryFeeLabel } from "@/lib/delivery"

function accentIcon(item: string) {
  if (item.toLowerCase().includes("gold")) return Star
  if (item.toLowerCase().includes("rose")) return Flower2
  return Sparkles
}

function accentTone(item: string) {
  if (item.toLowerCase().includes("gold")) return "text-tertiary"
  if (item.toLowerCase().includes("rose")) return "text-sage-muted"
  return "text-dadda-primary"
}

export default function OrderOverviewPage() {
  const { draft, update } = useCakeOrder()
  const filling = getFilling(draft.fillingId)
  const fillingLines = filling
    ? filling.id === "caramel"
      ? [filling.name]
      : [filling.name, "Salted Caramel Drip"]
    : ["Fresh Strawberry Compote", "Salted Caramel Drip"]
  const fee = deliveryAmount(draft)

  return (
    <div className="flex w-full flex-col bg-background pb-section-gap">
      <div className="relative h-[600px] w-full bg-surface-container-lowest">
        <div className="absolute inset-0">
          <LazyImage
            src="/stitch/order-overview-hero.jpg"
            alt="Double tier floral cake with a stand of scones"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/40 to-surface" />
        <div className="absolute bottom-0 left-0 w-full px-margin-mobile pb-10 text-center lg:px-margin-desktop">
          <h1
            className="mb-4 font-display text-[28px] font-bold leading-9 tracking-tight text-chocolate-text md:text-[48px] md:leading-[56px] md:tracking-[-0.02em]"
            data-animate="fade-up"
          >
            {draft.productName}
          </h1>
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em] text-dadda-primary"
            data-animate="fade-up"
          >
            {draft.category ? `${CAKE_CATEGORY_LABELS[draft.category]} · Order Overview` : "Order Overview"}
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-16 flex w-full max-w-[1000px] flex-col gap-gutter px-margin-mobile lg:flex-row lg:px-margin-desktop">
        <div className="flex flex-1 flex-col gap-12">
          <div className="flex flex-col gap-8" data-animate="fade-up">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-dadda-primary" />
              <h2 className="font-display text-2xl font-semibold leading-8 text-chocolate-text">Your Creation</h2>
            </div>
            <div className="flex flex-col gap-6 rounded-xl bg-surface-container p-8 shadow-sm" data-stagger>
              <div className="flex items-start gap-4" data-stagger-item>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed-dim/30">
                  <Ruler className="h-5 w-5 text-dadda-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.05em] text-on-surface">Size &amp; Scale</h3>
                  <p className="text-base leading-6 text-on-surface-variant">
                    {draft.sizeLabel} <span className="text-tertiary">({draft.serves})</span>
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-outline-variant/30" />
              <div className="flex items-start gap-4" data-stagger-item>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed-dim/30">
                  <Cake className="h-5 w-5 text-dadda-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.05em] text-on-surface">Flavor Profile</h3>
                  <p className="mb-1 text-base font-medium leading-6 text-on-surface-variant">{draft.flavorLabel}</p>
                  <p className="text-sm leading-6 text-on-surface-variant/80">
                    Classic, light, and infused with real vanilla bean paste.
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-outline-variant/30" />
              <div className="flex items-start gap-4" data-stagger-item>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed-dim/30">
                  <Droplets className="h-5 w-5 text-dadda-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold uppercase tracking-[0.05em] text-on-surface">Fillings &amp; Finish</h3>
                  {fillingLines.map((line) => (
                    <p key={line} className="text-base leading-6 text-on-surface-variant">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6" data-animate="fade-up">
            <h3 className="text-sm font-semibold uppercase tracking-[0.05em] text-dadda-primary">Decorative Accents</h3>
            <div className="flex flex-wrap gap-3" data-stagger>
              {draft.decorations.map((item) => {
                const Icon = accentIcon(item)
                return (
                  <span
                    key={item}
                    data-stagger-item
                    className="flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-[12px] font-medium leading-4 tracking-[0.03em] text-on-surface-variant"
                  >
                    <Icon className={`h-4 w-4 ${accentTone(item)}`} />
                    {item}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-8" data-animate="fade-up">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-dadda-primary" />
              <h2 className="font-display text-2xl font-semibold leading-8 text-chocolate-text">Logistics</h2>
            </div>
            <div className="flex flex-col gap-8 rounded-xl bg-cream-surface p-8 shadow-sm">
              <DeliveryPicker
                value={{
                  delivery: draft.delivery,
                  address: draft.address,
                  deliveryLat: draft.deliveryLat,
                  deliveryLng: draft.deliveryLng,
                  deliveryKm: draft.deliveryKm,
                  deliveryFee: draft.deliveryFee,
                }}
                onChange={(next) => update(deliveryPatchFromSelection(next))}
                idPrefix="overview-delivery"
              />
              <div className="h-px w-full bg-outline-variant/30" />
              <div className="flex flex-col gap-2">
                <h3 className="text-[12px] font-medium uppercase tracking-[0.03em] text-outline">Date &amp; Time</h3>
                <p className="flex items-center gap-2 text-base leading-6 text-on-surface">
                  <Calendar className="h-[18px] w-[18px] text-dadda-primary" />
                  {formatLongDate(draft.date)}
                </p>
                <p className="text-sm leading-6 text-on-surface-variant">{draft.timeSlot}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-[380px]">
          <div
            className="sticky top-[100px] flex flex-col gap-8 rounded-2xl bg-surface-container-lowest p-8 shadow-xl"
            data-animate="scale"
          >
            <h3 className="text-center font-display text-[32px] font-semibold leading-10 text-chocolate-text">Summary</h3>
            <div className="flex flex-col gap-4">
              {extrasList(draft).length > 0 && (
                <div className="mb-2 flex flex-col gap-3 border-b border-outline-variant/40 pb-4">
                  <h4 className="text-sm font-semibold uppercase tracking-widest text-dadda-primary">Also in your cart</h4>
                  {extrasList(draft).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-on-surface-variant">
                        {item.qty}× {item.name}
                        <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-outline">
                          {extraKindLabel(item)}
                        </span>
                      </span>
                      <span className="text-on-surface">{formatRand(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-base leading-6 text-on-surface-variant">Subtotal</span>
                <span className="text-base leading-6 text-on-surface">{formatRand(cakeLineTotal(draft) + extrasTotal(draft))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base leading-6 text-on-surface-variant">
                  {draft.delivery === "delivery"
                    ? deliveryFeeLabel(draft.deliveryKm, fee) || "Delivery"
                    : "Pickup"}
                </span>
                <span className="text-base leading-6 text-on-surface">{fee ? formatRand(fee) : "Free"}</span>
              </div>
              {draft.messageCard ? (
                <div className="flex items-center justify-between">
                  <span className="text-base leading-6 text-on-surface-variant">Message card</span>
                  <span className="text-base leading-6 text-on-surface">{formatRand(messageCardAmount(draft))}</span>
                </div>
              ) : null}
              {(draft.notes ?? "").trim() ? (
                <p className="text-sm leading-6 text-on-surface-variant">Note: {draft.notes.trim()}</p>
              ) : null}
              <div className="my-2 h-px w-full bg-outline-variant/50" />
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-semibold leading-8 text-chocolate-text">Total</span>
                <span className="font-display text-2xl font-semibold leading-8 text-dadda-primary">
                  {formatRand(grandTotal(draft))}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {!isDeliveryReady(draft) && (
                <p className="text-center text-sm text-strawberry-accent">
                  Choose a delivery address in range, or switch to store pickup, before checkout.
                </p>
              )}
              <Link
                href="/checkout"
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-dadda-primary py-4 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-md hover:bg-primary-container hover:text-on-primary-container"
              >
                Proceed to Checkout
                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/order/filling"
                className="py-4 text-center text-sm font-semibold uppercase tracking-wider text-tertiary hover:text-on-primary-container"
              >
                Edit Selection
              </Link>
              <Link
                href="/order/modify"
                className="text-center text-[12px] font-medium uppercase tracking-wider text-outline hover:text-dadda-primary"
              >
                Modify Order
              </Link>
            </div>
            <Link
              href="/privacy"
              className="mt-2 flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-[0.03em] text-outline hover:text-dadda-primary"
            >
              <Lock className="h-4 w-4" /> Secure Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
