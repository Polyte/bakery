import { NextResponse } from "next/server"
import { cacheGetJson, cacheSetJson } from "@/lib/cache"
import {
  BAKERY_ORIGIN,
  GAUTENG_BBOX,
  gautengSearchQuery,
  isGautengPlace,
  photonBbox,
  photonLabel,
  type DeliverySuggestion,
} from "@/lib/delivery"
import { clientIp, enforceRateLimit } from "@/lib/security"

export const runtime = "nodejs"

const AUTOCOMPLETE_TTL_SECONDS = 180
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: Record<string, unknown>
}

const HEADERS = {
  Accept: "application/json",
  "User-Agent": "DaddasConfectionery/1.0 (delivery autocomplete)",
}

function uniqueSuggestions(items: DeliverySuggestion[]) {
  return items.filter((item, index, all) => all.findIndex((other) => other.label === item.label) === index)
}

async function photonGauteng(query: string) {
  const url = new URL("https://photon.komoot.io/api/")
  url.searchParams.set("q", gautengSearchQuery(query))
  url.searchParams.set("lat", String(BAKERY_ORIGIN.lat))
  url.searchParams.set("lon", String(BAKERY_ORIGIN.lng))
  url.searchParams.set("bbox", photonBbox())
  url.searchParams.set("limit", "20")
  url.searchParams.set("lang", "en")

  const response = await fetch(url, { headers: HEADERS, next: { revalidate: 0 } })
  if (!response.ok) return [] as DeliverySuggestion[]
  const data = (await response.json()) as { features?: PhotonFeature[] }
  return (data.features ?? [])
    .map((feature) => {
      const [lng, lat] = feature.geometry?.coordinates ?? []
      const properties = feature.properties ?? {}
      if (typeof lat !== "number" || typeof lng !== "number") return null
      if (!isGautengPlace(lat, lng, properties)) return null
      return { label: photonLabel(properties), lat, lng }
    })
    .filter((item): item is DeliverySuggestion => Boolean(item))
}

async function nominatimGauteng(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("q", gautengSearchQuery(query))
  url.searchParams.set("countrycodes", "za")
  url.searchParams.set(
    "viewbox",
    `${GAUTENG_BBOX.minLng},${GAUTENG_BBOX.maxLat},${GAUTENG_BBOX.maxLng},${GAUTENG_BBOX.minLat}`,
  )
  url.searchParams.set("bounded", "1")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("limit", "8")

  const response = await fetch(url, { headers: HEADERS, next: { revalidate: 0 } })
  if (!response.ok) return [] as DeliverySuggestion[]
  const data = (await response.json()) as Array<{
    lat?: string
    lon?: string
    address?: Record<string, string>
  }>
  return data
    .map((item) => {
      const lat = Number(item.lat)
      const lng = Number(item.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      const address = item.address ?? {}
      if (!isGautengPlace(lat, lng, { state: address.state, city: address.city || address.town, countrycode: "za" })) {
        return null
      }
      return {
        label: photonLabel({
          housenumber: address.house_number,
          street: address.road,
          name: address.suburb || address.neighbourhood,
          city: address.city || address.town || address.village,
          postcode: address.postcode,
          state: address.state || "Gauteng",
        }),
        lat,
        lng,
      }
    })
    .filter((item): item is DeliverySuggestion => Boolean(item))
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(`rl:delivery:ac:${clientIp(request)}`, 30, 60)
  if (limited) return limited

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") || "").trim().slice(0, 120)
  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] as DeliverySuggestion[] })
  }

  const cacheKey = `delivery:ac:v1:${q.toLowerCase()}`
  const cached = await cacheGetJson<{ suggestions: DeliverySuggestion[] }>(cacheKey)
  if (cached) {
    return NextResponse.json(cached, { headers: CACHE_HEADERS })
  }

  try {
    let suggestions = uniqueSuggestions(await photonGauteng(q))
    if (suggestions.length < 3) {
      suggestions = uniqueSuggestions([...suggestions, ...(await nominatimGauteng(q))])
    }
    const payload = { suggestions: suggestions.slice(0, 6) }
    await cacheSetJson(cacheKey, payload, AUTOCOMPLETE_TTL_SECONDS)
    return NextResponse.json(payload, { headers: CACHE_HEADERS })
  } catch {
    return NextResponse.json({ error: "Could not look up addresses." }, { status: 502 })
  }
}
