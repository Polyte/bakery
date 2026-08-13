"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  type CakeDraft,
  type CatalogLineItem,
  LAST_ORDER_KEY,
  STORAGE_KEY,
  defaultDraft,
  generateOrderNumber,
} from "@/lib/cake-order"
import { type CakeProduct, cakeDraftPatch } from "@/lib/cakes"

type ConfirmOptions = {
  keepCustomer?: boolean
}

type CakeOrderContextValue = {
  draft: CakeDraft
  lastOrder: CakeDraft | null
  hydrated: boolean
  update: (patch: Partial<CakeDraft>) => void
  updateCustomer: (patch: Partial<CakeDraft["customer"]>) => void
  startCake: (product: CakeProduct) => void
  addExtra: (item: Omit<CatalogLineItem, "qty"> & { qty?: number }) => void
  setExtraQty: (id: string, qty: number) => void
  confirmOrder: (patch?: Partial<CakeDraft>, options?: ConfirmOptions) => CakeDraft
  reset: () => void
}

const CakeOrderContext = createContext<CakeOrderContextValue | null>(null)

function mergeDraft(parsed: Partial<CakeDraft> & { paymentMethod?: string }): CakeDraft {
  const merged: CakeDraft = {
    ...defaultDraft(),
    ...parsed,
    category: parsed.category ?? null,
    customer: { ...defaultDraft().customer, ...parsed.customer },
    extras: Array.isArray(parsed.extras) ? parsed.extras : [],
    paymentMethod: parsed.paymentMethod === "eft" || String(parsed.paymentMethod) === "other" ? "eft" : "yoco",
    deliveryKm: parsed.deliveryKm ?? null,
    deliveryLat: parsed.deliveryLat ?? null,
    deliveryLng: parsed.deliveryLng ?? null,
  }
  if (merged.delivery !== "delivery") {
    merged.deliveryFee = 0
    merged.deliveryKm = null
    merged.address = ""
  }
  return merged
}

export function CakeOrderProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<CakeDraft>(defaultDraft)
  const [lastOrder, setLastOrder] = useState<CakeDraft | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDraft(mergeDraft(JSON.parse(raw) as Partial<CakeDraft>))
    } catch {
      /* keep defaults */
    }
    try {
      const rawLast = localStorage.getItem(LAST_ORDER_KEY)
      if (rawLast) setLastOrder(mergeDraft(JSON.parse(rawLast) as Partial<CakeDraft>))
    } catch {
      /* no snapshot */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }, [draft, hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (lastOrder) localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(lastOrder))
  }, [lastOrder, hydrated])

  const value = useMemo<CakeOrderContextValue>(
    () => ({
      draft,
      lastOrder,
      hydrated,
      update: (patch) => setDraft((prev) => ({ ...prev, ...patch })),
      updateCustomer: (patch) =>
        setDraft((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } })),
      startCake: (product) => setDraft((prev) => ({ ...prev, ...cakeDraftPatch(product) })),
      addExtra: (item) =>
        setDraft((prev) => {
          const extras = prev.extras ?? []
          const addQty = item.qty ?? 1
          const existing = extras.find((extra) => extra.id === item.id)
          if (existing) {
            return {
              ...prev,
              extras: extras.map((extra) =>
                extra.id === item.id ? { ...extra, qty: extra.qty + addQty } : extra,
              ),
            }
          }
          return {
            ...prev,
            extras: [
              ...extras,
              {
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                kind: item.kind,
                qty: addQty,
              },
            ],
          }
        }),
      setExtraQty: (id, qty) =>
        setDraft((prev) => {
          const extras = prev.extras ?? []
          if (qty <= 0) return { ...prev, extras: extras.filter((extra) => extra.id !== id) }
          return {
            ...prev,
            extras: extras.map((extra) => (extra.id === id ? { ...extra, qty } : extra)),
          }
        }),
      confirmOrder: (patch, options) => {
        const snapshot: CakeDraft = {
          ...draft,
          ...patch,
          orderNumber: draft.orderNumber ?? patch?.orderNumber ?? generateOrderNumber(),
          confirmedAt: draft.confirmedAt ?? new Date().toISOString(),
        }
        const next = defaultDraft()
        if (options?.keepCustomer) next.customer = { ...snapshot.customer }
        setDraft(next)
        setLastOrder(snapshot)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(snapshot))
        } catch {
          /* still return the snapshot */
        }
        return snapshot
      },
      reset: () => setDraft(defaultDraft()),
    }),
    [draft, lastOrder, hydrated],
  )

  return <CakeOrderContext.Provider value={value}>{children}</CakeOrderContext.Provider>
}

export function useCakeOrder() {
  const ctx = useContext(CakeOrderContext)
  if (!ctx) throw new Error("useCakeOrder must be used within CakeOrderProvider")
  return ctx
}
