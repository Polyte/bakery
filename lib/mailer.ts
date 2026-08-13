import nodemailer from "nodemailer"

export const ADMIN_EMAIL = process.env.CONTACT_EMAIL || "info@daddasconfectionery.co.za"
export const PROOF_EMAIL = "info@daddasconfectionery.co.za"

export function mailTransport() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASSWORD
  if (!user || !pass) return null
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  })
}
