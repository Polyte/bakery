import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { createNotification, writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"
import {
  BIRTHDAY_DISCOUNT_PERCENT,
  BIRTHDAY_PROMO_CODE,
  birthdayMonthDay,
} from "@/lib/loyalty"
import { ADMIN_EMAIL, mailTransport } from "@/lib/mailer"

export const runtime = "nodejs"

/**
 * Finds customers whose birthday is today (or ?month=1 for whole month preview)
 * and optionally sends birthday wish emails with BIRTHDAY10.
 *
 * GET  — list due birthdays
 * POST — send wishes ({ dryRun?: boolean })
 */
export async function GET(request: Request) {
  const { error } = await requireAdminSession()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const monthOnly = searchParams.get("scope") === "month"
  const now = new Date()
  const todayMd = birthdayMonthDay(now)!
  const month = String(now.getMonth() + 1).padStart(2, "0")

  const customers = await prisma.customer.findMany({
    where: { birthday: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      birthday: true,
      birthdayOfferSentYear: true,
      loyaltyPoints: true,
      orderCount: true,
    },
    orderBy: { firstName: "asc" },
  })

  const due = customers.filter((c) => {
    const md = birthdayMonthDay(c.birthday)
    if (!md) return false
    if (monthOnly) return md.startsWith(`${month}-`)
    return md === todayMd
  })

  return NextResponse.json({
    scope: monthOnly ? "month" : "today",
    promoCode: BIRTHDAY_PROMO_CODE,
    discountPercent: BIRTHDAY_DISCOUNT_PERCENT,
    count: due.length,
    customers: due,
  })
}

export async function POST(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let dryRun = false
  try {
    const body = (await request.json()) as { dryRun?: boolean }
    dryRun = Boolean(body.dryRun)
  } catch {
    /* empty body ok */
  }

  const now = new Date()
  const year = now.getFullYear()
  const todayMd = birthdayMonthDay(now)!

  const customers = await prisma.customer.findMany({
    where: { birthday: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      birthday: true,
      birthdayOfferSentYear: true,
    },
  })

  const due = customers.filter((c) => birthdayMonthDay(c.birthday) === todayMd)
  const toSend = due.filter((c) => c.birthdayOfferSentYear !== year)

  if (dryRun) {
    return NextResponse.json({ dryRun: true, due: due.length, wouldSend: toSend.length, customers: toSend })
  }

  const transporter = mailTransport()
  const sent: string[] = []
  const skipped: string[] = []

  for (const customer of toSend) {
    if (!transporter) {
      skipped.push(customer.email)
      continue
    }
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customer.email,
        replyTo: ADMIN_EMAIL,
        subject: `Happy Birthday from Dadda's · ${BIRTHDAY_DISCOUNT_PERCENT}% off`,
        text: [
          `Hi ${customer.firstName},`,
          "",
          `Happy Birthday from all of us at Dadda's Confectionery!`,
          "",
          `Treat yourself again with ${BIRTHDAY_DISCOUNT_PERCENT}% off your next order.`,
          `Use code ${BIRTHDAY_PROMO_CODE} at checkout.`,
          "",
          `With love,`,
          `Dadda's Confectionery`,
        ].join("\n"),
        html: `<p>Hi ${customer.firstName},</p>
<p><strong>Happy Birthday</strong> from all of us at Dadda&apos;s Confectionery!</p>
<p>Treat yourself again with <strong>${BIRTHDAY_DISCOUNT_PERCENT}% off</strong> your next order.
Use code <strong>${BIRTHDAY_PROMO_CODE}</strong> at checkout.</p>
<p>With love,<br/>Dadda&apos;s Confectionery</p>`,
      })

      await prisma.customer.update({
        where: { id: customer.id },
        data: { birthdayOfferSentYear: year },
      })

      await prisma.communication.create({
        data: {
          customerId: customer.id,
          channel: "email",
          direction: "outbound",
          subject: `Happy Birthday · ${BIRTHDAY_PROMO_CODE}`,
          body: `${BIRTHDAY_DISCOUNT_PERCENT}% off birthday offer sent`,
          status: "sent",
        },
      })

      sent.push(customer.email)
    } catch (err) {
      console.error("Birthday email failed:", customer.email, err)
      skipped.push(customer.email)
    }
  }

  await writeAuditLog({
    userId: session!.id,
    action: "birthday.offers.send",
    entity: "Customer",
    newValue: { sent: sent.length, skipped: skipped.length },
  })

  await createNotification({
    userId: session!.id,
    title: "Birthday wishes sent",
    body: `${sent.length} sent · ${skipped.length} skipped`,
    type: "marketing",
  })

  return NextResponse.json({ sent: sent.length, skipped: skipped.length, emails: sent })
}
