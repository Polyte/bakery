"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import { useCakeOrder } from "@/components/cake-order-provider"
import DeliveryPicker from "@/components/delivery-picker"
import { deliveryPatchFromSelection, isDeliveryReady } from "@/lib/cake-order"

export default function ModifyOrderPage() {
  const router = useRouter()
  const { draft, update } = useCakeOrder()
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState(draft.notes)
  const [contactPref, setContactPref] = useState(draft.contactPref)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDeliveryReady(draft)) {
      setError("Choose a delivery address in range, or switch to store pickup.")
      return
    }
    update({
      notes,
      contactPref,
    })
    setError(null)
    setSubmitted(true)
    window.setTimeout(() => router.push("/order/tracking"), 900)
  }

  return (
    <div className="relative flex min-h-[800px] w-full items-center justify-center p-4 pt-28">
      <div className="absolute inset-0">
        <LazyImage src="/shop/modify-bg.jpg" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-surface/40 backdrop-blur-md" />
      </div>

      <form
        onSubmit={submit}
        className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl"
        data-animate="scale"
      >
        <div className="relative z-10 px-8 py-8 text-center lg:px-16">
          <h1 className="mb-2 font-display text-[32px] font-semibold text-chocolate-text">Modify Your Order</h1>
          <p className="mx-auto max-w-md text-on-surface-variant">
            Need to make a change? Let us know before your treat leaves the kitchen.
          </p>
        </div>

        <div className="flex flex-col gap-8 px-8 pb-10 lg:px-16">
          <div className="relative flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-dadda-primary" htmlFor="reason">
              Reason for Change
            </label>
            <div className="relative">
              <select
                id="reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full appearance-none rounded-lg bg-surface-container-low px-4 py-4 text-on-surface outline-none focus:ring-2 focus:ring-dadda-primary/50"
              >
                <option disabled value="">
                  Select an option...
                </option>
                <option value="time">Change Pickup Time</option>
                <option value="note">Add Note</option>
                <option value="address">Update Address</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-dadda-primary" htmlFor="notes">
              Order Notes / Customizations
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Please add a 'Happy Birthday' plaque..."
              className="w-full resize-none rounded-lg bg-surface-container-low px-4 py-4 text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-dadda-primary/50"
            />
          </div>

          <div className="flex flex-col gap-4">
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
              idPrefix="modify-delivery"
            />
            {error && <p className="text-sm text-strawberry-accent">{error}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-dadda-primary">Contact Preference</span>
            <div className="flex gap-4">
              {(
                [
                  { id: "call" as const, label: "Call Me" },
                  { id: "whatsapp" as const, label: "WhatsApp Me" },
                ]
              ).map((opt) => (
                <label key={opt.id} className="group flex cursor-pointer items-center gap-3">
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="contact_pref"
                      checked={contactPref === opt.id}
                      onChange={() => setContactPref(opt.id)}
                    />
                    <span className="h-5 w-5 rounded-full border-2 border-outline-variant peer-checked:border-dadda-primary" />
                    <span className="absolute h-2.5 w-2.5 scale-50 rounded-full bg-dadda-primary opacity-0 peer-checked:scale-100 peer-checked:opacity-100" />
                  </span>
                  <span className="text-on-surface group-hover:text-dadda-primary">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-end gap-6 pt-6 before:absolute before:left-0 before:top-0 before:h-px before:w-full before:bg-gradient-to-r before:from-transparent before:via-outline-variant/30 before:to-transparent">
            <button
              type="button"
              onClick={() => router.push("/order/tracking")}
              className="rounded-full px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-dadda-primary"
            >
              Cancel / Go Back
            </button>
            <button
              type="submit"
              className="rounded-full bg-dadda-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-md hover:bg-primary-container"
            >
              {submitted ? "Saved" : "Submit Request"}
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary-fixed-dim/20 blur-3xl" />
      </form>
    </div>
  )
}
