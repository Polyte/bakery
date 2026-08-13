import { bankingFields } from "@/lib/banking"
import {
  type CakeDraft,
  extrasList,
  formatRand,
  getFilling,
  grandTotal,
  includeCakeInTotal,
  MESSAGE_CARD_PRICE,
  PICKUP_ADDRESS,
} from "@/lib/cake-order"
import { ADMIN_EMAIL, PROOF_EMAIL } from "@/lib/mailer"

export type OrderLine = {
  label: string
  amount: number
}

export function describeOrderLines(draft: CakeDraft): OrderLine[] {
  const lines: OrderLine[] = []
  if (includeCakeInTotal(draft)) {
    lines.push({
      label: `${draft.productName} (${draft.sizeLabel})`,
      amount: draft.sizePrice,
    })
    const filling = getFilling(draft.fillingId)
    if (filling && filling.price > 0) {
      lines.push({ label: filling.name, amount: filling.price })
    }
  }
  for (const extra of extrasList(draft)) {
    lines.push({ label: `${extra.qty}× ${extra.name}`, amount: extra.price * extra.qty })
  }
  if (draft.delivery === "delivery") {
    const km = draft.deliveryKm != null ? ` · ${draft.deliveryKm} km` : ""
    lines.push({ label: `Delivery${km}`, amount: draft.deliveryFee })
  } else {
    lines.push({ label: "Pickup", amount: 0 })
  }
  if (draft.messageCard) {
    lines.push({ label: "Message card", amount: MESSAGE_CARD_PRICE })
  }
  return lines
}

export function paymentMethodLabel(method: CakeDraft["paymentMethod"]) {
  return method === "eft" ? "EFT (manual bank transfer)" : "Yoco (Pay Online)"
}

export function fulfilmentLabel(draft: CakeDraft) {
  if (draft.delivery === "delivery") {
    return draft.address.trim()
      ? `Delivery to ${draft.address}`
      : "Delivery"
  }
  return `Pickup at ${PICKUP_ADDRESS}`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function linesText(lines: OrderLine[]) {
  return lines
    .map((line) => `${line.label}: ${line.amount ? formatRand(line.amount) : "Free"}`)
    .join("\n")
}

function linesHtml(lines: OrderLine[]) {
  const rows = lines
    .map(
      (line) =>
        `<tr><td style="padding:6px 0;color:#3d2c1e">${escapeHtml(line.label)}</td><td style="padding:6px 0;text-align:right;color:#3d2c1e">${line.amount ? formatRand(line.amount) : "Free"}</td></tr>`,
    )
    .join("")
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}</table>`
}

function bankingText() {
  return bankingFields()
    .map((field) => `${field.label}: ${field.value}`)
    .join("\n")
}

function bankingHtml() {
  return bankingFields()
    .map(
      (field) =>
        `<p style="margin:4px 0"><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(field.value)}</p>`,
    )
    .join("")
}

export function customerOrderEmail(draft: CakeDraft) {
  const orderNumber = draft.orderNumber ?? "your order"
  const lines = describeOrderLines(draft)
  const total = formatRand(grandTotal(draft))
  const payment = paymentMethodLabel(draft.paymentMethod)
  const fulfilment = fulfilmentLabel(draft)
  const eftBlock =
    draft.paymentMethod === "eft"
      ? `

Banking details
${bankingText()}

Please send proof of payment to ${PROOF_EMAIL} with ${orderNumber} as the reference.
`
      : ""
  const eftHtml =
    draft.paymentMethod === "eft"
      ? `<h3 style="margin:24px 0 8px;color:#7d562d">Banking details</h3>
${bankingHtml()}
<p style="margin:16px 0 0">Please send proof of payment to <a href="mailto:${PROOF_EMAIL}">${PROOF_EMAIL}</a> with <strong>${escapeHtml(orderNumber)}</strong> as the reference.</p>`
      : ""

  const text = `Thank you for your order at Dadda's Confectionery.

Order number: ${orderNumber}
Payment: ${payment}
${fulfilment}

${linesText(lines)}

Total: ${total}
${eftBlock}
If you have questions, reply to this email or write to ${ADMIN_EMAIL}.
`
  const html = `
    <div style="font-family:Georgia,serif;color:#3d2c1e;max-width:560px">
      <h1 style="font-size:22px;margin:0 0 12px">Your order is confirmed</h1>
      <p>Thank you for ordering from Dadda's Confectionery.</p>
      <p><strong>Order number:</strong> ${escapeHtml(orderNumber)}<br/>
      <strong>Payment:</strong> ${escapeHtml(payment)}<br/>
      <strong>Collection:</strong> ${escapeHtml(fulfilment)}</p>
      ${linesHtml(lines)}
      <p style="font-size:18px;margin:16px 0"><strong>Total: ${total}</strong></p>
      ${eftHtml}
      <p style="margin-top:24px;color:#6b5a4a;font-size:13px">Questions? Write to <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
    </div>
  `

  return {
    subject: `Your Dadda's Confectionery order ${orderNumber}`,
    text,
    html,
  }
}

export function adminOrderEmail(draft: CakeDraft) {
  const orderNumber = draft.orderNumber ?? "unnumbered"
  const customerName = `${draft.customer.firstName} ${draft.customer.lastName}`.trim() || "Unknown"
  const lines = describeOrderLines(draft)
  const total = formatRand(grandTotal(draft))
  const notes = draft.notes.trim() || "None"
  const card = draft.messageCard
    ? (draft.cardMessage.trim() || "(card selected, no message text)")
    : "No"
  const address =
    draft.delivery === "delivery"
      ? draft.address.trim() || "Delivery address not provided"
      : `Pickup · ${PICKUP_ADDRESS}`

  const text = `New order ${orderNumber}

Customer
Name: ${customerName}
Email: ${draft.customer.email}
Phone: ${draft.customer.phone || "Not provided"}
Contact preference: ${draft.contactPref}

Fulfilment
${fulfilmentLabel(draft)}
Address: ${address}
Date: ${draft.date}
Time: ${draft.timeSlot}

Payment: ${paymentMethodLabel(draft.paymentMethod)}

Comments / notes:
${notes}

Card message:
${card}

Items
${linesText(lines)}

Total: ${total}
`

  const html = `
    <div style="font-family:Georgia,serif;color:#3d2c1e;max-width:560px">
      <h1 style="font-size:22px;margin:0 0 12px">New order ${escapeHtml(orderNumber)}</h1>
      <h3 style="margin:16px 0 8px;color:#7d562d">Customer</h3>
      <p>
        <strong>Name:</strong> ${escapeHtml(customerName)}<br/>
        <strong>Email:</strong> ${escapeHtml(draft.customer.email)}<br/>
        <strong>Phone:</strong> ${escapeHtml(draft.customer.phone || "Not provided")}<br/>
        <strong>Contact preference:</strong> ${escapeHtml(draft.contactPref)}
      </p>
      <h3 style="margin:16px 0 8px;color:#7d562d">Fulfilment</h3>
      <p>
        ${escapeHtml(fulfilmentLabel(draft))}<br/>
        <strong>Address:</strong> ${escapeHtml(address)}<br/>
        <strong>Date:</strong> ${escapeHtml(draft.date)}<br/>
        <strong>Time:</strong> ${escapeHtml(draft.timeSlot)}<br/>
        <strong>Payment:</strong> ${escapeHtml(paymentMethodLabel(draft.paymentMethod))}
      </p>
      <h3 style="margin:16px 0 8px;color:#7d562d">Comments / notes</h3>
      <p>${escapeHtml(notes).replace(/\n/g, "<br/>")}</p>
      <h3 style="margin:16px 0 8px;color:#7d562d">Card message</h3>
      <p>${escapeHtml(card).replace(/\n/g, "<br/>")}</p>
      <h3 style="margin:16px 0 8px;color:#7d562d">Items</h3>
      ${linesHtml(lines)}
      <p style="font-size:18px;margin:16px 0"><strong>Total: ${total}</strong></p>
    </div>
  `

  return {
    subject: `New order ${orderNumber}`,
    text,
    html,
  }
}
