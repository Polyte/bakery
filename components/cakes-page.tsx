"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Phone } from "lucide-react"
import CakesHero from "@/components/cakes-hero"
import CakesCatalog from "@/components/cakes-catalog"
import LazyImage from "@/components/lazy-image"
import ParallaxCta from "@/components/parallax-cta"
import { CAKE_CATEGORIES, CAKE_CATEGORY_LIST, CAKE_PROCESS, CAKES_OVERVIEW_SLIDES } from "@/lib/cakes"
import { formatRand } from "@/lib/cake-order"

const featured = [
  CAKE_CATEGORIES.wedding.products[0],
  CAKE_CATEGORIES.birthday.products[2],
  CAKE_CATEGORIES.anniversary.products[2],
  CAKE_CATEGORIES.children.products[0],
  CAKE_CATEGORIES.corporate.products[0],
  CAKE_CATEGORIES.wedding.products[1],
]

export default function CakesPage() {
  return (
    <div className="flex w-full flex-col overflow-hidden bg-background">
      <CakesHero
        slides={CAKES_OVERVIEW_SLIDES}
        eyebrow="Celebration cakes · Pretoria"
        title="Custom cakes in Pretoria"
        italic="baked to order."
        description="Wedding tiers, birthday barrels, and children's rainbows — baked to order in Amandasig, never pulled from a freezer. Tell us the date. We'll bring the layers."
        ctaLabel="Order Your Cake"
        ctaHref="/order"
        ariaLabel="Cakes hero carousel"
      />

      <section className="mx-auto w-full max-w-[1200px] px-margin-mobile py-section-gap lg:px-margin-desktop">
        <div className="grid grid-cols-1 items-center gap-gutter md:grid-cols-12">
          <div className="col-span-1 md:col-span-5" data-animate="fade-left">
            <span className="mb-4 inline-block text-[12px] font-medium uppercase tracking-widest text-[#7d562d]">
              Dadda&apos;s cakes
            </span>
            <h2 className="mb-6 font-display text-[28px] font-semibold leading-9 text-[#2D241E] md:text-[32px] md:leading-10">
              From-scratch layers for Pretoria celebrations
            </h2>
            <p className="mb-6 text-base leading-6 text-on-surface-variant">
              Every cake leaves our kitchen on Strawberry Street the day it is meant to be eaten. We mix sponges to the
              guest list, finish flowers in the morning, and pack so the drive to the venue is the only thing that
              shakes.
            </p>
            <p className="text-sm leading-6 text-on-surface-variant">
              <MapPin className="mr-1 inline h-4 w-4 text-[#7d562d]" />
              6814 Strawberry Street, Amandasig ·{" "}
              <a href="tel:+27762196675" className="font-semibold text-[#7d562d] hover:underline">
                +27 76 219 6675
              </a>
              <br />
              <a href="mailto:info@daddasconfectionery.co.za" className="font-semibold text-[#7d562d] hover:underline">
                info@daddasconfectionery.co.za
              </a>
            </p>
          </div>
          <div className="relative col-span-1 aspect-[4/5] overflow-hidden rounded-xl shadow-md md:col-span-6 md:col-start-7" data-animate="fade-up">
            <LazyImage
              src="/images/cake-raspberry.webp"
              alt="Chocolate cake with raspberries, pistachios, and chocolate shards"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-section-gap">
        <div className="mx-auto max-w-[1200px] px-margin-mobile lg:px-margin-desktop">
          <div className="mb-12 max-w-2xl" data-animate="fade-up">
            <h2 className="mb-4 font-display text-[28px] font-semibold leading-9 text-[#2D241E] md:text-[32px] md:leading-10">
              Five ways to celebrate
            </h2>
            <p className="text-base leading-6 text-on-surface-variant">
              Wedding, birthday, anniversary, children&apos;s, and corporate — each with its own cakes, prices in Rand,
              and the same filling-to-checkout path.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5" data-stagger>
            {CAKE_CATEGORY_LIST.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl shadow-sm"
                data-stagger-item
              >
                <LazyImage
                  src={cat.image}
                  alt={cat.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D241E]/85 via-[#2D241E]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl font-semibold text-[#fff8ef]">{cat.label}</h3>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-widest text-[#fff8ef]/80">
                    From {formatRand(cat.fromPrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-margin-mobile py-section-gap lg:px-margin-desktop">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-2xl" data-animate="fade-up">
            <h2 className="mb-4 font-display text-[28px] font-semibold leading-9 text-[#2D241E] md:text-[32px] md:leading-10">
              Signature cakes
            </h2>
            <p className="text-base leading-6 text-on-surface-variant">
              A few of the cakes we bake most often. Add to cart as they are, or customise filling and finish.
            </p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#7d562d]"
            data-animate="fade-up"
          >
            View gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CakesCatalog products={featured} />
      </section>

      <section className="w-full bg-[#fff8ef] py-section-gap">
        <div className="mx-auto max-w-[1200px] px-margin-mobile lg:px-margin-desktop">
          <div className="mb-12 text-center" data-animate="fade-up">
            <span className="mb-4 inline-block text-[12px] font-medium uppercase tracking-widest text-[#7d562d]">
              How to order
            </span>
            <h2 className="font-display text-[28px] font-semibold leading-9 text-[#2D241E] md:text-[32px] md:leading-10">
              Consult → flavour → design → bake
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4" data-stagger>
            {CAKE_PROCESS.map((item) => (
              <div key={item.step} className="rounded-xl bg-surface p-6 shadow-sm" data-stagger-item>
                <p className="mb-3 font-display text-2xl font-semibold text-[#7d562d]">{item.step}</p>
                <h3 className="mb-2 font-display text-lg font-semibold text-[#2D241E]">{item.title}</h3>
                <p className="text-sm leading-6 text-on-surface-variant">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ParallaxCta
        src="/images/cake-raspberry.webp"
        alt="Chocolate raspberry cake on a stand with a slice in front"
        headline="The icing is calling."
        body="Tell us the date. We bake in Pretoria, finish the morning of collection, and pack for the drive."
        ctaLabel="Order Your Cake"
        ctaHref="/order"
        secondaryLabel="WhatsApp Us"
        secondaryHref="https://wa.me/27762196675"
        variant="band"
      />

      <section className="relative overflow-hidden bg-surface py-section-gap">
        <div className="relative z-10 mx-auto max-w-4xl px-margin-mobile text-center" data-animate="scale">
          <h2 className="mb-6 font-display text-[28px] font-bold leading-9 text-[#2D241E] md:text-[48px] md:leading-[56px]">
            Don&apos;t see the cake yet?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-7 text-on-surface-variant">
            Most of our work is custom. Send a photo, a colour, or a guest count — we&apos;ll answer from the kitchen.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/order" className="btn-primary w-full bg-[#7d562d] px-10 py-4 shadow-md hover:bg-[#623f18] sm:w-auto">
              Start Your Order
            </Link>
            <a
              href="https://wa.me/27762196675"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#7d562d] px-10 py-4 text-sm font-semibold uppercase tracking-widest text-[#7d562d] hover:bg-[#7d562d]/5 sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
