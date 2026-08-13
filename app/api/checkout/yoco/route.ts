import { NextResponse } from "next/server"
import { extrasCount, includeCakeInTotal } from "@/lib/cake-order"
import { sanitizeCakeDraft } from "@/lib/order-draft"
import { clientIp, enforceRateLimit, readJsonBody } from "@/lib/security"
import {
  YOCO_MIN_CENTS,
  YocoApiError,
  buildYocoLineItems,
  createYocoCheckout,
  requestOrigin,
  yocoChargeCents,
} from "@/lib/yoco"

export const runtime = "nodejs"

const MAX_BODY = 64 * 1024

type Body = {
  draft?: unknown
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(`rl:yoco:${clientIp(request)}`, 10, 15 * 60)
  if (limited) return limited

  const secretKey = process.env.YOCO_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: "Yoco is not configured. Add YOCO_SECRET_KEY to your environment." },
      { status: 503 },
    )
  }

  const body = await readJsonBody<Body>(request, MAX_BODY)
  if (body instanceof NextResponse) return body

  const draft = sanitizeCakeDraft(body.draft)
  if (!draft) {
    return NextResponse.json({ error: "Order details are required." }, { status: 400 })
  }

  const hasItems = includeCakeInTotal(draft) || extrasCount(draft) > 0
  if (!hasItems) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 })
  }

  const amountCents = yocoChargeCents(draft)
  if (amountCents < YOCO_MIN_CENTS) {
    return NextResponse.json({ error: "Yoco requires a minimum payment of R2.00." }, { status: 400 })
  }

  const origin = requestOrigin(request)
  const orderNumber = draft.orderNumber ?? `DC-${Date.now()}`
  const customerName = `${draft.customer.firstName} ${draft.customer.lastName}`.trim()

  try {
    const checkout = await createYocoCheckout({
      secretKey,
      amountCents,
      successUrl: `${origin}/order/confirmed?payment=yoco`,
      cancelUrl: `${origin}/checkout?payment=cancelled`,
      failureUrl: `${origin}/checkout?payment=failed`,
      externalId: orderNumber,
      idempotencyKey: crypto.randomUUID(),
      metadata: {
        orderNumber,
        customerName,
        customerEmail: draft.customer.email ?? "",
        customerPhone: draft.customer.phone ?? "",
      },
      lineItems: buildYocoLineItems(draft),
    })

    return NextResponse.json({
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
    })
  } catch (error) {
    if (error instanceof YocoApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status >= 400 && error.status < 500 ? error.status : 502 })
    }
    console.error("Yoco checkout error:", error)
    return NextResponse.json({ error: "Could not start Yoco checkout. Please try again." }, { status: 502 })
  }
}
