"use client"

import Link from "next/link"
import { CheckCircle2, Home, Phone, RefreshCw, Store, Truck } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import { useCakeOrder } from "@/components/cake-order-provider"
import { extrasList, formatRand, getFilling, grandTotal, messageCardAmount } from "@/lib/cake-order"

export default function OrderTrackingPage() {
  const { draft, lastOrder } = useCakeOrder()
  const order = lastOrder ?? draft
  const filling = getFilling(order.fillingId)
  const orderNumber = order.orderNumber ?? "#DC-0000"

  return (
    <div className="flex min-h-screen w-full flex-col bg-background pb-section-gap">
      <div className="relative z-0 mb-[-120px] h-[350px] w-full overflow-hidden">
        <LazyImage src="/shop/overview-hero.jpg" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/80 to-background" />
        <div className="relative z-10 mx-auto flex max-w-container-max flex-col items-center px-margin-mobile pt-28 text-center lg:px-margin-desktop">
          <span className="mb-4 text-[12px] font-medium uppercase tracking-[0.2em] text-dadda-primary" data-animate="fade-up">
            Order Status
          </span>
          <h1 className="mb-2 font-display text-[32px] font-semibold text-chocolate-text" data-animate="fade-up">
            Tracking Your Treats
          </h1>
          <p className="max-w-lg text-lg text-on-surface-variant" data-animate="fade-up">
            Your artisanal delights are being prepared with care. Follow their journey below.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-container-max flex-col gap-gutter px-margin-mobile lg:flex-row lg:px-margin-desktop">
        <div className="flex w-full flex-col gap-6 lg:w-5/12">
          <div className="flex flex-col gap-6 rounded-xl bg-surface-container-lowest p-8 shadow-xl shadow-dadda-primary/5" data-animate="fade-up">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="mb-1 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">{orderNumber}</span>
                <h2 className="font-display text-2xl font-semibold text-chocolate-text">{order.productName}</h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container">
                <span className="text-lg text-on-primary-container">🎂</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {filling && (
                <div className="flex items-center justify-between border-b border-surface-variant pb-4">
                  <span className="text-on-surface-variant">1x {filling.name}</span>
                  <span className="text-sm font-semibold text-dadda-primary">
                    {filling.price ? formatRand(filling.price) : "Included"}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-on-surface-variant">1x {order.productName}</span>
                <span className="text-sm font-semibold text-dadda-primary">{formatRand(order.sizePrice)}</span>
              </div>
              {extrasList(order).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">
                    {item.qty}x {item.name}
                  </span>
                  <span className="text-sm font-semibold text-dadda-primary">{formatRand(item.price * item.qty)}</span>
                </div>
              ))}
              {order.delivery === "delivery" && order.deliveryFee > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">
                    Delivery{order.deliveryKm != null ? ` · ${order.deliveryKm} km` : ""}
                  </span>
                  <span className="text-sm font-semibold text-dadda-primary">{formatRand(order.deliveryFee)}</span>
                </div>
              )}
              {order.messageCard ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">Message card</span>
                  <span className="text-sm font-semibold text-dadda-primary">{formatRand(messageCardAmount(order))}</span>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-4 text-center">
              <span className="mb-1 text-[12px] font-medium uppercase tracking-widest text-dadda-primary">
                {order.delivery === "delivery" ? "Estimated Arrival" : "Pickup Window"}
              </span>
              <span className="font-display text-2xl font-semibold text-chocolate-text">{order.timeSlot}</span>
              {order.delivery === "delivery" && order.address ? (
                <span className="mt-2 text-sm text-on-surface-variant">
                  {order.address}
                  {order.deliveryKm != null ? ` · ${order.deliveryKm} km · ${formatRand(order.deliveryFee)}` : ""}
                </span>
              ) : null}
            </div>
            <p className="text-center text-sm text-on-surface-variant">Total {formatRand(grandTotal(order))}</p>
          </div>

          <div className="relative flex flex-col gap-8 overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-xl shadow-dadda-primary/5" data-animate="fade-up">
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 overflow-hidden rounded-full opacity-10 mix-blend-multiply">
              <LazyImage src="/shop/tracking-deco.jpg" alt="" fill className="object-cover" sizes="256px" />
            </div>
            <h3 className="relative z-10 font-display text-2xl font-semibold text-chocolate-text">Preparation Journey</h3>
            <div className="relative z-10 flex flex-col gap-8">
              <div className="absolute bottom-6 left-[15px] top-6 w-[2px] bg-surface-variant">
                <div className="h-1/2 w-full bg-tertiary" />
              </div>
              {[
                { title: "In the Oven", copy: "Baked to perfection.", done: true },
                { title: "Quality Check", copy: "Ensuring artisanal standards.", done: true, check: true },
                { title: "Decorating Final Touches", copy: "Applying buttercream and delicate flowers.", current: true },
                { title: "Out for Delivery", copy: "Soon to be on its way to you.", icon: Truck, muted: true },
                { title: "Delivered", copy: "Enjoy your sweet treats.", icon: Home, muted: true },
              ].map((step) => (
                <div key={step.title} className={`relative z-10 flex items-start gap-6 ${step.muted ? "opacity-50" : ""}`}>
                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-surface-container-lowest shadow-sm ${
                      step.current ? "border-tertiary" : step.done ? "border-dadda-primary" : "border-outline-variant"
                    }`}
                  >
                    {step.check ? (
                      <CheckCircle2 className="h-4 w-4 text-sage-muted" />
                    ) : step.current ? (
                      <div className="h-4 w-4 rounded-full bg-tertiary" />
                    ) : step.done ? (
                      <div className="h-4 w-4 rounded-full bg-dadda-primary" />
                    ) : step.icon ? (
                      <step.icon className="h-4 w-4 text-outline-variant" />
                    ) : null}
                  </div>
                  <div className="flex flex-col">
                    <span className={`mb-1 text-sm font-semibold ${step.current ? "text-tertiary" : "text-on-surface"}`}>
                      {step.title}
                    </span>
                    <span className="text-sm text-on-surface-variant">{step.copy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-7/12">
          <div className="flex min-h-[500px] flex-col rounded-xl bg-surface-container-lowest p-4 shadow-xl shadow-dadda-primary/5" data-animate="fade-up">
            <div className="mb-4 flex items-center justify-between px-4 pt-4">
              <h3 className="font-display text-2xl font-semibold text-chocolate-text">Delivery Route</h3>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-on-surface-variant shadow-sm hover:bg-surface-container hover:text-dadda-primary" aria-label="Refresh">
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-grow overflow-hidden rounded-lg bg-surface-variant">
              <iframe
                title="Bakery location"
                className="h-full min-h-[360px] w-full border-0"
                loading="lazy"
                src={
                  order.delivery === "delivery" && order.address
                    ? `https://maps.google.com/maps?q=${encodeURIComponent(order.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                    : "https://maps.google.com/maps?q=6814+Strawberry+Street+Amandasig+Pretoria&t=&z=14&ie=UTF8&iwloc=&output=embed"
                }
              />
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-xl border border-surface-variant bg-surface-container-lowest/90 p-4 shadow-lg backdrop-blur-md md:right-auto">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
                  <Store className="h-5 w-5 text-on-primary-container" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant">
                    {order.delivery === "delivery" ? "Delivering to" : "Bakery Location"}
                  </span>
                  <span className="text-sm font-semibold text-chocolate-text">
                    {order.delivery === "delivery" && order.address
                      ? order.address
                      : "6814 Strawberry Street, Amandasig"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-end gap-4 sm:flex-row">
            <Link
              href="/order/modify"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-tertiary px-8 py-4 text-sm font-semibold text-tertiary hover:bg-tertiary hover:text-white"
            >
              Modify Order
            </Link>
            <a
              href="tel:+27762196675"
              className="flex items-center justify-center gap-2 rounded-full bg-dadda-primary px-8 py-4 text-sm font-semibold text-on-primary shadow-md hover:bg-primary-container"
            >
              <Phone className="h-5 w-5" /> Contact Bakery
            </a>
          </div>
          <Link href="/order/calendar" className="text-center text-sm font-semibold uppercase tracking-widest text-dadda-primary">
            Add to Calendar
          </Link>
        </div>
      </div>
    </div>
  )
}
