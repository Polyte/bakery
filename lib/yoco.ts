import { createHmac, timingSafeEqual } from "crypto"
import {
  type CakeDraft,
  cakeLineTotal,
  deliveryAmount,
  extrasList,
  extrasTotal,
  grandTotal,
  includeCakeInTotal,
  messageCardAmount,
} from "@/lib/cake-order"

export const YOCO_CHECKOUTS_URL = "https://payments.yoco.com/api/checkouts"
export const YOCO_MIN_CENTS = 200

export type YocoLineItem = {
  displayName: string
  quantity: number
  description?: string
  pricingDetails: { price: number }
}

export type YocoCheckoutResponse = {
  id: string
  redirectUrl: string
  status?: string
  amount?: number
  currency?: string
}

export function randToCents(amount: number) {
  return Math.round(amount * 100)
}

export function buildYocoLineItems(draft: CakeDraft): YocoLineItem[] {
  const items: YocoLineItem[] = []

  if (includeCakeInTotal(draft)) {
    items.push({
      displayName: draft.productName,
      quantity: 1,
      description: [draft.sizeLabel, draft.flavorLabel].filter(Boolean).join(" · "),
      pricingDetails: { price: randToCents(cakeLineTotal(draft)) },
    })
  }

  for (const extra of extrasList(draft)) {
    items.push({
      displayName: extra.name,
      quantity: extra.qty,
      description: extra.kind,
      pricingDetails: { price: randToCents(extra.price) },
    })
  }

  const delivery = deliveryAmount(draft)
  if (delivery > 0) {
    items.push({
      displayName: "Delivery",
      quantity: 1,
      description:
        draft.deliveryKm != null
          ? `${draft.deliveryKm} km from Amandasig · R5/km`
          : "Pretoria delivery · R5/km",
      pricingDetails: { price: randToCents(delivery) },
    })
  }

  const card = messageCardAmount(draft)
  if (card > 0) {
    items.push({
      displayName: "Message card",
      quantity: 1,
      description: "Greeting card tucked with your order",
      pricingDetails: { price: randToCents(card) },
    })
  }

  return items
}

export function yocoChargeCents(draft: CakeDraft) {
  return randToCents(grandTotal(draft))
}

export function requestOrigin(request: Request) {
  const url = new URL(request.url)
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host
  return `${proto}://${host}`
}

export async function createYocoCheckout(input: {
  secretKey: string
  amountCents: number
  successUrl: string
  cancelUrl: string
  failureUrl: string
  metadata: Record<string, string>
  lineItems: YocoLineItem[]
  externalId?: string
  idempotencyKey?: string
}): Promise<YocoCheckoutResponse> {
  const response = await fetch(YOCO_CHECKOUTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.secretKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey ?? crypto.randomUUID(),
    },
    body: JSON.stringify({
      amount: input.amountCents,
      currency: "ZAR",
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      failureUrl: input.failureUrl,
      metadata: input.metadata,
      lineItems: input.lineItems,
      subtotalAmount: input.amountCents,
      ...(input.externalId ? { externalId: input.externalId } : {}),
    }),
  })

  const payload = (await response.json().catch(() => null)) as
    | (YocoCheckoutResponse & { errorType?: string; errorCode?: string; description?: string; message?: string })
    | null

  if (!response.ok || !payload?.redirectUrl) {
    const message =
      payload?.description ||
      payload?.message ||
      `Yoco checkout failed (${response.status})`
    throw new YocoApiError(message, response.status, payload)
  }

  return payload
}

export class YocoApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.name = "YocoApiError"
    this.status = status
    this.details = details
  }
}

export function verifyYocoWebhookSignature(input: {
  secret: string
  body: string
  id: string
  timestamp: string
  signatureHeader: string
  toleranceSeconds?: number
}) {
  const tolerance = input.toleranceSeconds ?? 300
  const ts = Number(input.timestamp)
  if (!Number.isFinite(ts)) return false
  if (Math.abs(Date.now() / 1000 - ts) > tolerance) return false

  const encoded = input.secret.startsWith("whsec_") ? input.secret.slice(6) : input.secret
  const key = Buffer.from(encoded, "base64")
  if (!key.length) return false

  const expected = createHmac("sha256", key).update(`${input.id}.${input.timestamp}.${input.body}`).digest("base64")
  const expectedBuf = Buffer.from(expected)

  return input.signatureHeader.split(/\s+/).some((token) => {
    const [scheme, signature] = token.split(",", 2)
    if (scheme !== "v1" || !signature) return false
    const actual = Buffer.from(signature)
    return actual.length === expectedBuf.length && timingSafeEqual(actual, expectedBuf)
  })
}
