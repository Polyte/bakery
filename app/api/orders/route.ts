import { NextResponse } from "next/server"
import { type CakeDraft, extrasCount, includeCakeInTotal } from "@/lib/cake-order"
import { adminOrderEmail, customerOrderEmail } from "@/lib/order-email"
import { ADMIN_EMAIL, mailTransport } from "@/lib/mailer"
import { persistOrderFromDraft } from "@/lib/orders/persist-draft"

export const runtime = "nodejs"

type Body = {
  draft?: CakeDraft
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const draft = body.draft
  if (!draft?.customer?.email) {
    return NextResponse.json({ error: "Customer email is required." }, { status: 400 })
  }

  const hasItems = includeCakeInTotal(draft) || extrasCount(draft) > 0
  if (!hasItems) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 })
  }

  let orderNumber = draft.orderNumber
  let orderId: string | undefined

  try {
    const order = await persistOrderFromDraft(draft)
    orderNumber = order.orderNumber
    orderId = order.id
  } catch (error) {
    console.error("Order persist failed:", error)
    return NextResponse.json({ error: "Could not save order." }, { status: 500 })
  }

  const draftForEmail = { ...draft, orderNumber }
  const transporter = mailTransport()
  if (!transporter) {
    console.error("Order emails skipped: EMAIL_USER or EMAIL_PASSWORD is not set.")
    return NextResponse.json({ ok: true, emailed: false, orderNumber, orderId })
  }

  const from = process.env.EMAIL_USER
  const customer = customerOrderEmail(draftForEmail)
  const admin = adminOrderEmail(draftForEmail)

  const results = await Promise.allSettled([
    transporter.sendMail({
      from,
      to: draft.customer.email,
      replyTo: ADMIN_EMAIL,
      subject: customer.subject,
      text: customer.text,
      html: customer.html,
    }),
    transporter.sendMail({
      from,
      to: ADMIN_EMAIL,
      replyTo: draft.customer.email,
      subject: admin.subject,
      text: admin.text,
      html: admin.html,
    }),
  ])

  const failed = results.filter((result) => result.status === "rejected")
  if (failed.length) {
    for (const result of failed) {
      if (result.status === "rejected") console.error("Order email failed:", result.reason)
    }
    return NextResponse.json({ ok: true, emailed: false, orderNumber, orderId })
  }

  return NextResponse.json({ ok: true, emailed: true, orderNumber, orderId })
}
