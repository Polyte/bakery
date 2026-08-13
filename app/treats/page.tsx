import Link from "next/link"
import { MapPin, Sparkles, Wheat } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import TreatsHero from "@/components/treats-hero"
import TreatsCatalog from "@/components/treats-catalog"
import FreshRolls from "@/components/fresh-rolls"
import ParallaxCta from "@/components/parallax-cta"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"
import { formatRand } from "@/lib/cake-order"
import { TREATS_FROM_PRICE } from "@/lib/treats"

export const metadata = pageMetadata("/treats")

export default function TreatsPage() {
  return (
    <div className="flex w-full flex-col overflow-hidden bg-background">
      <SeoGraph path="/treats" />
      <TreatsHero />

      <section className="mx-auto w-full max-w-[1200px] px-margin-mobile py-section-gap lg:px-margin-desktop">
        <div className="grid grid-cols-1 items-center gap-gutter md:grid-cols-12">
          <div className="col-span-1 md:col-span-5" data-animate="fade-left">
            <span className="mb-4 inline-block text-[12px] font-medium uppercase tracking-widest text-dadda-primary">
              From the Pretoria kitchen
            </span>
            <h2 className="mb-6 font-display text-[28px] font-semibold leading-9 text-chocolate-text md:text-[32px] md:leading-10">
              The golden buttery scone
            </h2>
            <p className="mb-6 text-base leading-6 text-on-surface-variant">
              Crisp outside, tender inside, packed in 5, 10, or 20 litre tubs. We bake to the orders on the board in
              Amandasig — vanilla buttermilk, white chocolate raspberry, or aged cheddar and herb. Collect from
              Strawberry Street, or ask about delivery across Pretoria.
            </p>
            <p className="text-sm leading-6 text-on-surface-variant">
              <MapPin className="mr-1 inline h-4 w-4 text-dadda-primary" />
              6814 Strawberry Street, Amandasig ·{" "}
              <a href="tel:+27762196675" className="font-semibold text-dadda-primary hover:underline">
                +27 76 219 6675
              </a>
            </p>
          </div>
          <div
            className="relative col-span-1 aspect-[4/5] overflow-hidden rounded-xl shadow-md md:col-span-6 md:col-start-7"
            data-animate="fade-up"
          >
            <LazyImage
              src="/stitch/treats-scones.jpg"
              alt="Golden scones with a teapot"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 45vw, 100vw"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3" data-stagger>
          {[
            {
              icon: Wheat,
              title: "Baked that morning",
              copy: "Scones and croissants leave the oven the day you collect. No day-old trays.",
            },
            {
              icon: Sparkles,
              title: "Tub what you need",
              copy: "5, 10, or 20 litre scone tubs, or mix croissants, macarons, and a tart in the same cart.",
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

      <FreshRolls />

      <section className="w-full bg-surface-container-low py-section-gap" id="scones-menu">
        <div className="mx-auto max-w-[1200px] px-margin-mobile lg:px-margin-desktop">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl" data-animate="fade-up">
              <h2 className="mb-4 font-display text-[28px] font-semibold leading-9 text-chocolate-text md:text-[32px] md:leading-10">
                Choose your tub
              </h2>
              <p className="text-base leading-6 text-on-surface-variant">
                Scones are packed in 5, 10, or 20 litre tubs. Croissants, macarons, and tarts are priced each, in Rand.
                Add them to the cart, then check out as a Pretoria pickup.
              </p>
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-dadda-primary" data-animate="fade-up">
              From {formatRand(TREATS_FROM_PRICE)}
            </p>
          </div>

          <TreatsCatalog />
        </div>
      </section>

      <ParallaxCta
        src="/images/cupcakes-berries.webp"
        alt="Cupcakes topped with fresh strawberries, raspberries, and berries"
        headline="Berry beautiful. Baked to order."
        body="Cupcakes piled with fresh berries, ready for your next Pretoria celebration — or pair them with a box of Popsticles."
        ctaLabel="See Cupcakes"
        ctaHref="/treats/cupcakes"
        secondaryLabel="See Popsticles"
        secondaryHref="/treats/popsticles"
        variant="band"
      />

      <section className="relative overflow-hidden bg-surface py-section-gap">
        <div className="relative z-10 mx-auto max-w-4xl px-margin-mobile text-center" data-animate="scale">
          <h2 className="mb-6 font-display text-[28px] font-bold leading-9 text-chocolate-text md:text-[48px] md:leading-[56px]">
            Ready for a treat?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-7 text-on-surface-variant">
            Add your scones and pastries above, then open the cart to check out. Still after a swirl or a Popsticle?
            Those live next door on the menu.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/checkout" className="btn-primary w-full px-10 py-4 shadow-md sm:w-auto">
              View cart
            </Link>
            <Link
              href="/treats/cupcakes"
              className="w-full rounded-full border-2 border-dadda-primary px-10 py-4 text-sm font-semibold uppercase tracking-widest text-dadda-primary hover:bg-dadda-primary/5 sm:w-auto"
            >
              See cupcakes
            </Link>
          </div>
        </div>
      </section>
      <SeoFaq path="/treats" />
    </div>
  )
}
