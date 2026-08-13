import { NextResponse } from "next/server"
import { type CakeDraft, extrasCount, includeCakeInTotal } from "@/lib/cake-order"
import { adminOrderEmail, customerOrderEmail } from "@/lib/order-email"
import { ADMIN_EMAIL, mailTransport } from "@/lib/mailer"

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

  const transporter = mailTransport()
  if (!transporter) {
    console.error("Order emails skipped: EMAIL_USER or EMAIL_PASSWORD is not set.")
    return NextResponse.json({ ok: true, emailed: false })
  }

  const from = process.env.EMAIL_USER
  const customer = customerOrderEmail(draft)
  const admin = adminOrderEmail(draft)

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
    return NextResponse.json({ ok: true, emailed: false })
  }

  return NextResponse.json({ ok: true, emailed: true })
}
