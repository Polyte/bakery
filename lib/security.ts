import { NextResponse } from "next/server"
import { rateLimit as consumeRateLimit } from "@/lib/cache"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first.slice(0, 64)
  }
  return request.headers.get("x-real-ip")?.trim().slice(0, 64) || "unknown"
}

export function tooManyRequests() {
  return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 })
}

export async function enforceRateLimit(key: string, limit: number, windowSeconds: number) {
  const ok = await consumeRateLimit(key, limit, windowSeconds)
  return ok ? null : tooManyRequests()
}

export function isValidEmail(value: string) {
  return value.length <= 254 && EMAIL_RE.test(value)
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function readJsonBody<T>(request: Request, maxBytes: number): Promise<T | NextResponse> {
  const contentLength = request.headers.get("content-length")
  if (contentLength && Number(contentLength) > maxBytes) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 })
  }

  let raw: string
  try {
    raw = await request.text()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (raw.length > maxBytes) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 })
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
}
