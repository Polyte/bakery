"use client"

import Link from "next/link"
import { MapPin, Phone } from "lucide-react"
import CakesHero from "@/components/cakes-hero"
import CakesCatalog from "@/components/cakes-catalog"
import { CAKE_PROCESS, getCakeCategory } from "@/lib/cakes"
import { formatRand, type CakeCategoryId } from "@/lib/cake-order"

export default function CakesCategoryView({ categoryId }: { categoryId: CakeCategoryId }) {
  const cat = getCakeCategory(categoryId)

  return (
    <div className="flex w-full flex-col overflow-hidden bg-background">
      <CakesHero
        slides={cat.slides}
        eyebrow={cat.eyebrow}
        title={cat.title}
        italic={cat.italic}
        description={cat.description}
        ctaLabel="Browse These Cakes"
        ctaHref="#menu"
        ariaLabel={`${cat.label} hero`}
      />

      <section className="mx-auto w-full max-w-[1200px] px-margin-mobile py-section-gap lg:px-margin-desktop">
        <div className="mx-auto max-w-3xl text-center" data-animate="fade-up">
          <span className="mb-4 inline-block text-[12px] font-medium uppercase tracking-widest text-[#7d562d]">
            {cat.label} · From {formatRand(cat.fromPrice)}
          </span>
          <h2 className="mb-6 font-display text-[28px] font-semibold leading-9 text-[#2D241E] md:text-[32px] md:leading-10">
            Baked to order in Pretoria
          </h2>
          <p className="text-base leading-6 text-on-surface-variant">{cat.intro}</p>
          <p className="mt-6 text-sm leading-6 text-on-surface-variant">
            <MapPin className="mr-1 inline h-4 w-4 text-[#7d562d]" />
            6814 Strawberry Street, Amandasig ·{" "}
            <a href="tel:+27762196675" className="font-semibold text-[#7d562d] hover:underline">
              +27 76 219 6675
            </a>
          </p>
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-section-gap" id="menu">
        <div className="mx-auto max-w-[1200px] px-margin-mobile lg:px-margin-desktop">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl" data-animate="fade-up">
              <h2 className="mb-4 font-display text-[28px] font-semibold leading-9 text-[#2D241E] md:text-[32px] md:leading-10">
                Choose a cake, then make it yours
              </h2>
              <p className="text-base leading-6 text-on-surface-variant">
                Add a ready design to the cart, or customise filling, size notes, and finish through the same order flow
                as our signature cakes.
              </p>
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#7d562d]" data-animate="fade-up">
              From {formatRand(cat.fromPrice)}
            </p>
          </div>
          <CakesCatalog products={cat.products} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-margin-mobile py-section-gap lg:px-margin-desktop">
        <div className="mb-12 text-center" data-animate="fade-up">
          <span className="mb-4 inline-block text-[12px] font-medium uppercase tracking-widest text-[#7d562d]">
            How to order
          </span>
          <h2 className="font-display text-[28px] font-semibold leading-9 text-[#2D241E] md:text-[32px] md:leading-10">
            Consult, flavour, design, bake
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4" data-stagger>
          {CAKE_PROCESS.map((item) => (
            <div key={item.step} className="rounded-xl bg-surface-container p-6" data-stagger-item>
              <p className="mb-3 font-display text-2xl font-semibold text-[#7d562d]">{item.step}</p>
              <h3 className="mb-2 font-display text-lg font-semibold text-[#2D241E]">{item.title}</h3>
              <p className="text-sm leading-6 text-on-surface-variant">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#2D241E] py-section-gap">
        <div className="relative z-10 mx-auto max-w-4xl px-margin-mobile text-center" data-animate="scale">
          <h2 className="mb-6 font-display text-[28px] font-bold leading-9 text-[#fff8ef] md:text-[48px] md:leading-[56px]">
            Ready to order {cat.label.toLowerCase()}?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-7 text-[#fff8ef]/80">
            Customise filling and finish, or message the kitchen on WhatsApp. Pickup from Amandasig, Pretoria.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/order" className="btn-primary w-full bg-[#7d562d] px-10 py-4 shadow-md hover:bg-[#623f18] sm:w-auto">
              Start Your Order
            </Link>
            <a
              href="https://wa.me/27762196675"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#fff8ef] px-10 py-4 text-sm font-semibold uppercase tracking-widest text-[#fff8ef] hover:bg-[#fff8ef]/10 sm:w-auto"
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
