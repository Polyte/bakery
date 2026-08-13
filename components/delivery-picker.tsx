"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, MapPin, Store, Truck } from "lucide-react"
import {
  BAKERY_ORIGIN,
  DELIVERY_RATE_PER_KM,
  MAX_DELIVERY_KM,
  deliveryFeeLabel,
  pickupSelection,
  quoteToSelection,
  type DeliveryQuote,
  type DeliverySelection,
  type DeliverySuggestion,
} from "@/lib/delivery"
import { formatRand } from "@/lib/cake-order"

type DeliveryPickerProps = {
  value: DeliverySelection
  onChange: (next: DeliverySelection) => void
  idPrefix?: string
}

export default function DeliveryPicker({ value, onChange, idPrefix = "delivery" }: DeliveryPickerProps) {
  const [query, setQuery] = useState(value.address)
  const [suggestions, setSuggestions] = useState<DeliverySuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)
  const pickingRef = useRef(false)

  useEffect(() => {
    setQuery(value.address)
  }, [value.address])

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const setPickup = () => {
    setMessage(null)
    setSuggestions([])
    setQuery("")
    onChange(pickupSelection())
  }

  const setDeliveryMode = () => {
    setMessage(null)
    onChange({
      ...value,
      delivery: "delivery",
      deliveryFee: value.address && value.deliveryFee ? value.deliveryFee : 0,
    })
  }

  const search = (text: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (text.trim().length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = window.setTimeout(async () => {
      setLoadingList(true)
      try {
        const res = await fetch(`/api/delivery/autocomplete?q=${encodeURIComponent(text.trim())}`)
        const data = (await res.json()) as { suggestions?: DeliverySuggestion[] }
        setSuggestions(data.suggestions ?? [])
        setOpen(true)
        setActive(0)
      } catch {
        setSuggestions([])
      } finally {
        setLoadingList(false)
      }
    }, 280)
  }

  const quoteAddress = async (input: { address: string; lat?: number; lng?: number }) => {
    setQuoting(true)
    setMessage(null)
    setOpen(false)
    try {
      const res = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = (await res.json()) as DeliveryQuote & { error?: string }
      if (!res.ok) {
        onChange({ ...value, delivery: "delivery", address: input.address, deliveryFee: 0, deliveryKm: null })
        setMessage(data.error || "Could not price this address.")
        return
      }
      const next = quoteToSelection(data)
      setQuery(next.address)
      onChange(next)
      if (data.message) setMessage(data.message)
    } catch {
      setMessage("Could not price this address. Try again.")
    } finally {
      setQuoting(false)
    }
  }

  const choose = (suggestion: DeliverySuggestion) => {
    pickingRef.current = true
    setQuery(suggestion.label)
    void quoteAddress({ address: suggestion.label, lat: suggestion.lat, lng: suggestion.lng }).finally(() => {
      pickingRef.current = false
    })
  }

  const inRange = value.delivery === "delivery" && value.deliveryFee > 0 && value.deliveryKm != null
  const feeCopy = deliveryFeeLabel(value.deliveryKm, value.deliveryFee)

  return (
    <div className="flex flex-col gap-4" ref={wrapRef}>
      <div>
        <span className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Collection</span>
        <div className="mt-2 flex w-full max-w-md rounded-full bg-surface-container-low p-1" role="radiogroup">
          {(
            [
              { id: "pickup" as const, label: "Store pickup", icon: Store },
              { id: "delivery" as const, label: "Delivery", icon: Truck },
            ]
          ).map((opt) => {
            const Icon = opt.icon
            const checked = value.delivery === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => (opt.id === "pickup" ? setPickup() : setDeliveryMode())}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  checked ? "bg-surface-container-lowest text-dadda-primary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {value.delivery === "pickup" ? (
        <p className="flex items-start gap-2 text-sm leading-6 text-on-surface-variant">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-dadda-primary" />
          Collect from {BAKERY_ORIGIN.address}. No delivery fee.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-on-surface-variant" htmlFor={`${idPrefix}-address`}>
            Delivery address
          </label>
          <div className="relative">
            <input
              id={`${idPrefix}-address`}
              required
              autoComplete="off"
              value={query}
              placeholder="Start typing a Gauteng street or suburb..."
              className="w-full rounded-lg bg-surface px-4 py-3 pr-10 text-on-surface outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-dadda-primary/50"
              onChange={(event) => {
                const next = event.target.value
                setQuery(next)
                onChange({
                  ...value,
                  delivery: "delivery",
                  address: next,
                  deliveryFee: 0,
                  deliveryKm: null,
                  deliveryLat: null,
                  deliveryLng: null,
                })
                search(next)
              }}
              onFocus={() => {
                if (suggestions.length) setOpen(true)
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  if (pickingRef.current || quoting) return
                  if (query.trim().length >= 3 && value.deliveryFee === 0) {
                    void quoteAddress({ address: query.trim() })
                  }
                }, 180)
              }}
              onKeyDown={(event) => {
                if (!open || !suggestions.length) {
                  if (event.key === "Enter" && query.trim().length >= 3) {
                    event.preventDefault()
                    void quoteAddress({ address: query.trim() })
                  }
                  return
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setActive((i) => (i + 1) % suggestions.length)
                } else if (event.key === "ArrowUp") {
                  event.preventDefault()
                  setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
                } else if (event.key === "Enter") {
                  event.preventDefault()
                  choose(suggestions[active])
                } else if (event.key === "Escape") {
                  setOpen(false)
                }
              }}
            />
            {(loadingList || quoting) && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-dadda-primary" />
            )}
            {open && suggestions.length > 0 && (
              <ul
                className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-surface py-2 shadow-lg ring-1 ring-outline-variant/30"
                role="listbox"
              >
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.label}-${index}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      className={`flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm ${
                        index === active ? "bg-primary-container/40 text-chocolate-text" : "text-on-surface"
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(suggestion)}
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-dadda-primary" />
                      {suggestion.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-[12px] text-on-surface-variant">
            Suggestions are Gauteng addresses only. R{DELIVERY_RATE_PER_KM} per kilometre from Amandasig, billed to the
            next km, within {MAX_DELIVERY_KM} km of the kitchen.
          </p>
          {inRange && feeCopy && (
            <p className="rounded-lg bg-primary-container/30 px-3 py-2 text-sm font-medium text-chocolate-text">
              Delivery {feeCopy} · added to your total ({formatRand(value.deliveryFee)})
            </p>
          )}
          {message && <p className="text-sm text-strawberry-accent">{message}</p>}
        </div>
      )}
    </div>
  )
}
