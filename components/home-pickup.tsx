import Link from "next/link"
import { Clock, MapPin, Truck } from "lucide-react"
import { SITE } from "@/lib/seo"

const areas = ["Pretoria", "Amandasig", "Akasia", "Pretoria North", "Centurion", "Tshwane"]

export default function HomePickup() {
  return (
    <section className="w-full bg-surface-container-low py-section-gap" aria-labelledby="pickup-heading">
      <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div data-animate="fade-left">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-dadda-primary">
              Amandasig kitchen
            </span>
            <h2 id="pickup-heading" className="section-title mb-6">
              Pickup on Strawberry Street
            </h2>
            <p className="mb-8 text-lg leading-7 text-on-surface-variant">
              Collect from Villa Lanta Estate in Amandasig. We bake to your pickup window so the cake is still cold from
              the fridge, not from a freezer aisle.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href={SITE.mapsUrl}
                className="btn-primary text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Maps
              </a>
              <Link
                href="/contact"
                prefetch
                className="inline-flex items-center justify-center rounded-full border border-outline-variant px-8 py-3 text-center text-sm font-semibold uppercase tracking-widest text-chocolate-text hover:border-dadda-primary hover:text-dadda-primary"
              >
                Contact the bakery
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-1" data-stagger>
            <div className="rounded-3xl bg-surface p-6 shadow-sm" data-stagger-item>
              <MapPin className="mb-3 h-5 w-5 text-dadda-primary" aria-hidden />
              <h3 className="mb-2 font-display text-xl font-semibold text-chocolate-text">Address</h3>
              <p className="text-sm leading-6 text-on-surface-variant">
                {SITE.streetAddress}
                <br />
                {SITE.locality}, {SITE.city} {SITE.postalCode}
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-6 shadow-sm" data-stagger-item>
              <Clock className="mb-3 h-5 w-5 text-dadda-primary" aria-hidden />
              <h3 className="mb-2 font-display text-xl font-semibold text-chocolate-text">Hours</h3>
              <p className="text-sm leading-6 text-on-surface-variant">
                Monday–Friday 9:00 AM – 5:00 PM
                <br />
                Saturday 9:00 AM – 1:00 PM
                <br />
                Closed Sunday. Collections are booked to a window.
              </p>
            </div>
            <div className="rounded-3xl bg-surface p-6 shadow-sm" data-stagger-item>
              <Truck className="mb-3 h-5 w-5 text-dadda-primary" aria-hidden />
              <h3 className="mb-2 font-display text-xl font-semibold text-chocolate-text">Pretoria service area</h3>
              <p className="text-sm leading-6 text-on-surface-variant">
                Pickup is included. Delivery by arrangement across {areas.join(", ")}.
              </p>
              <p className="mt-3 text-sm text-on-surface-variant">
                <a href={`tel:${SITE.phone}`} className="font-semibold text-dadda-primary hover:underline">
                  {SITE.phoneDisplay}
                </a>
                {" · "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-dadda-primary hover:underline">
                  {SITE.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
