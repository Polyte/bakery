import { NextResponse } from "next/server"
import { clientIp, enforceRateLimit } from "@/lib/security"

export const runtime = "nodejs"

const IG_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

function isAllowedImageHost(hostname: string) {
  const host = hostname.toLowerCase()
  return host === "cdninstagram.com" || host.endsWith(".cdninstagram.com") || host.endsWith(".fbcdn.net")
}

function allowedHttpsUrl(raw: string, base?: URL) {
  let imageUrl: URL
  try {
    imageUrl = base ? new URL(raw, base) : new URL(raw)
  } catch {
    return null
  }
  if (imageUrl.protocol !== "https:" || !isAllowedImageHost(imageUrl.hostname)) return null
  return imageUrl
}

async function fetchImage(imageUrl: URL) {
  return fetch(imageUrl.toString(), {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent": IG_USER_AGENT,
    },
    redirect: "manual",
    next: { revalidate: 3600 },
  })
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(`rl:ig:media:${clientIp(request)}`, 60, 60)
  if (limited) return limited

  const src = new URL(request.url).searchParams.get("u")
  if (!src) return new NextResponse("Missing image", { status: 400 })

  let imageUrl = allowedHttpsUrl(src)
  if (!imageUrl) return new NextResponse("Blocked host", { status: 400 })

  let upstream = await fetchImage(imageUrl)
  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location")
    const redirected = location ? allowedHttpsUrl(location, imageUrl) : null
    if (!redirected) return new NextResponse("Blocked host", { status: 400 })
    upstream = await fetchImage(redirected)
  }

  if (!upstream.ok) {
    return new NextResponse("Image unavailable", { status: 502 })
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg"
  if (!contentType.startsWith("image/")) {
    return new NextResponse("Not an image", { status: 502 })
  }

  const length = Number(upstream.headers.get("content-length") || 0)
  if (length > MAX_IMAGE_BYTES) {
    return new NextResponse("Image too large", { status: 502 })
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
