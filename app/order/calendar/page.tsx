"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Cake, Check, Clock, Download, MapPin } from "lucide-react"
import { useCakeOrder } from "@/components/cake-order-provider"
import { PICKUP_ADDRESS, displayConfirmedOrder, formatCalendarDate } from "@/lib/cake-order"

function toCalStamp(isoDate: string, hours: number, minutes: number) {
  const d = new Date(`${isoDate}T00:00:00+02:00`)
  d.setHours(hours, minutes, 0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
}

export default function AddToCalendarPage() {
  const { draft, lastOrder } = useCakeOrder()
  const order = displayConfirmedOrder(draft, lastOrder)
  const isDelivery = order.delivery === "delivery" && order.address
  const title = `${order.productName} ${isDelivery ? "delivery" : "pickup"} — Dadda's Confectionery`
  const location = isDelivery ? order.address : PICKUP_ADDRESS
  const details = `${order.orderNumber ?? "Order"} · ${order.timeSlot} · ${location}`
  const start = toCalStamp(order.date, 10, 0)
  const end = toCalStamp(order.date, 12, 0)

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`

  const downloadIcs = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Daddas Confectionery//Order//EN",
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dadda-cake-pickup.ics"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-gradient-to-br from-dadda-primary/10 to-transparent blur-3xl" />
        <div className="absolute -right-[20%] top-[40%] h-[60%] w-[60%] rounded-full bg-gradient-to-tl from-secondary-container/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl" data-animate="scale">
        <div className="flex flex-col items-center bg-surface-container-low px-8 py-10 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-dadda-primary/10 text-dadda-primary">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mb-2 font-display text-[32px] font-semibold text-chocolate-text">Sweet!</h1>
          <p className="max-w-md text-on-surface-variant">
            Your cake pickup is confirmed and ready to be added to your calendar.
          </p>
        </div>

        <div className="flex flex-col gap-10 p-8 md:p-12">
          <div className="group relative flex flex-col gap-4 overflow-hidden rounded-lg bg-surface p-6">
            <div className="absolute left-0 top-0 h-full w-1 bg-dadda-primary/20 group-hover:bg-dadda-primary" />
            <div className="flex items-start justify-between">
              <h2 className="font-display text-2xl font-semibold text-chocolate-text">Cake Pickup</h2>
              <Cake className="-mr-2 -mt-2 h-12 w-12 text-dadda-primary/40" />
            </div>
            <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-on-surface-variant" />
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant">Date</span>
                  <span className="mt-1 font-medium text-chocolate-text">{formatCalendarDate(order.date)}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-on-surface-variant" />
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant">Time</span>
                  <span className="mt-1 font-medium text-chocolate-text">{order.timeSlot}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="mt-0.5 h-5 w-5 text-on-surface-variant" />
                <div className="flex flex-col">
                  <span className="text-[12px] font-medium uppercase tracking-wider text-on-surface-variant">Location</span>
                  <span className="mt-1 font-medium text-chocolate-text">{location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#4285F4]/10 py-4 text-sm font-semibold text-[#4285F4] hover:bg-[#4285F4]/20"
            >
              <Calendar className="h-5 w-5" />
              Add to Google Calendar
            </a>
            <button
              type="button"
              onClick={downloadIcs}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-black/5 py-4 text-sm font-semibold text-chocolate-text hover:bg-black/10"
            >
              <Download className="h-5 w-5" />
              Add to Apple Calendar
            </button>
          </div>

          <div className="border-t border-outline-variant/30 pt-4 text-center">
            <Link
              href="/order/tracking"
              className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-dadda-primary hover:text-primary-container"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to Order Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
