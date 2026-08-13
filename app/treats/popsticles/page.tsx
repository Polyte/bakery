import Link from "next/link"
import { IceCreamCone, MapPin, Snowflake, Sun } from "lucide-react"
import PopsticlesHero from "@/components/popsticles-hero"
import PopsticlesCatalog from "@/components/popsticles-catalog"

import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"
import { formatRand } from "@/lib/cake-order"
import { POPSTICLES_FROM_PRICE } from "@/lib/popsticles"

export const metadata = pageMetadata("/treats/popsticles")

export default function PopsticlesPage() {
  return (
    <div className="flex w-full flex-col overflow-hidden bg-background">
      <SeoGraph path="/treats/popsticles" />
      <PopsticlesHero />

      <section className="mx-auto w-full max-w-[1200px] px-margin-mobile py-section-gap lg:px-margin-desktop">
        <div className="mx-auto max-w-3xl text-center" data-animate="fade-up">
          <span className="mb-4 inline-block text-[12px] font-medium uppercase tracking-widest text-dadda-primary">
            From the freezer, not the oven
          </span>
          <h2 className="mb-6 font-display text-[28px] font-semibold leading-9 text-chocolate-text md:text-[32px] md:leading-10">
            Ice cream on a stick, finished in chocolate
          </h2>
          <p className="text-base leading-6 text-on-surface-variant">
            We churn a dense cream, freeze it on a wooden stick, then dip each bar in tempered chocolate so the shell
            snaps. Six flavours, sold as single bars or boxed for a table. Collect from our Pretoria kitchen in
            Amandasig. Keep them frozen until the moment you unwrap them.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3" data-stagger>
          {[
            {
              icon: IceCreamCone,
              title: "Hand-dipped",
              copy: "Each bar is dipped twice so the coat is thick enough to crack, not flake.",
            },
            {
              icon: Snowflake,
              title: "Kept frozen",
              copy: "Packed in insulated boxes. Tell us your pickup window and we hold them cold.",
            },
            {
              icon: MapPin,
              title: "Pretoria pickup",
              copy: "6814 Strawberry Street, Villa Lanta Estate, Amandasig. Delivery on request.",
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-xl bg-surface-container p-6 text-center shadow-sm"
                data-stagger-item
              >
                <Icon className="mx-auto mb-4 h-8 w-8 text-dadda-primary" />
                <h3 className="mb-2 font-display text-lg font-semibold text-chocolate-text">{item.title}</h3>
                <p className="text-sm leading-6 text-on-surface-variant">{item.copy}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-section-gap" id="popsticle-menu">
        <div className="mx-auto max-w-[1200px] px-margin-mobile lg:px-margin-desktop">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl" data-animate="fade-up">
              <h2 className="mb-4 font-display text-[28px] font-semibold leading-9 text-chocolate-text md:text-[32px] md:leading-10">
                Choose your coat
              </h2>
              <p className="text-base leading-6 text-on-surface-variant">
                Prices are per bar, in Rand. Add a few to the cart, then check out as a Pretoria pickup. Mix flavours in
                the same box.
              </p>
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-dadda-primary" data-animate="fade-up">
              From {formatRand(POPSTICLES_FROM_PRICE)}
            </p>
          </div>

          <PopsticlesCatalog />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-margin-mobile py-section-gap lg:px-margin-desktop">
        <div className="grid grid-cols-1 items-center gap-gutter md:grid-cols-12">
          <div className="col-span-1 md:col-span-5" data-animate="fade-left">
            <span className="mb-4 inline-block text-[12px] font-medium uppercase tracking-widest text-sage-muted">
              How to order
            </span>
            <h2 className="mb-6 font-display text-[28px] font-semibold leading-9 text-chocolate-text md:text-[32px] md:leading-10">
              Sizes, seasons, and the stick
            </h2>
            <ul className="flex flex-col gap-5 text-base leading-6 text-on-surface-variant">
              <li>
                <span className="font-semibold text-chocolate-text">Standard bar.</span> One stick, about 90g. The
                portion in the film above.
              </li>
              <li>
                <span className="font-semibold text-chocolate-text">Mix a box.</span> Add six (or more) to the cart and
                we pack them together. A handy number for a braai or kids&apos; table.
              </li>
              <li>
                <span className="font-semibold text-chocolate-text">Seasonal dips.</span> Strawberry and mint lean into
                warmer months; dark and caramel stay on the board year-round.
              </li>
              <li>
                <span className="font-semibold text-chocolate-text">Pickup.</span> Frozen collection from Amandasig.
                Please give us a day&apos;s notice so we can dip a fresh batch.
              </li>
            </ul>
          </div>
          <div
            className="col-span-1 flex flex-col gap-4 rounded-xl bg-[#2D241E] p-8 text-[#fff8ef] md:col-span-7"
            data-animate="fade-up"
          >
            <Sun className="h-8 w-8 text-primary-container" />
            <h3 className="font-display text-2xl font-semibold">Keep them cold until the unwrap</h3>
            <p className="text-base leading-7 text-[#fff8ef]/80">
              Popsticles leave our kitchen frozen solid. Bring a cooler if you have a drive, or eat them in the garden
              on Strawberry Street. They are not a cake, and they will not survive a warm car.
            </p>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-container">
              Demo cart · no card is charged
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface py-section-gap">
        <div className="relative z-10 mx-auto max-w-4xl px-margin-mobile text-center" data-animate="scale">
          <h2 className="mb-6 font-display text-[28px] font-bold leading-9 text-chocolate-text md:text-[48px] md:leading-[56px]">
            Ready for a Popsticle?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-7 text-on-surface-variant">
            Add your flavours above, then open the cart to check out. Still after scones or a cake? Those live next door
            on the menu.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/checkout" className="btn-primary w-full px-10 py-4 shadow-md sm:w-auto">
              View cart
            </Link>
            <Link
              href="/treats"
              className="w-full rounded-full border-2 border-dadda-primary px-10 py-4 text-sm font-semibold uppercase tracking-widest text-dadda-primary hover:bg-dadda-primary/5 sm:w-auto"
            >
              Scones &amp; Treats
            </Link>
          </div>
        </div>
      </section>
      <SeoFaq path="/treats/popsticles" />
    </div>
  )
}
