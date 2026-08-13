import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import OrderNowForm from "@/components/order-now-form"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata, SITE } from "@/lib/seo"
import { formatRand } from "@/lib/cake-order"
import { CAKE_CATEGORIES } from "@/lib/cakes"
import { CUPCAKES_FROM_PRICE } from "@/lib/cupcakes"

const MAPS_URL = SITE.mapsUrl

const trending = [
  {
    href: "/cakes/birthday",
    name: "Dark Choc Cake",
    price: CAKE_CATEGORIES.birthday.fromPrice,
    image: "/stitch/order-v3/dark-choc.jpg",
    alt: "A rich chocolate celebration cake",
    badge: "Best",
  },
  {
    href: "/treats#scones-menu",
    name: "Scone Box",
    price: 300,
    image: "/stitch/order-v3/scone-box.jpg",
    alt: "Classic buttery scones",
  },
  {
    href: "/cakes/birthday",
    name: "Vanilla Tier",
    price: 950,
    image: "/stitch/order-v3/event-cakes.jpg",
    alt: "Vanilla celebration cake",
  },
  {
    href: "/treats/cupcakes",
    name: "Cupcake Set",
    price: CUPCAKES_FROM_PRICE * 10,
    image: "/stitch/order-v3/cupcake-set.jpg",
    alt: "Assorted cupcakes",
    badge: "New",
    badgeTone: "strawberry" as const,
  },
]

export const metadata = pageMetadata("/order")

export default function OrderPage() {
  return (
    <div className="flex w-full flex-col overflow-hidden bg-surface">
      <SeoGraph path="/order" />

      <section className="w-full bg-surface pb-16 pt-32 lg:pb-24">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="z-10 flex flex-col gap-8 lg:col-span-5" data-animate="fade-up">
              <div className="inline-flex self-start bg-strawberry-accent px-4 py-2 text-[12px] font-bold uppercase tracking-widest text-on-primary">
                Boutique Bakery
              </div>
              <h1 className="font-sans text-[48px] font-bold uppercase leading-[56px] tracking-[-0.02em] text-on-surface lg:text-[80px] lg:leading-[88px]">
                Bold
                <br />
                <span className="text-dadda-primary">Flavours.</span>
                <br />
                Modern
                <br />
                Bakes.
              </h1>
              <p className="max-w-md text-lg leading-7 text-on-surface-variant">
                Unapologetically delicious cakes and treats. Handcrafted in Pretoria.
              </p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#trending"
                  className="px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-surface bg-on-surface hover:bg-dadda-primary"
                >
                  Shop Now
                </Link>
                <Link
                  href="#collections"
                  className="border-2 border-on-surface px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-on-surface hover:bg-surface-container"
                >
                  View Menu
                </Link>
              </div>
            </div>
            <div className="relative h-[60vh] min-h-[500px] lg:col-span-7" data-animate="fade-up">
              <div className="absolute right-0 top-0 h-4/5 w-4/5 bg-primary-container" />
              <div className="absolute bottom-0 left-0 z-10 h-3/4 w-3/4 shadow-2xl">
                <LazyImage
                  src="/stitch/order-v3/hero-cupcakes.jpg"
                  alt="Modern cupcakes on a marble stand"
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
              </div>
              <div className="absolute -right-12 top-1/4 z-0 h-64 w-64 rounded-full bg-secondary-container blur-2xl mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className="w-full scroll-mt-28 bg-surface-container-low py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row" data-animate="fade-up">
            <div>
              <h2 className="mb-4 font-sans text-[32px] font-bold uppercase leading-10 text-on-surface md:text-[48px] md:leading-[56px]">
                Signature
                <br />
                Collections
              </h2>
              <div className="h-2 w-24 bg-dadda-primary" />
            </div>
            <p className="max-w-sm text-lg leading-7 text-on-surface-variant md:text-right">
              Curated selections of our most requested bakes. Bold, beautiful, and utterly delicious.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12" data-stagger>
            <Link
              href="/treats"
              className="group relative col-span-1 flex h-[500px] flex-col justify-end overflow-hidden bg-surface p-8 md:col-span-8"
              data-stagger-item
            >
              <LazyImage
                src="/stitch/order-v3/scones.jpg"
                alt="Fresh buttery scones"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 768px) 66vw, 100vw"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent" />
              <div className="relative z-20 flex flex-col gap-2">
                <span className="text-[12px] font-bold uppercase tracking-widest text-dadda-primary">The Classics</span>
                <h3 className="font-sans text-[28px] font-bold uppercase leading-9 text-surface md:text-[32px] md:leading-10">
                  Buttery Scones
                </h3>
                <span className="mt-4 inline-flex items-center text-sm font-bold uppercase tracking-wider text-surface group-hover:text-dadda-primary">
                  Explore <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </div>
            </Link>
            <Link
              href="/cakes"
              className="group relative col-span-1 flex h-[500px] flex-col justify-end overflow-hidden bg-primary-container p-8 md:col-span-4"
              data-stagger-item
            >
              <div className="absolute inset-0 z-0 mix-blend-luminosity opacity-80 transition-transform duration-700 group-hover:scale-105">
                <LazyImage
                  src="/stitch/order-v3/event-cakes.jpg"
                  alt="Event cakes"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary-container/90 via-primary-container/40 to-transparent" />
              <div className="relative z-20 flex flex-col gap-2">
                <span className="text-[12px] font-bold uppercase tracking-widest text-on-primary-container">
                  Showstoppers
                </span>
                <h3 className="font-sans text-[28px] font-bold uppercase leading-9 text-on-primary-container md:text-[32px] md:leading-10">
                  Event Cakes
                </h3>
                <span className="mt-4 inline-flex items-center text-sm font-bold uppercase tracking-wider text-on-primary-container group-hover:text-surface">
                  Explore <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </div>
            </Link>
            <div className="col-span-1 flex flex-col items-center justify-between gap-8 bg-strawberry-accent p-12 text-on-primary md:col-span-12 md:flex-row" data-stagger-item>
              <div>
                <h3 className="mb-2 font-sans text-[28px] font-bold uppercase leading-9 md:text-[32px] md:leading-10">
                  Need a Custom Order?
                </h3>
                <p className="max-w-xl text-base leading-6 opacity-90">
                  We create bespoke designs for your special moments. Let&apos;s build something unique.
                </p>
              </div>
              <Link
                href="#order-form"
                className="whitespace-nowrap bg-on-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-strawberry-accent hover:bg-surface-container"
              >
                Start a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="trending" className="w-full scroll-mt-28 bg-surface py-section-gap">
        <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
          <div className="mb-12 flex items-center justify-between" data-animate="fade-up">
            <h2 className="font-sans text-[28px] font-bold uppercase leading-9 text-on-surface md:text-[32px] md:leading-10">
              Trending Now
            </h2>
            <Link
              href="/cakes"
              className="hidden items-center gap-2 text-sm font-bold uppercase tracking-widest text-dadda-primary hover:text-on-surface sm:inline-flex"
            >
              View Menu <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
            {trending.map((item) => (
              <Link key={item.name} href={item.href} className="group flex flex-col gap-4" data-stagger-item>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container">
                  <LazyImage
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                  {item.badge && (
                    <div
                      className={`absolute left-4 top-4 px-3 py-1 text-[12px] font-bold uppercase tracking-widest ${
                        item.badgeTone === "strawberry"
                          ? "bg-strawberry-accent text-on-primary"
                          : "bg-dadda-primary text-on-primary"
                      }`}
                    >
                      {item.badge}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-sans text-[20px] font-bold uppercase text-on-surface">{item.name}</h3>
                  <p className="text-sm font-bold text-dadda-primary">{formatRand(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="order-form"
        className="mx-auto w-full max-w-container-max scroll-mt-28 px-margin-mobile py-section-gap lg:px-margin-desktop"
      >
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Suspense
              fallback={<div className="h-[720px] animate-pulse border border-outline-variant/30 bg-surface" />}
            >
              <OrderNowForm />
            </Suspense>
          </div>
          <aside className="mt-12 flex flex-col gap-12 lg:col-span-5 lg:mt-0">
            <div className="flex flex-col gap-8 bg-on-surface p-8 text-surface" data-animate="fade-up">
              <h3 className="font-sans text-2xl font-bold uppercase text-surface">Get in Touch</h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-dadda-primary" />
                  <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-sm leading-6 opacity-80 hover:text-dadda-primary">
                    6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, Pretoria
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-dadda-primary" />
                  <a href={`tel:${SITE.phone}`} className="text-sm leading-6 opacity-80 hover:text-dadda-primary">
                    {SITE.phoneDisplay}
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-5 w-5 shrink-0 text-dadda-primary" />
                  <a href={`mailto:${SITE.email}`} className="text-sm leading-6 opacity-80 hover:text-dadda-primary">
                    {SITE.email}
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-dadda-primary" />
                  <p className="text-sm leading-6 opacity-80">
                    Mon–Fri 9:00–17:00
                    <br />
                    Saturday 9:00–13:00
                    <br />
                    Closed Sunday
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <SeoFaq path="/order" />
    </div>
  )
}
