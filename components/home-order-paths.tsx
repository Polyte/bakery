import Link from "next/link"
import { Cake, MessageCircle, NotebookPen } from "lucide-react"
import { SITE } from "@/lib/seo"

const paths = [
  {
    title: "Shop cakes & treats",
    copy: "Wedding, birthday, and children's cakes, plus cupcakes and scones with prices in Rand.",
    href: "/cakes",
    label: "Browse cakes",
    icon: Cake,
    external: false,
  },
  {
    title: "WhatsApp the kitchen",
    copy: "Dates, flavours, and Pretoria orders that will not wait. We reply from Amandasig.",
    href: SITE.whatsapp,
    label: SITE.phoneDisplay,
    icon: MessageCircle,
    external: true,
  },
  {
    title: "Request a quote",
    copy: "Tell us the date, guest count, and the cake you have in mind. Pickup from Villa Lanta Estate.",
    href: "/order",
    label: "Start a quote",
    icon: NotebookPen,
    external: false,
  },
] as const

export default function HomeOrderPaths() {
  return (
    <section className="w-full bg-cream-surface py-section-gap" aria-labelledby="how-to-order">
      <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div className="mx-auto mb-12 max-w-2xl text-center" data-animate="fade-up">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-dadda-primary">
            Pretoria bakery
          </span>
          <h2 id="how-to-order" className="section-title mb-4">
            How to order
          </h2>
          <p className="text-base text-on-surface-variant">
            Shop online, WhatsApp {SITE.phoneDisplay}, or send a quote. Everything is baked to order in Amandasig.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3" data-stagger>
          {paths.map((path) => {
            const Icon = path.icon
            const className =
              "group flex h-full flex-col rounded-3xl border border-outline-variant/30 bg-surface p-8 shadow-sm hover:shadow-pastry"
            const inner = (
              <>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-dadda-primary/10 text-dadda-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mb-2 font-display text-2xl font-semibold text-chocolate-text">{path.title}</h3>
                <p className="mb-6 flex-1 text-sm leading-6 text-on-surface-variant">{path.copy}</p>
                <span className="text-xs font-semibold uppercase tracking-wider text-dadda-primary group-hover:text-primary-container">
                  {path.label}
                </span>
              </>
            )

            return path.external ? (
              <a key={path.title} href={path.href} className={className} data-stagger-item>
                {inner}
              </a>
            ) : (
              <Link key={path.title} href={path.href} prefetch className={className} data-stagger-item>
                {inner}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
