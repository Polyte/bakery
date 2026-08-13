import { NextResponse } from "next/server"
import { cacheGetJson, cacheSetJson } from "@/lib/cache"
import {
  BAKERY_ORIGIN,
  DELIVERY_RATE_PER_KM,
  MAX_DELIVERY_KM,
  billedKilometres,
  deliveryFeeFromKm,
  gautengSearchQuery,
  haversineKm,
  isGautengPlace,
  outOfRangeMessage,
  photonBbox,
  photonLabel,
  type DeliveryQuote,
} from "@/lib/delivery"
import { clientIp, enforceRateLimit, readJsonBody } from "@/lib/security"

export const runtime = "nodejs"

const QUOTE_TTL_SECONDS = 60
const MAX_BODY = 8 * 1024

function quoteCacheKey(address: string, lat: number | null, lng: number | null) {
  if (lat != null && lng != null) {
    return `delivery:quote:v1:${lat.toFixed(5)}:${lng.toFixed(5)}`
  }
  return `delivery:quote:v1:${address.toLowerCase().replace(/\s+/g, " ")}`
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: Record<string, unknown>
}

async function geocodeAddress(address: string) {
  const url = new URL("https://photon.komoot.io/api/")
  url.searchParams.set("q", gautengSearchQuery(address))
  url.searchParams.set("lat", String(BAKERY_ORIGIN.lat))
  url.searchParams.set("lon", String(BAKERY_ORIGIN.lng))
  url.searchParams.set("bbox", photonBbox())
  url.searchParams.set("limit", "8")
  url.searchParams.set("lang", "en")

  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "DaddasConfectionery/1.0 (delivery quote)" },
  })
  if (!response.ok) return null
  const data = (await response.json()) as { features?: PhotonFeature[] }
  const feature = (data.features ?? []).find((item) => {
    const [lng, lat] = item.geometry?.coordinates ?? []
    return typeof lat === "number" && typeof lng === "number" && isGautengPlace(lat, lng, item.properties ?? {})
  })
  const [lng, lat] = feature?.geometry?.coordinates ?? []
  if (typeof lat !== "number" || typeof lng !== "number") return null
  return {
    lat,
    lng,
    address: photonLabel(feature?.properties ?? {}) || address,
  }
}

async function drivingKm(lat: number, lng: number) {
  const url = `https://router.project-osrm.org/route/v1/driving/${BAKERY_ORIGIN.lng},${BAKERY_ORIGIN.lat};${lng},${lat}?overview=false`
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "DaddasConfectionery/1.0 (delivery quote)" },
  })
  if (!response.ok) return null
  const data = (await response.json()) as { routes?: { distance?: number }[] }
  const meters = data.routes?.[0]?.distance
  if (typeof meters !== "number") return null
  return meters / 1000
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(`rl:delivery:quote:${clientIp(request)}`, 20, 60)
  if (limited) return limited

  const parsed = await readJsonBody<{ address?: string; lat?: number; lng?: number }>(request, MAX_BODY)
  if (parsed instanceof NextResponse) return parsed
  const body = parsed

  const typedAddress = (body?.address || "").trim().slice(0, 200)
  let lat = typeof body?.lat === "number" && Number.isFinite(body.lat) ? body.lat : null
  let lng = typeof body?.lng === "number" && Number.isFinite(body.lng) ? body.lng : null
  let address = typedAddress
  const cacheKey = quoteCacheKey(typedAddress, lat, lng)
  const cached = await cacheGetJson<DeliveryQuote>(cacheKey)
  if (cached) return NextResponse.json(cached)

  if (lat != null && lng != null && !isGautengPlace(lat, lng)) {
    return NextResponse.json(
      { error: "Delivery is only quoted for Gauteng addresses. Try a Pretoria, Johannesburg, or Centurion street." },
      { status: 400 },
    )
  }

  if (lat == null || lng == null) {
    if (typedAddress.length < 3) {
      return NextResponse.json({ error: "Enter a delivery address." }, { status: 400 })
    }
    const geo = await geocodeAddress(typedAddress)
    if (!geo) {
      return NextResponse.json(
        { error: "We could not find that Gauteng address. Try a street and suburb in Pretoria, Johannesburg, or Centurion." },
        { status: 404 },
      )
    }
    lat = geo.lat
    lng = geo.lng
    address = geo.address
  }

  const roadKm = await drivingKm(lat, lng)
  const fallbackKm = haversineKm(BAKERY_ORIGIN.lat, BAKERY_ORIGIN.lng, lat, lng) * 1.3
  const km = Number((roadKm ?? fallbackKm).toFixed(1))
  const billedKm = billedKilometres(km)
  const inRange = km <= MAX_DELIVERY_KM
  const fee = inRange ? deliveryFeeFromKm(km) : 0

  const quote: DeliveryQuote = {
    ok: true,
    inRange,
    address,
    lat,
    lng,
    km,
    billedKm: inRange ? billedKm : null,
    fee,
    maxKm: MAX_DELIVERY_KM,
    ratePerKm: DELIVERY_RATE_PER_KM,
    message: inRange ? undefined : outOfRangeMessage(km),
  }

  await cacheSetJson(cacheKey, quote, QUOTE_TTL_SECONDS)
  if (lat != null && lng != null) {
    const geoKey = quoteCacheKey("", lat, lng)
    if (geoKey !== cacheKey) await cacheSetJson(geoKey, quote, QUOTE_TTL_SECONDS)
  }
  return NextResponse.json(quote)
}
