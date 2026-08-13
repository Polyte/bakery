import { NextResponse } from "next/server"

export const runtime = "nodejs"

const IG_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

function isAllowedImageHost(hostname: string) {
  const host = hostname.toLowerCase()
  return host === "cdninstagram.com" || host.endsWith(".cdninstagram.com") || host.endsWith(".fbcdn.net")
}

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("u")
  if (!src) return new NextResponse("Missing image", { status: 400 })

  let imageUrl: URL
  try {
    imageUrl = new URL(src)
  } catch {
    return new NextResponse("Invalid image", { status: 400 })
  }

  if (imageUrl.protocol !== "https:" || !isAllowedImageHost(imageUrl.hostname)) {
    return new NextResponse("Blocked host", { status: 400 })
  }

  const upstream = await fetch(imageUrl.toString(), {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent": IG_USER_AGENT,
    },
    next: { revalidate: 3600 },
  })

  if (!upstream.ok) {
    return new NextResponse("Image unavailable", { status: 502 })
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg"
  if (!contentType.startsWith("image/")) {
    return new NextResponse("Not an image", { status: 502 })
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
