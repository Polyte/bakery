"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CloudUpload } from "lucide-react"
import DeliveryPicker from "@/components/delivery-picker"
import { pickupSelection, deliveryFeeLabel, type DeliverySelection } from "@/lib/delivery"
import { formatRand } from "@/lib/cake-order"
import { CAKE_CATEGORIES } from "@/lib/cakes"
import { CUPCAKES_FROM_PRICE } from "@/lib/cupcakes"
import { POPSTICLES_FROM_PRICE } from "@/lib/popsticles"

const CATEGORIES = [
  { value: "wedding", label: "Wedding Cake", from: CAKE_CATEGORIES.wedding.fromPrice, unit: "2-tier" },
  { value: "birthday", label: "Birthday Cake", from: CAKE_CATEGORIES.birthday.fromPrice, unit: "cake" },
  { value: "anniversary", label: "Anniversary Cake", from: CAKE_CATEGORIES.anniversary.fromPrice, unit: "cake" },
  { value: "children", label: "Children's Party Cake", from: CAKE_CATEGORIES.children.fromPrice, unit: "cake" },
  { value: "corporate", label: "Corporate Event Cake", from: CAKE_CATEGORIES.corporate.fromPrice, unit: "cake or dozen" },
  { value: "scones", label: "Scones", from: 300, unit: "5L tub" },
  { value: "cupcakes", label: "Cupcakes", from: CUPCAKES_FROM_PRICE, unit: "each" },
  { value: "popsticles", label: "Popsticles", from: POPSTICLES_FROM_PRICE, unit: "each" },
  { value: "other", label: "Other Scones & Treats", from: 35, unit: "treat" },
] as const

const fieldClass =
  "w-full border-b border-outline-variant bg-cream-surface px-4 py-3 font-sans text-base text-on-surface placeholder:text-on-surface-variant/50 focus:border-dadda-primary focus:outline-none"
const labelClass = "text-sm font-semibold uppercase tracking-[0.05em] text-on-surface-variant"

function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function OrderNowForm() {
  const searchParams = useSearchParams()
  const preset = searchParams.get("category")
  const defaultCategory = CATEGORIES.some((c) => c.value === preset) ? preset! : "wedding"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState("")
  const [category, setCategory] = useState(defaultCategory)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)
  const [delivery, setDelivery] = useState<DeliverySelection>(pickupSelection)
  const minDate = useMemo(() => tomorrowISO(), [])

  const selected = CATEGORIES.find((item) => item.value === category) ?? CATEGORIES[0]

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsSubmitting(true)

    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get("name") || "")
    const email = String(data.get("email") || "")
    const phone = String(data.get("phone") || "")
    const categoryValue = String(data.get("category") || "")
    const categoryLabel = CATEGORIES.find((c) => c.value === categoryValue)?.label || categoryValue
    const occasion = String(data.get("occasion") || "Not specified")
    const date = String(data.get("date") || "")
    const quantity = String(data.get("quantity") || "Not specified")
    const requirements = String(data.get("requirements") || "Not specified")
    const collection =
      delivery.delivery === "pickup"
        ? "Store pickup from 6814 Strawberry Street, Amandasig"
        : [
            `Delivery to: ${delivery.address || "Address not confirmed"}`,
            delivery.deliveryKm != null
              ? `Distance: ${delivery.deliveryKm} km · Fee: ${formatRand(delivery.deliveryFee)} (R5/km)`
              : "Distance: not yet quoted",
          ].join("\n")

    if (delivery.delivery === "delivery" && delivery.deliveryFee <= 0) {
      setStatus({
        ok: false,
        msg: "Choose a delivery address from the suggestions so we can add the R5/km fee, or switch to store pickup.",
      })
      setIsSubmitting(false)
      return
    }

    const message = [
      "New order enquiry from the Order Now page.",
      "",
      `Product category: ${categoryLabel}`,
      `Starting price shown: from ${formatRand(selected.from)} (${selected.unit})`,
      `Occasion: ${occasion}`,
      `Preferred date: ${date}`,
      `Number of people / quantity: ${quantity}`,
      collection,
      `Inspiration image: ${fileName || "None attached"}`,
      "",
      "Design & flavor requirements:",
      requirements,
    ].join("\n")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      })
      const responseData = await res.json()
      if (!res.ok || !responseData?.success) {
        throw new Error(responseData?.error || "Failed to send enquiry")
      }
      setStatus({ ok: true, msg: "Thank you. Your enquiry was sent. We'll be in touch soon." })
      form.reset()
      setFileName("")
      setDelivery(pickupSelection())
      setCategory(defaultCategory)
    } catch (err: unknown) {
      setStatus({
        ok: false,
        msg: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-8 rounded-xl border border-outline-variant/30 bg-surface p-8 shadow-sm lg:p-12"
      onSubmit={onSubmit}
      data-animate="fade-up"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-[28px] font-semibold leading-9 text-chocolate-text md:text-[32px] md:leading-10">
          Request a Quote
        </h2>
        <Link
          href="/order/filling"
          className="text-sm font-semibold uppercase tracking-widest text-dadda-primary hover:text-primary-container"
        >
          Configure a cake
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="order-name">
            Full Name *
          </label>
          <input className={fieldClass} id="order-name" name="name" placeholder="Jane Doe" required type="text" />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="order-phone">
            WhatsApp / Phone *
          </label>
          <input
            className={fieldClass}
            id="order-phone"
            name="phone"
            placeholder="+27 76 219 6675"
            required
            type="tel"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="order-email">
          Email Address *
        </label>
        <input
          className={fieldClass}
          id="order-email"
          name="email"
          placeholder="jane@example.com"
          required
          type="email"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="order-category">
            Product Category
          </label>
          <select
            className={`${fieldClass} appearance-none`}
            id="order-category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="text-[12px] font-medium tracking-wide text-dadda-primary">
            Starting from {formatRand(selected.from)} · {selected.unit}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="order-occasion">
            Occasion (Optional)
          </label>
          <input className={fieldClass} id="order-occasion" name="occasion" placeholder="e.g. 1st Birthday" type="text" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="order-date">
            Preferred Date *
          </label>
          <input className={fieldClass} id="order-date" min={minDate} name="date" required type="date" />
          <p className="text-[12px] text-on-surface-variant">
            Birthday cakes need 3–5 days. Weddings need 6–8 weeks.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="order-quantity">
            Number of People / Quantity
          </label>
          <input className={fieldClass} id="order-quantity" min={1} name="quantity" placeholder="e.g. 50" type="number" />
        </div>
      </div>

      <DeliveryPicker value={delivery} onChange={setDelivery} idPrefix="quote-delivery" />
      {delivery.delivery === "delivery" && delivery.deliveryFee > 0 && (
        <p className="text-sm text-on-surface-variant">
          This quote includes {deliveryFeeLabel(delivery.deliveryKm, delivery.deliveryFee)}. We will confirm the total
          when we reply.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="order-requirements">
          Design &amp; Flavor Requirements
        </label>
        <textarea
          className={`${fieldClass} resize-none`}
          id="order-requirements"
          name="requirements"
          placeholder="Tell us about the theme, colors, and flavors you have in mind..."
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Inspiration Image (Optional)</span>
        <input
          ref={fileInputRef}
          accept=".svg,.png,.jpg,.jpeg,.gif,image/*"
          className="sr-only"
          type="file"
          onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
        />
        <button
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-outline-variant bg-cream-surface p-8 text-center hover:bg-surface-container"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload className="h-8 w-8 text-outline" />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold uppercase tracking-[0.05em] text-dadda-primary">
              {fileName || "Click to upload or drag and drop"}
            </span>
            <span className="text-[12px] font-medium tracking-[0.03em] text-on-surface-variant">
              SVG, PNG, JPG or GIF (max. 5MB)
            </span>
          </span>
        </button>
      </div>

      {status && (
        <p className={`text-sm ${status.ok ? "text-sage-muted" : "text-strawberry-accent"}`}>{status.msg}</p>
      )}

      <button className="btn-primary mt-4 w-full py-4 shadow-sm hover:shadow-md" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Submit Enquiry"}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        Ready to pay the listed price?{" "}
        <Link href="#trending" className="font-semibold text-dadda-primary hover:text-primary-container">
          Shop the menu
        </Link>{" "}
        or{" "}
        <Link href="/order/enquiry" className="font-semibold text-dadda-primary hover:text-primary-container">
          build a custom pastry order
        </Link>
        .
      </p>
    </form>
  )
}
