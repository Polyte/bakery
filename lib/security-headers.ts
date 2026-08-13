import { NextResponse } from "next/server"

const SITE_ORIGINS = [
  "https://www.daddasconfectionery.co.za",
  "https://daddasconfectionery.co.za",
]

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-DNS-Prefetch-Control": "on",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "frame-src https://www.google.com https://maps.google.com",
    "worker-src 'self' blob:",
    "form-action 'self' https://pay.yoco.com https://payments.yoco.com",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
}

export function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    response.headers.set(
      "Content-Security-Policy",
      `${SECURITY_HEADERS["Content-Security-Policy"]}; upgrade-insecure-requests`,
    )
  }
  response.headers.delete("x-powered-by")
  return response
}

function configuredSiteOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  return fromEnv || null
}

function allowedOrigins(request: Request) {
  const allowed = new Set<string>(SITE_ORIGINS)
  const configured = configuredSiteOrigin()
  if (configured) allowed.add(configured)

  if (process.env.NODE_ENV !== "production") {
    const host = request.headers.get("host")
    if (host) {
      allowed.add(`http://${host}`)
      allowed.add(`https://${host}`)
    }
  }

  return allowed
}

export function isAllowedOrigin(request: Request) {
  const allowed = allowedOrigins(request)
  const origin = request.headers.get("origin")
  if (origin) return allowed.has(origin)

  const referer = request.headers.get("referer")
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin)
    } catch {
      return false
    }
  }

  return process.env.NODE_ENV !== "production"
}
