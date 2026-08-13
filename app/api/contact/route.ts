import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import {
  clientIp,
  enforceRateLimit,
  escapeHtml,
  isValidEmail,
  readJsonBody,
} from "@/lib/security"

export const runtime = "nodejs"

const MAX_BODY = 16 * 1024

type Body = {
  name?: string
  email?: string
  message?: string
  phone?: string
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(`rl:contact:${clientIp(request)}`, 5, 15 * 60)
  if (limited) return limited

  const body = await readJsonBody<Body>(request, MAX_BODY)
  if (body instanceof NextResponse) return body

  const name = body.name?.trim() ?? ""
  const email = body.email?.trim() ?? ""
  const message = body.message?.trim() ?? ""
  const phone = body.phone?.trim() ?? ""

  if (!name || name.length > 120 || !isValidEmail(email) || !message || message.length > 5000 || phone.length > 40) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 },
    )
  }

  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) {
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    )
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })

  try {
    await transporter.sendMail({
      from: user,
      to: process.env.CONTACT_EMAIL || "info@daddasconfectionery.co.za",
      replyTo: email,
      subject: `New Contact Form Submission from ${name.slice(0, 80)}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
        <h3>Message:</h3>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    console.error("Error processing contact form")
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    )
  }
}
