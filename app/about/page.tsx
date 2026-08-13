import { Heart, Leaf, PartyPopper } from "lucide-react"
import LazyImage from "@/components/lazy-image"
import ParallaxCta from "@/components/parallax-cta"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"

const philosophy = [
  {
    title: "Made with Love",
    description:
      "Passion is our primary ingredient. We infuse care and attention into every detail, ensuring each creation resonates with warmth.",
    icon: Heart,
    iconWrap: "bg-secondary-container",
    iconClass: "text-on-secondary-container",
  },
  {
    title: "Fresh Ingredients",
    description:
      "Quality you can truly taste. We carefully select the finest seasonal ingredients to craft flavors that are vibrant and authentic.",
    icon: Leaf,
    iconWrap: "bg-primary-container",
    iconClass: "text-on-primary-container",
  },
  {
    title: "Personal Service",
    description:
      "From our kitchen straight to your celebration. We pride ourselves on creating personalized experiences for every client.",
    icon: PartyPopper,
    iconWrap: "bg-surface-variant",
    iconClass: "text-on-surface-variant",
  },
]

export const metadata = pageMetadata("/about")

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col overflow-hidden bg-background">
      <SeoGraph path="/about" />
      <section className="relative flex h-[60vh] w-full items-center justify-center md:h-[80vh]">
        <div className="absolute inset-0 z-0">
          <LazyImage
            src="/stitch/about-hero.jpg"
            alt="Baker decorating a rustic cake with fresh flowers in a sunlit kitchen"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto mt-20 max-w-container-max px-margin-mobile text-center lg:px-margin-desktop">
          <h1
            className="mx-auto max-w-4xl font-display text-[28px] font-bold leading-9 tracking-tight text-chocolate-text drop-shadow-sm md:text-5xl md:leading-[56px]"
            data-animate="fade-up"
          >
            Pretoria bakery with heart
            <span className="mt-2 block font-light italic text-on-surface-variant">Dadda&apos;s Confectionery, Amandasig</span>
          </h1>
        </div>
      </section>

      <section className="w-full bg-surface py-section-gap">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-margin-mobile text-center lg:px-margin-desktop">
          <h2 className="relative inline-block self-center font-display text-[32px] font-semibold leading-10 text-chocolate-text" data-animate="fade-up">
            A Legacy of Sweet Traditions
            <span className="absolute -bottom-4 left-1/2 h-[2px] w-12 -translate-x-1/2 bg-dadda-primary" />
          </h2>
          <div className="flex flex-col gap-6 text-lg leading-7 text-on-surface-variant" data-animate="fade-up">
            <p>
              Nestled in the heart of Pretoria, South Africa, Dadda&apos;s Confectionery is more than just a bakery. It
              is a celebration of life&apos;s sweetest moments. Established with a profound passion for culinary
              artistry, we have dedicated ourselves to crafting baked goods that are as visually stunning as they are
              delicious.
            </p>
            <p>
              Our journey began with a simple belief: that every cake, pastry, and treat should tell a story of joy.
              From humble beginnings to becoming a premier destination for bespoke confectionery, our roots remain
              deeply intertwined with the community we serve and the cherished traditions of artisanal baking.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-cream-surface py-section-gap">
        <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-gutter px-margin-mobile md:grid-cols-12 lg:px-margin-desktop">
          <div className="order-2 flex flex-col gap-6 md:col-span-5 md:col-start-2 md:order-1" data-animate="fade-left">
            <h3 className="font-display text-2xl font-semibold leading-8 text-chocolate-text">The Artisanal Approach</h3>
            <p className="text-base leading-6 text-on-surface-variant">
              We believe that true flavor lies in the details. Every creation that leaves our kitchen is a testament to
              our unwavering commitment to the craft. We source only the finest, freshest ingredients, ensuring that
              every bite delivers an authentic, unforgettable taste.
            </p>
            <p className="text-base leading-6 text-on-surface-variant">
              There are no shortcuts in our process. From the meticulous folding of batter to the delicate piping of
              buttercream, our skilled artisans pour their heart and soul into every batch. It is this dedication to
              handmade excellence that elevates our treats from mere desserts to memorable experiences.
            </p>
            <div className="mt-4">
              <LazyImage
                src="/stitch/about-whisk.jpg"
                alt="Minimalist line art of a whisk and bowl"
                width={48}
                height={48}
                className="h-12 w-12 object-contain opacity-60"
              />
            </div>
          </div>
          <div className="order-1 md:col-span-6 md:col-start-7 md:order-2" data-animate="fade-right">
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-xl">
              <LazyImage
                src="/stitch/about-craft.jpg"
                alt="Close-up of hands kneading dough on a flour-dusted wooden table"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-dadda-primary/10 mix-blend-overlay" />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface py-section-gap">
        <div className="mx-auto flex max-w-container-max flex-col gap-16 px-margin-mobile lg:px-margin-desktop">
          <h2 className="text-center font-display text-[32px] font-semibold leading-10 text-chocolate-text" data-animate="fade-up">
            Our Philosophy
          </h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3" data-stagger>
            {philosophy.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-8 text-center shadow-sm hover:shadow-md"
                  data-stagger-item
                >
                  <div className={`mb-2 flex h-16 w-16 items-center justify-center rounded-full ${pillar.iconWrap}`}>
                    <Icon className={`h-8 w-8 ${pillar.iconClass}`} />
                  </div>
                  <h4 className="font-display text-xl font-semibold text-chocolate-text">{pillar.title}</h4>
                  <p className="text-base leading-6 text-on-surface-variant">{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <ParallaxCta
        src="/images/cake-croissants.webp"
        alt="Mini chocolate layer cake and golden croissants on a wooden table"
        headline="Handmade, from our table to yours."
        body="Layer cakes, pastries, and the slow craft of a family bakery. Taste the difference an order makes."
        ctaLabel="Start Your Order"
        ctaHref="/order"
        secondaryLabel="WhatsApp Us"
        secondaryHref="https://wa.me/27762196675"
        variant="band"
        align="right"
        objectPosition="left center"
      />
      <SeoFaq path="/about" />
    </div>
  )
}
