"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ChefHat, Copy, Mail, Paintbrush, Truck } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import BankingDetailsCard from "@/components/banking-details-card"
import OrderFireworks from "@/components/order-fireworks"
import { useCakeOrder } from "@/components/cake-order-provider"
import { cartCount, displayConfirmedOrder, formatLongDate } from "@/lib/cake-order"
import { notifyOrderEmails } from "@/lib/place-order"
import { SITE } from "@/lib/seo"

export default function OrderConfirmedPage() {
  const { draft, lastOrder, confirmOrder, hydrated } = useCakeOrder()
  const [paymentKind, setPaymentKind] = useState<string | null>(null)
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [emailFailed, setEmailFailed] = useState(false)
  const isEft = paymentKind === "eft"
  const order = displayConfirmedOrder(draft, lastOrder)
  const orderNumber = order.orderNumber ?? (hydrated ? "#DC-0000" : "…")
  const popMailto = `mailto:${SITE.email}?subject=${encodeURIComponent(`Proof of payment ${orderNumber}`)}&body=${encodeURIComponent(`Please find attached proof of payment for order ${orderNumber}.`)}`

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get("payment")
    setPaymentKind(payment)
    if (params.get("email") === "failed") setEmailFailed(true)
    if (!hydrated) return
    if (payment !== "yoco" && payment !== "eft") return

    const alreadyConfirmed =
      Boolean(lastOrder?.confirmedAt) &&
      (lastOrder?.orderNumber === draft.orderNumber || cartCount(draft) === 0)
    const shouldConfirm = cartCount(draft) > 0 || Boolean(draft.orderNumber)
    if (!alreadyConfirmed && shouldConfirm) {
      let keepCustomer = false
      try {
        keepCustomer = sessionStorage.getItem("dadda-keep-customer") === "1"
      } catch {
        /* guest checkout */
      }
      confirmOrder(payment === "eft" ? { paymentMethod: "eft" } : { paymentMethod: "yoco" }, { keepCustomer })
    }

    if (payment !== "yoco") return
    let pending: string | null = null
    try {
      pending = sessionStorage.getItem("dadda-pending-yoco-email")
    } catch {
      return
    }
    const emailDraft = cartCount(draft) > 0 ? draft : lastOrder
    if (!pending || !emailDraft || pending !== (emailDraft.orderNumber ?? pending)) return
    try {
      sessionStorage.removeItem("dadda-pending-yoco-email")
    } catch {
      /* still send once */
    }
    void notifyOrderEmails({ ...emailDraft, orderNumber: pending, paymentMethod: "yoco" }).then((emailed) => {
      if (!emailed) setEmailFailed(true)
    })
  }, [hydrated, confirmOrder, draft, lastOrder])

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopiedNumber(true)
      window.setTimeout(() => setCopiedNumber(false), 1600)
    } catch {
      setCopiedNumber(false)
    }
  }

  return (
    <div className="relative flex min-h-[819px] w-full flex-col items-center justify-center overflow-hidden py-24">
      <OrderFireworks />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute -left-[200px] -top-[200px] h-[800px] w-[800px] rounded-full bg-secondary-container/20 blur-[120px]" />
        <div className="absolute -right-[100px] bottom-[10%] h-[600px] w-[600px] rounded-full bg-primary-container/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[800px] flex-col items-center px-margin-mobile text-center lg:px-0">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center" data-animate="scale">
          <LazyImage src="/shop/success-icon.jpg" alt="Order confirmed" width={96} height={96} className="h-24 w-24 rounded-full object-cover shadow-lg" />
          <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-dadda-primary shadow-md">
            <Check className="h-6 w-6 text-on-primary" />
          </div>
        </div>

        <h1 className="mb-6 font-display text-[28px] font-bold tracking-tight text-chocolate-text md:text-5xl" data-animate="fade-up">
          Sweet Success!
          <br />
          <span className="font-display text-[32px] font-semibold italic text-dadda-primary">Your Order is Confirmed.</span>
        </h1>
        <p className="mb-12 max-w-xl text-lg text-on-surface-variant" data-animate="fade-up">
          {paymentKind === "yoco"
            ? "Yoco has confirmed your payment and our bakers are preparing your order. A confirmation email is on its way to your inbox."
            : isEft
              ? "We have your order. Please send proof of payment to the kitchen so we can match your transfer."
              : "We've received your order and our bakers are already preparing to bring your sweet vision to life. A confirmation email is on its way to your inbox."}
        </p>
        {emailFailed ? (
          <p className="mb-8 max-w-xl rounded-xl bg-primary-container/40 px-4 py-3 text-sm text-chocolate-text" data-animate="fade-up">
            Your order is confirmed. We could not send the confirmation email automatically. Please keep your order number and, for EFT, email proof of payment to {SITE.email}.
          </p>
        ) : null}

        <div className="group relative mb-10 w-full overflow-hidden rounded-3xl bg-surface-container-lowest p-8 shadow-2xl lg:p-12" data-animate="fade-up">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent" />
          <div className="relative z-10 mb-8 flex flex-col items-center gap-2 rounded-2xl bg-cream-surface px-6 py-6">
            <span className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Order Number</span>
            <span className="font-display text-4xl font-semibold text-chocolate-text md:text-5xl">{orderNumber}</span>
            <button
              type="button"
              onClick={copyOrderNumber}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-dadda-primary hover:bg-primary-container/40"
            >
              {copiedNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedNumber ? "Copied" : "Copy number"}
            </button>
          </div>
          <div className="relative z-10 grid grid-cols-1 gap-8 text-left md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Date</span>
              <span className="font-display text-xl font-semibold text-chocolate-text">{formatLongDate(order.date)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Time Slot</span>
              <span className="font-display text-xl font-semibold text-chocolate-text">{order.timeSlot}</span>
            </div>
          </div>
        </div>

        {isEft && (
          <div className="mb-16 w-full text-left">
            <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-xl lg:p-8">
              <p className="mb-6 text-center text-base leading-7 text-on-surface-variant">
                Please send proof of payment to{" "}
                <a className="font-semibold text-dadda-primary underline" href={popMailto}>
                  {SITE.email}
                </a>
                . Include <span className="font-semibold text-chocolate-text">{orderNumber}</span> in the email subject and as your payment reference.
              </p>
              <a
                href={popMailto}
                className="mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-dadda-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-md hover:bg-primary-container"
              >
                <Mail className="h-4 w-4" />
                Email proof of payment
              </a>
              <h3 className="mb-3 font-display text-lg font-semibold text-chocolate-text">Banking details</h3>
              <p className="mb-4 text-sm text-on-surface-variant">Use these Capitec details if you still need to transfer, or PayShap to the Standard Bank number.</p>
              <BankingDetailsCard compact />
            </div>
          </div>
        )}

        <div className="mb-16 w-full" data-animate="fade-up">
          <h3 className="relative mb-12 inline-block font-display text-2xl font-semibold text-chocolate-text">
            What&apos;s Next?
            <span className="absolute -bottom-4 left-1/2 h-[2px] w-12 -translate-x-1/2 bg-dadda-primary/30" />
          </h3>
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3" data-stagger>
            {[
              { icon: ChefHat, title: "1. Baking", copy: "We're gathering the finest ingredients." },
              { icon: Paintbrush, title: "2. Decorating", copy: "Adding the final artisanal touches." },
              { icon: Truck, title: "3. Delivery", copy: order.delivery === "delivery" ? "Your treats go to the address on the order." : "Collect from 6814 Strawberry Street, Amandasig." },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center gap-4 text-center" data-stagger-item>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-dadda-primary shadow-sm">
                  <step.icon className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-widest text-chocolate-text">{step.title}</h4>
                  <p className="text-on-surface-variant">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link
            href="/order/tracking"
            className="rounded-full bg-dadda-primary px-10 py-4 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-md hover:bg-primary-container hover:text-on-primary-container"
          >
            View Order Status
          </Link>
          <Link
            href="/order/calendar"
            className="rounded-full border border-outline-variant px-8 py-4 text-sm font-semibold uppercase tracking-widest text-chocolate-text hover:border-dadda-primary hover:text-dadda-primary"
          >
            Add to Calendar
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-widest text-chocolate-text hover:text-dadda-primary"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
