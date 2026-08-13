"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Lock, Minus, Plus } from "lucide-react"
import Link from "next/link"
import LazyImage from "@/components/lazy-image"
import BankingDetailsCard from "@/components/banking-details-card"
import { CheckoutAccount, type CheckoutAccountHandle } from "@/components/checkout-account"
import { useCakeOrder } from "@/components/cake-order-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ApplePayIcon,
  CreditPayIcon,
  GooglePayIcon,
  InstantEftIcon,
  MastercardIcon,
  VisaIcon,
  YocoMark,
} from "@/components/payment-brand-icons"
import { SITE } from "@/lib/seo"
import {
  cakeLineTotal,
  deliveryAmount,
  deliveryPatchFromSelection,
  extraKindLabel,
  extrasList,
  extrasTotal,
  formatRand,
  generateOrderNumber,
  grandTotal,
  includeCakeInTotal,
  isDeliveryReady,
  messageCardAmount,
  CAKE_CATEGORY_LABELS,
  STORAGE_KEY,
} from "@/lib/cake-order"
import { buildYocoPaymentPageUrl } from "@/lib/yoco-page"
import DeliveryPicker from "@/components/delivery-picker"
import { deliveryFeeLabel } from "@/lib/delivery"
import { notifyOrderEmails } from "@/lib/place-order"

const ONLINE_METHODS = [
  {
    id: "eft",
    name: "Online EFT",
    copy: "Pay instantly from your bank app. Funds are confirmed in minutes through Yoco Instant EFT.",
    icons: [InstantEftIcon],
  },
  {
    id: "card",
    name: "Card",
    copy: "Visa and Mastercard debit cards. Card details are entered on Yoco's secure hosted page.",
    icons: [VisaIcon, MastercardIcon],
  },
  {
    id: "credit",
    name: "Credit Payment",
    copy: "Visa and Mastercard credit cards, processed securely by Yoco. We never store card numbers.",
    icons: [CreditPayIcon],
  },
  {
    id: "apple",
    name: "Apple Pay",
    copy: "Pay with Face ID or Touch ID on iPhone, iPad, and Mac. Available on Yoco's checkout.",
    icons: [ApplePayIcon],
  },
  {
    id: "google",
    name: "Google Pay",
    copy: "Pay with Google Pay on Android and Chrome. Your cards stay in your Google Wallet.",
    icons: [GooglePayIcon],
  },
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const { draft, update, updateCustomer, confirmOrder, setExtraQty } = useCakeOrder()
  const accountRef = useRef<CheckoutAccountHandle>(null)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const total = grandTotal(draft)
  const fee = deliveryAmount(draft)
  const extras = extrasList(draft)
  const showCake = includeCakeInTotal(draft)
  const cakeAmount = cakeLineTotal(draft)
  const extrasAmount = extrasTotal(draft)
  const goodsSubtotal = cakeAmount + extrasAmount
  const cardFee = messageCardAmount(draft)
  const cartEmpty = !showCake && extras.length === 0

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get("payment")
    if (payment === "cancelled") setNotice("Payment was cancelled. You can try again when you are ready.")
    if (payment === "failed") setError("Payment did not go through. Please try another method or card.")
  }, [])

  const customerName = `${draft.customer.firstName} ${draft.customer.lastName}`.trim()

  const ensureCustomer = () => {
    if (!customerName) {
      setError("Please add your name so we can confirm the order.")
      return false
    }
    if (!draft.customer.email) {
      setError("Please add your email address.")
      return false
    }
    if (cartEmpty) {
      setError("Your cart is empty.")
      return false
    }
    if (!isDeliveryReady(draft)) {
      setError("Choose a delivery address in range, or switch to store pickup.")
      return false
    }
    if (draft.messageCard && !(draft.cardMessage ?? "").trim()) {
      setError("Please write the greeting for your message card, or uncheck the card add-on.")
      return false
    }
    setError(null)
    return true
  }

  const prepareAccount = async () => {
    const result = await accountRef.current?.ensure()
    if (!result) return { keepCustomer: false }
    if (result.ok === false) {
      setError(result.error)
      return null
    }
    return { keepCustomer: result.keepCustomer }
  }

  const payWithYoco = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ensureCustomer() || paying) return
    const account = await prepareAccount()
    if (!account) return
    setPaying(true)
    const orderNumber = draft.orderNumber ?? generateOrderNumber()
    try {
      sessionStorage.setItem("dadda-keep-customer", account.keepCustomer ? "1" : "0")
      sessionStorage.setItem("dadda-pending-yoco-email", orderNumber)
    } catch {
      /* ignore */
    }
    const nextDraft = { ...draft, orderNumber, paymentMethod: "yoco" as const }
    update({ orderNumber, paymentMethod: "yoco" })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft))
    } catch {
      /* still redirect */
    }
    window.location.href = buildYocoPaymentPageUrl({
      amount: total,
      reference: orderNumber,
      firstName: draft.customer.firstName,
      lastName: draft.customer.lastName,
      email: draft.customer.email,
      successUrl: `${window.location.origin}/order/confirmed?payment=yoco`,
    })
  }

  const confirmEft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ensureCustomer() || paying) return
    const account = await prepareAccount()
    if (!account) return
    setPaying(true)
    const orderNumber = draft.orderNumber ?? generateOrderNumber()
    const nextDraft = { ...draft, orderNumber, paymentMethod: "eft" as const }
    const emailed = await notifyOrderEmails(nextDraft)
    confirmOrder({ paymentMethod: "eft", orderNumber }, { keepCustomer: account.keepCustomer })
    router.push(emailed ? "/order/confirmed?payment=eft" : "/order/confirmed?payment=eft&email=failed")
  }

  const tabClass =
    "flex h-auto flex-1 items-center justify-center rounded-xl px-4 py-4 text-sm font-semibold shadow-none data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=inactive]:bg-surface-container data-[state=inactive]:text-on-surface"
  const orderNowClass =
    "flex w-full items-center justify-center gap-2 rounded-full bg-dadda-primary py-4 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-md hover:bg-primary-container disabled:opacity-60"
  const eftSubmitDisabled = cartEmpty || !isDeliveryReady(draft) || paying

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-margin-mobile py-12 pt-32 lg:flex-row lg:px-margin-desktop">
      <div className="flex flex-1 flex-col gap-8">
        <div data-animate="fade-up">
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/order/overview" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-dadda-primary hover:text-chocolate-text">
              ← Back to Overview
            </Link>
            <Link href="/cakes" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant hover:text-dadda-primary">
              Add more cakes
            </Link>
            {extras.length > 0 && (
              <>
                <Link href="/treats/cupcakes" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant hover:text-dadda-primary">
                  Add more Cupcakes
                </Link>
                <Link href="/treats/popsticles" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant hover:text-dadda-primary">
                  Add more Popsticles
                </Link>
              </>
            )}
          </div>
          <h1 className="mb-2 font-display text-[32px] font-semibold text-chocolate-text">Payment Details</h1>
          <div className="flex items-center gap-2 text-sm font-semibold text-sage-muted">
            <Lock className="h-[18px] w-[18px]" />
            <span>Secure checkout · Card details stay with Yoco</span>
          </div>
        </div>

        {notice && (
          <p className="rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface" data-animate="fade-up">
            {notice}
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-primary-container/40 px-4 py-3 text-sm text-chocolate-text" role="alert" data-animate="fade-up">
            {error}
          </p>
        )}

        <div className="rounded-xl bg-surface-container p-6 shadow-sm lg:p-8" data-animate="fade-up">
          <h2 className="mb-4 font-display text-xl font-semibold text-chocolate-text">Your details</h2>
          <CustomerFields
            accountRef={accountRef}
            customer={draft.customer}
            name={customerName}
            email={draft.customer.email}
            phone={draft.customer.phone}
            notes={draft.notes}
            messageCard={draft.messageCard}
            cardMessage={draft.cardMessage}
            onNameChange={(value) => {
              const parts = value.trim().split(" ")
              updateCustomer({ firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") })
            }}
            onEmailChange={(email) => updateCustomer({ email })}
            onPhoneChange={(phone) => updateCustomer({ phone })}
            onNotesChange={(notes) => update({ notes })}
            onMessageCardChange={(messageCard) => update({ messageCard })}
            onCardMessageChange={(cardMessage) => update({ cardMessage })}
            onAccountPrefill={(profile) => updateCustomer(profile)}
          />
          <div className="mt-8 border-t border-outline-variant/30 pt-6">
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
              idPrefix="checkout-delivery"
            />
          </div>
        </div>

        <Tabs
          value={draft.paymentMethod}
          onValueChange={(value) => update({ paymentMethod: value === "eft" ? "eft" : "yoco" })}
          className="flex flex-col gap-6"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-4 bg-transparent p-0" data-animate="fade-up">
            <TabsTrigger value="yoco" className={tabClass}>
              Pay Online
            </TabsTrigger>
            <TabsTrigger value="eft" className={tabClass}>
              Banking Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yoco" className="mt-0">
            <form className="flex flex-col gap-6 rounded-xl bg-surface-container p-6 shadow-sm lg:p-8" onSubmit={payWithYoco}>
              <div>
                <h2 className="mb-1 font-display text-xl font-semibold text-chocolate-text">Online payment solutions</h2>
                <p className="mb-5 text-sm text-on-surface-variant">
                  Yoco&apos;s hosted gateway accepts Instant EFT, debit and credit cards, Apple Pay, and Google Pay. Choose any of these on the next screen.
                </p>
                <ul className="flex flex-col gap-3">
                  {ONLINE_METHODS.map((method) => (
                    <li key={method.id} className="flex gap-4 rounded-xl bg-surface p-4 shadow-sm">
                      <div className="flex shrink-0 items-center gap-1.5">
                        {method.icons.map((Icon, index) => (
                          <Icon key={`${method.id}-${index}`} className="h-8 w-12" />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-chocolate-text">{method.name}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">{method.copy}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={paying || cartEmpty || !isDeliveryReady(draft)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-dadda-primary py-4 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-md hover:bg-primary-container disabled:opacity-60"
              >
                <YocoMark className="h-5 w-5" />
                {paying ? "Redirecting to Yoco…" : `Pay ${formatRand(total)} with Yoco`}
              </button>
              <p className="text-center text-[12px] font-medium uppercase tracking-wider text-outline">
                You will complete payment on Yoco&apos;s secure page.{" "}
                <Link href="/privacy" className="text-dadda-primary underline">
                  Privacy &amp; Security
                </Link>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="eft" className="mt-0">
            <form
              id="eft-checkout-form"
              className="flex flex-col gap-6 rounded-xl bg-surface-container p-6 shadow-sm lg:p-8"
              onSubmit={confirmEft}
            >
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed-dim/30 text-dadda-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-chocolate-text">Banking details</h2>
                    <p className="text-sm text-on-surface-variant">Use these Capitec details for a manual EFT transfer, or PayShap to the Standard Bank number.</p>
                  </div>
                </div>
                <BankingDetailsCard />
                <button type="submit" disabled={eftSubmitDisabled} className={`sticky bottom-4 z-20 mt-4 ${orderNowClass}`}>
                  <Lock className="h-5 w-5" />
                  Order Now
                </button>
                <p className="mt-4 text-sm text-on-surface-variant">
                  After you make this order, send proof of payment to{" "}
                  <a className="font-semibold text-dadda-primary underline" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>{" "}
                  with your order number as the reference
                  {draft.orderNumber ? ` (${draft.orderNumber})` : ""}.
                </p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex w-full flex-col gap-8 lg:w-[400px]">
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-xl bg-cream-surface p-8 shadow-xl" data-animate="fade-up">
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-secondary-container/20 blur-2xl" />
          <h2 className="relative z-10 font-display text-2xl font-semibold text-chocolate-text">Order Summary</h2>
          {showCake && (
            <div className="relative z-10 flex items-center gap-4 border-b border-outline-variant/30 pb-6">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg shadow-sm">
                <LazyImage src={draft.productImage} alt={draft.productName} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex flex-col">
                <span className="mb-1 text-sm font-semibold uppercase tracking-wider text-dadda-primary">
                  {draft.category ? CAKE_CATEGORY_LABELS[draft.category] : "Signature Collection"}
                </span>
                <h3 className="mb-1 font-display text-lg font-semibold text-chocolate-text">{draft.productName}</h3>
                <span className="text-on-surface-variant">Qty: 1</span>
              </div>
              <div className="ml-auto text-sm font-semibold text-chocolate-text">{formatRand(cakeAmount)}</div>
            </div>
          )}
          {extras.map((item) => (
            <div key={item.id} className="relative z-10 flex items-center gap-4 border-b border-outline-variant/30 pb-6">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg shadow-sm">
                <LazyImage src={item.image ?? "/videos/popsticles.jpg"} alt={item.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="mb-1 text-sm font-semibold uppercase tracking-wider text-dadda-primary">{extraKindLabel(item)}</span>
                <h3 className="mb-2 font-display text-lg font-semibold text-chocolate-text">{item.name}</h3>
                <div className="inline-flex w-fit items-center rounded-full border border-outline-variant bg-surface">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center text-chocolate-text hover:text-dadda-primary"
                    onClick={() => setExtraQty(item.id, item.qty - 1)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-6 text-center text-sm font-semibold">{item.qty}</span>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center text-chocolate-text hover:text-dadda-primary"
                    onClick={() => setExtraQty(item.id, item.qty + 1)}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="ml-auto text-sm font-semibold text-chocolate-text">{formatRand(item.price * item.qty)}</div>
            </div>
          ))}
          {!showCake && extras.length === 0 && (
            <p className="relative z-10 text-sm text-on-surface-variant">
              Your cart is empty.{" "}
              <Link href="/cakes" className="font-semibold text-dadda-primary underline">
                Add a cake
              </Link>
              , a{" "}
              <Link href="/treats/cupcakes" className="font-semibold text-dadda-primary underline">
                cupcake
              </Link>
              , or a{" "}
              <Link href="/treats/popsticles" className="font-semibold text-dadda-primary underline">
                Popsticle
              </Link>
              .
            </p>
          )}
          <div className="relative z-10 flex flex-col gap-3 border-b border-outline-variant/30 pb-6 text-on-surface-variant">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRand(goodsSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sage-muted">
              <span>
                {draft.delivery === "delivery"
                  ? deliveryFeeLabel(draft.deliveryKm, fee) || "Delivery"
                  : "Pickup"}
              </span>
              <span>{fee ? formatRand(fee) : "Free"}</span>
            </div>
            {draft.messageCard ? (
              <div className="flex justify-between">
                <span>Message card</span>
                <span>{formatRand(cardFee)}</span>
              </div>
            ) : null}
          </div>
          <div className="relative z-10 flex items-center justify-between pt-2">
            <span className="font-display text-xl font-semibold text-chocolate-text">Total</span>
            <span className="font-display text-[32px] leading-10 text-dadda-primary">{formatRand(total)}</span>
          </div>
          {draft.paymentMethod === "eft" ? (
            <button
              type="submit"
              form="eft-checkout-form"
              disabled={eftSubmitDisabled}
              className={`relative z-10 ${orderNowClass}`}
            >
              <Lock className="h-5 w-5" />
              Order Now
            </button>
          ) : null}
          <div className="relative z-10 mt-4 flex items-start gap-3 rounded-lg bg-surface-container p-4">
            <span className="mt-0.5 text-dadda-primary">★</span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-chocolate-text">Satisfaction Guaranteed</span>
              <span className="mt-1 text-[12px] font-medium text-on-surface-variant">
                Our master bakers ensure every detail is perfect before it leaves the kitchen.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomerFields({
  accountRef,
  customer,
  name,
  email,
  phone,
  notes,
  messageCard,
  cardMessage,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onNotesChange,
  onMessageCardChange,
  onCardMessageChange,
  onAccountPrefill,
}: {
  accountRef: React.Ref<CheckoutAccountHandle>
  customer: { firstName: string; lastName: string; email: string; phone: string }
  name: string
  email: string
  phone: string
  notes: string
  messageCard: boolean
  cardMessage: string
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onNotesChange: (value: string) => void
  onMessageCardChange: (value: boolean) => void
  onCardMessageChange: (value: string) => void
  onAccountPrefill: (profile: { firstName: string; lastName: string; email: string; phone: string }) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2 sm:col-span-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="payer">
          Name
        </label>
        <input
          id="payer"
          required
          className="w-full rounded-md bg-surface px-4 py-3 text-on-surface shadow-sm outline-none"
          placeholder="Your full name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="w-full rounded-md bg-surface px-4 py-3 text-on-surface shadow-sm outline-none"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          className="w-full rounded-md bg-surface px-4 py-3 text-on-surface shadow-sm outline-none"
          placeholder="076 219 6675"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </div>
      <CheckoutAccount ref={accountRef} customer={customer} onPrefill={onAccountPrefill} />
      <div className="flex flex-col gap-2 sm:col-span-2">
        <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="comments">
          Comments / message
        </label>
        <textarea
          id="comments"
          rows={3}
          className="w-full resize-none rounded-md bg-surface px-4 py-3 text-on-surface shadow-sm outline-none"
          placeholder="Allergies, dietary notes, or anything we should know for the kitchen."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-md bg-surface px-4 py-3 shadow-sm">
          <input
            id="message-card"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-dadda-primary"
            checked={messageCard}
            onChange={(e) => onMessageCardChange(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-chocolate-text">Add a card with a message — R75</span>
            <span className="mt-1 block text-sm text-on-surface-variant">
              A handwritten greeting card tucked with your order, not a payment card.
            </span>
          </span>
        </label>
        {messageCard ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="card-message">
              Card message
            </label>
            <textarea
              id="card-message"
              rows={2}
              required
              className="w-full resize-none rounded-md bg-surface px-4 py-3 text-on-surface shadow-sm outline-none"
              placeholder="Happy birthday, with love from…"
              value={cardMessage}
              onChange={(e) => onCardMessageChange(e.target.value)}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
