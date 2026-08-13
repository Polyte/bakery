export const BAKERY_ORIGIN = {
  lat: -25.6719441,
  lng: 28.089916,
  address: "6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, Pretoria",
} as const

/** OSM extent for Gauteng, padded so Pretoria North and Vereeniging still match. */
export const GAUTENG_BBOX = {
  minLat: -26.92,
  maxLat: -25.1,
  minLng: 27.14,
  maxLng: 29.4,
} as const

const OTHER_SA_PROVINCES =
  /western cape|eastern cape|kwazulu|kzn|free state|limpopo|mpumalanga|north west|northern cape|cape town|durban|bloemfontein|port elizabeth|gqeberha|east london|polokwane|nelspruit|mbombela|kimberley/i

export function photonBbox() {
  return `${GAUTENG_BBOX.minLng},${GAUTENG_BBOX.minLat},${GAUTENG_BBOX.maxLng},${GAUTENG_BBOX.maxLat}`
}

export function gautengSearchQuery(query: string) {
  if (/gauteng|south africa/i.test(query)) return query
  return `${query}, Gauteng, South Africa`
}

export function isInGautengBounds(lat: number, lng: number) {
  return (
    lat >= GAUTENG_BBOX.minLat &&
    lat <= GAUTENG_BBOX.maxLat &&
    lng >= GAUTENG_BBOX.minLng &&
    lng <= GAUTENG_BBOX.maxLng
  )
}

export function isGautengPlace(lat: number, lng: number, properties: Record<string, unknown> = {}) {
  if (!isInGautengBounds(lat, lng)) return false
  const country = String(properties.countrycode || properties.country || "")
  if (country && !/za|south africa/i.test(country)) return false
  const region = [
    properties.state,
    properties.county,
    properties.city,
    properties.town,
    properties.village,
    properties.locality,
    properties.district,
    properties.name,
  ]
    .filter((part) => typeof part === "string")
    .join(" ")
  if (region && OTHER_SA_PROVINCES.test(region) && !/gauteng/i.test(region)) return false
  return true
}

export const DELIVERY_RATE_PER_KM = 5
export const MAX_DELIVERY_KM = 75

export type DeliverySuggestion = {
  label: string
  lat: number
  lng: number
}

export type DeliveryQuote = {
  ok: boolean
  inRange: boolean
  address: string
  lat: number | null
  lng: number | null
  km: number | null
  billedKm: number | null
  fee: number
  maxKm: number
  ratePerKm: number
  message?: string
}

export type DeliverySelection = {
  delivery: "pickup" | "delivery"
  address: string
  deliveryLat: number | null
  deliveryLng: number | null
  deliveryKm: number | null
  deliveryFee: number
}

export function pickupSelection(): DeliverySelection {
  return {
    delivery: "pickup",
    address: "",
    deliveryLat: null,
    deliveryLng: null,
    deliveryKm: null,
    deliveryFee: 0,
  }
}

export function quoteToSelection(quote: DeliveryQuote): DeliverySelection {
  if (!quote.ok || !quote.inRange) {
    return {
      delivery: "delivery",
      address: quote.address,
      deliveryLat: quote.lat,
      deliveryLng: quote.lng,
      deliveryKm: quote.km,
      deliveryFee: 0,
    }
  }
  return {
    delivery: "delivery",
    address: quote.address,
    deliveryLat: quote.lat,
    deliveryLng: quote.lng,
    deliveryKm: quote.km,
    deliveryFee: quote.fee,
  }
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function billedKilometres(km: number) {
  return Math.max(1, Math.ceil(km))
}

export function deliveryFeeFromKm(km: number) {
  return billedKilometres(km) * DELIVERY_RATE_PER_KM
}

export function formatKm(km: number) {
  return km >= 10 ? km.toFixed(0) : km.toFixed(1)
}

export function deliveryFeeLabel(km: number | null, fee: number) {
  if (km == null || fee <= 0) return null
  return `${formatKm(km)} km · R${fee.toFixed(0)} (R${DELIVERY_RATE_PER_KM}/km)`
}

export function photonLabel(properties: Record<string, unknown>) {
  const parts = [
    [properties.housenumber, properties.street].filter(Boolean).join(" "),
    properties.name,
    properties.district,
    properties.city || properties.town || properties.village || properties.locality,
    properties.postcode,
    properties.state || "Gauteng",
  ]
    .flatMap((part) => (typeof part === "string" && part.trim() ? [part.trim()] : []))
    .filter((part, index, all) => all.indexOf(part) === index)
  const label = parts.join(", ") || "Gauteng"
  return /gauteng/i.test(label) ? label : `${label}, Gauteng`
}

export function outOfRangeMessage(km: number) {
  return `That address is ${formatKm(km)} km from our Amandasig kitchen. We deliver within ${MAX_DELIVERY_KM} km. Collect from the bakery, or WhatsApp us for a special trip.`
}
