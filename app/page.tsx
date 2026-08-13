import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight } from "lucide-react"
import HomeHero from "@/components/home-hero"
import HomeOrderPaths from "@/components/home-order-paths"
import HomePickup from "@/components/home-pickup"
import HomeProcess from "@/components/home-process"
import LazyImage from "@/components/lazy-image"
import ParallaxCta from "@/components/parallax-cta"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import InstagramFeed, { InstagramFeedFallback } from "@/components/instagram-feed"
import { formatRand } from "@/lib/cake-order"
import { CAKE_CATEGORIES, CAKE_CATEGORY_LIST } from "@/lib/cakes"
import { CUPCAKES, CUPCAKES_FROM_PRICE } from "@/lib/cupcakes"
import { POPSTICLES, POPSTICLES_FROM_PRICE } from "@/lib/popsticles"
import { TREATS } from "@/lib/treats"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/")

const cakesFromPrice = Math.min(...CAKE_CATEGORY_LIST.map((category) => category.fromPrice))

const categories = [
  {
    title: "Celebration Cakes",
    description: `Wedding, birthday, and children's cakes from ${formatRand(cakesFromPrice)}.`,
    image: "/cakes/wedding.jpg",
    alt: "Four-tier garden berry wedding cake from Dadda's Confectionery",
    href: "/cakes",
    cta: "Browse cakes",
    shape: "organic",
  },
  {
    title: "Small Treats",
    description: `Cupcakes from ${formatRand(CUPCAKES_FROM_PRICE)}, scones, and Popsticles.`,
    image: "/videos/cupcakes-blue.jpg",
    alt: "Blueberry-frosted cupcakes baked in Amandasig",
    href: "/treats",
    cta: "Shop treats",
    shape: "circle",
    offset: true,
  },
  {
    title: "Custom Bakes",
    description: "Name, flavour, and finish set for your Pretoria date.",
    image: "/cakes/cake1.jpg",
    alt: "Custom message barrel cake with gold edges and macarons",
    href: "/order",
    cta: "Start an order",
    shape: "organic",
    delay: true,
  },
]

const featuredCakes = [
  {
    product: CAKE_CATEGORIES.wedding.products[1],
    href: "/cakes/wedding",
  },
  {
    product: CAKE_CATEGORIES.birthday.products[2],
    href: "/cakes/birthday",
  },
  {
    product: CAKE_CATEGORIES.children.products[2],
    href: "/cakes/children",
  },
]

const featuredTreats = [
  {
    title: CUPCAKES[0].name,
    description: CUPCAKES[0].description,
    price: CUPCAKES[0].price,
    image: CUPCAKES[0].image,
    href: "/treats/cupcakes",
    badge: CUPCAKES[0].note,
  },
  {
    title: TREATS[0].name,
    description: TREATS[0].description,
    price: TREATS[0].price,
    image: TREATS[0].image,
    href: "/treats",
    badge: TREATS[0].note,
  },
  {
    title: `${POPSTICLES[0].name} Popsticle`,
    description: POPSTICLES[0].description,
    price: POPSTICLES[0].price,
    image: POPSTICLES[0].image,
    href: "/treats/popsticles",
    badge: POPSTICLES[0].note,
  },
]

const autumnSpice = CUPCAKES.find((item) => item.id === "cupcake-autumn") ?? CUPCAKES[6]

const celebrations = [
  {
    src: "/cakes/cake15.jpg",
    alt: "Red velvet LOVE cake and cupcakes boxed at Dadda's Confectionery",
    offset: false,
  },
  {
    src: "/cakes/cake9.jpg",
    alt: "Gold letter birthday cake baked in Amandasig, Pretoria",
    offset: true,
  },
  {
    src: "/images/cake-raspberry.webp",
    alt: "Chocolate raspberry cake with pistachios from Dadda's Pretoria kitchen",
    offset: false,
  },
]

export default function Home() {
  return (
    <div className="flex w-full flex-col overflow-hidden bg-background">
      <SeoGraph path="/" />
      <HomeHero />
      <HomeOrderPaths />

      <section className="relative w-full bg-surface py-section-gap" id="treats">
        <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="mx-auto mb-16 max-w-2xl text-center" data-animate="fade-up">
            <h2 className="section-title mb-4">Baked in Amandasig for Pretoria tables</h2>
            <p className="mb-4 text-base text-on-surface-variant">
              Custom cakes, boxed treats, and from-scratch orders — collected from Villa Lanta Estate or delivered by
              arrangement.
            </p>
            <div className="mx-auto h-1 w-16 rounded-full bg-dadda-primary" />
          </div>

          <div className="grid grid-cols-1 gap-12 px-4 md:grid-cols-3 lg:gap-16 lg:px-12" data-stagger>
            {categories.map((category) => (
              <div
                key={category.title}
                className={`group flex flex-col items-center text-center ${category.offset ? "md:translate-y-8" : ""}`}
                data-stagger-item
              >
                <Link href={category.href} prefetch className="w-full max-w-[280px]">
                  <div
                    className={`relative mb-6 aspect-square w-full overflow-hidden border-4 border-surface bg-surface-container shadow-lg group-hover:shadow-pastry ${
                      category.shape === "circle" ? "rounded-full" : "organic-shape"
                    }`}
                    style={category.delay ? { animationDelay: "-4s" } : undefined}
                  >
                    <LazyImage
                      src={category.image}
                      alt={category.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 280px, 80vw"
                    />
                  </div>
                </Link>
                <h3 className="mb-2 font-display text-2xl font-semibold text-chocolate-text">{category.title}</h3>
                <p className="mb-3 max-w-xs text-sm text-on-surface-variant">{category.description}</p>
                <Link
                  href={category.href}
                  prefetch
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-dadda-primary hover:text-primary-container"
                >
                  {category.cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ParallaxCta
        src="/videos/chocolate-calling.mp4"
        poster="/videos/chocolate-calling.jpg"
        alt="Chocolate donut with colorful sprinkles as a looping background"
        headline="The Chocolate is Calling"
        body="Mini cakes, dripping ganache, and celebration-ready sweetness — baked to order in Pretoria, never off the shelf."
        ctaLabel="Order Now"
        ctaHref="/order"
        variant="band"
      />

      <section className="w-full bg-cream-surface py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl" data-animate="fade-up">
              <h2 className="section-title">Cakes from this kitchen</h2>
              <p className="text-base text-on-surface-variant">
                Real cakes from the catalog — wedding tiers, birthday barrels, and kids' cakes baked in Amandasig.
              </p>
            </div>
            <Link
              href="/cakes"
              prefetch
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-dadda-primary hover:text-primary-container"
              data-animate="fade-up"
            >
              All cakes <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3" data-stagger>
            {featuredCakes.map(({ product, href }) => (
              <Link
                key={product.id}
                href={href}
                prefetch
                className="group flex flex-col rounded-3xl border border-outline-variant/30 bg-surface p-6 shadow-sm hover:shadow-pastry"
                data-stagger-item
              >
                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-container">
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                  {product.note && (
                    <div className="absolute right-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-dadda-primary shadow-sm backdrop-blur">
                      {product.note}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h3 className="font-display text-[22px] font-semibold text-chocolate-text">{product.name}</h3>
                  <p className="mb-2 text-sm text-on-surface-variant">{product.description}</p>
                  <p className="text-sm font-semibold uppercase tracking-widest text-dadda-primary">
                    From {formatRand(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-surface py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl" data-animate="fade-up">
              <h2 className="section-title">Cupcakes, scones &amp; Popsticles</h2>
              <p className="text-base text-on-surface-variant">
                Boxed for Pretoria pickup. Cupcakes from {formatRand(CUPCAKES_FROM_PRICE)}, Popsticles from{" "}
                {formatRand(POPSTICLES_FROM_PRICE)}.
              </p>
            </div>
            <Link
              href="/treats"
              prefetch
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-dadda-primary hover:text-primary-container"
              data-animate="fade-up"
            >
              All treats <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3" data-stagger>
            {featuredTreats.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                prefetch
                className="group flex flex-col rounded-3xl border border-outline-variant/30 bg-cream-surface p-6 shadow-sm hover:shadow-pastry"
                data-stagger-item
              >
                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-container">
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                  {item.badge && (
                    <div className="absolute right-4 top-4 rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container shadow-sm">
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h3 className="font-display text-[22px] font-semibold text-chocolate-text">{item.title}</h3>
                  <p className="mb-2 text-sm text-on-surface-variant">{item.description}</p>
                  <p className="text-sm font-semibold uppercase tracking-widest text-dadda-primary">
                    {formatRand(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="order-2 flex flex-col items-start lg:order-1" data-animate="fade-left">
              <span className="mb-4 text-sm font-semibold uppercase tracking-widest text-dadda-primary">
                Seasonal batch
              </span>
              <h2 className="section-title mb-6">{autumnSpice.name} cupcakes</h2>
              <p className="mb-8 text-lg text-on-surface-variant">{autumnSpice.description}</p>
              <p className="mb-8 text-sm font-semibold uppercase tracking-widest text-dadda-primary">
                From {formatRand(autumnSpice.price)}
              </p>
              <Link href="/treats/cupcakes" prefetch className="btn-primary">
                Order cupcakes
              </Link>
            </div>
            <div className="order-1 lg:order-2" data-animate="fade-right">
              <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl shadow-2xl">
                <LazyImage
                  src={autumnSpice.image}
                  alt={`${autumnSpice.name} cupcakes from Dadda's Confectionery in Pretoria`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 28rem, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeProcess />

      <section className="w-full bg-surface py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div data-animate="fade-right">
              <div className="relative aspect-video w-full overflow-hidden rounded-[40px] shadow-xl lg:aspect-square">
                <LazyImage
                  src="/images/cake-croissants.webp"
                  alt="Naked berry cake beside croissants and cream from Dadda's Pretoria kitchen"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>
            <div className="flex flex-col items-start" data-animate="fade-left">
              <h2 className="section-title mb-6">The Dadda&apos;s Story</h2>
              <p className="mb-6 text-lg text-on-surface-variant">
                Since 2018 we have baked from 6814 Strawberry Street, Villa Lanta Estate, Amandasig. Every sponge is
                mixed for the day it will be eaten — not pulled from a freezer.
              </p>
              <p className="text-base text-on-surface-variant">
                Pretoria birthdays, Akasia weddings, office tables in Pretoria North: the same kitchen, the same from-scratch
                method, packed for the drive home.
              </p>
              <Link
                href="/about"
                prefetch
                className="mt-8 inline-flex items-center text-sm font-semibold uppercase tracking-wider text-dadda-primary"
              >
                Read Our Story <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomePickup />

      <section className="w-full bg-cream-surface py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="mx-auto mb-16 max-w-2xl text-center" data-animate="fade-up">
            <h2 className="section-title mb-4">From the Amandasig kitchen</h2>
            <p className="text-base text-on-surface-variant">
              Cakes we actually bake — anniversary boxes, birthday barrels, and chocolate raspberry stands.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3" data-stagger>
            {celebrations.map((item) => (
              <div
                key={item.src}
                className={`relative h-80 overflow-hidden rounded-2xl shadow-md ${item.offset ? "md:translate-y-8" : ""}`}
                data-stagger-item
              >
                <LazyImage
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFaq path="/" />
      <Suspense fallback={<InstagramFeedFallback />}>
        <InstagramFeed />
      </Suspense>
    </div>
  )
}
