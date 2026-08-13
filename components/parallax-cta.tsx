"use client"

import { useRef } from "react"
import Link from "next/link"
import LazyImage from "@/components/lazy-image"
import { gsap, useGSAP } from "@/lib/gsap"

type Align = "center" | "left" | "right"

type ParallaxCtaProps = {
  src: string
  alt: string
  headline: string
  body: string
  ctaLabel?: string
  ctaHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  variant?: "header" | "band"
  align?: Align
  objectPosition?: string
  headingAs?: "h1" | "h2"
  priority?: boolean
}

export default function ParallaxCta({
  src,
  alt,
  headline,
  body,
  ctaLabel = "Order Now",
  ctaHref = "/order",
  secondaryLabel,
  secondaryHref,
  variant = "band",
  align = "center",
  objectPosition = "center",
  headingAs = "h2",
  priority = false,
}: ParallaxCtaProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const Heading = headingAs

  useGSAP(
    () => {
      const img = imgRef.current
      const section = sectionRef.current
      if (!img || !section) return

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(img, { yPercent: 0 })
      })

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          img,
          { yPercent: -14 },
          {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        )
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  const heightClass =
    variant === "header" ? "min-h-[55vh] md:min-h-[68vh]" : "min-h-[42vh] md:min-h-[52vh]"

  const alignClass = {
    center: "items-center text-center mx-auto",
    left: "items-start text-left mr-auto",
    right: "items-start text-left md:items-end md:text-right md:ml-auto md:mr-0",
  }[align]

  const overlayClass =
    variant === "header"
      ? "bg-[linear-gradient(to_bottom,rgba(255,248,239,0.72)_0%,rgba(45,36,30,0.32)_42%,rgba(45,36,30,0.82)_100%)]"
      : align === "right"
        ? "bg-gradient-to-l from-[#2D241E]/85 via-[#2D241E]/45 to-[#fff8ef]/10"
        : align === "left"
          ? "bg-gradient-to-r from-[#2D241E]/85 via-[#2D241E]/45 to-[#fff8ef]/10"
          : "bg-gradient-to-t from-[#2D241E]/85 via-[#2D241E]/40 to-[#fff8ef]/15"

  return (
    <section
      ref={sectionRef}
      className={`relative flex w-full overflow-hidden ${heightClass} ${variant === "header" ? "pt-24 md:pt-28" : ""}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div ref={imgRef} className="absolute inset-[-18%] will-change-transform">
          <LazyImage
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
            objectPosition={objectPosition}
          />
        </div>
      </div>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />

      <div className="relative z-10 mx-auto flex w-full max-w-container-max flex-col justify-center px-margin-mobile py-16 lg:px-margin-desktop">
        <div className={`flex max-w-2xl flex-col gap-5 ${alignClass}`} data-animate="fade-up">
          <Heading className="font-display text-[28px] font-bold leading-9 tracking-tight text-[#fff8ef] drop-shadow-sm md:text-[48px] md:leading-[56px]">
            {headline}
          </Heading>
          <p className="max-w-xl font-sans text-base leading-7 text-[#fff8ef]/90 md:text-lg">{body}</p>
          <div
            className={`mt-2 flex flex-col gap-3 sm:flex-row ${
              align === "center"
                ? "justify-center"
                : align === "right"
                  ? "sm:justify-end"
                  : "sm:justify-start"
            }`}
          >
            <CtaLink href={ctaHref} className="btn-primary inline-flex justify-center bg-[#7d562d] hover:bg-[#623f18]">
              {ctaLabel}
            </CtaLink>
            {secondaryLabel && secondaryHref ? (
              <CtaLink href={secondaryHref} className="btn-secondary inline-flex justify-center">
                {secondaryLabel}
              </CtaLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaLink({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) {
  const external = href.startsWith("http")
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return (
    <Link href={href} prefetch className={className}>
      {children}
    </Link>
  )
}
