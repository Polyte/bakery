"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Cake, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { gsap, useGSAP } from "@/lib/gsap"

const IMAGE_DWELL_MS = 7000

const heroSlides = [
  {
    type: "video" as const,
    src: "/videos/cookies-cream-spin.mp4",
    label: "Cookies and cream cake spinning on a stand",
    badge: "Handmade Daily",
    title: "Custom cakes in Pretoria.",
    italic: "Baked with love.",
    desc: "Wedding cakes, birthday cakes, and cupcakes baked from scratch in Amandasig. Order online or WhatsApp the Pretoria kitchen.",
    primary: { href: "/order", label: "Order a Celebration Cake" },
    secondary: { href: "/cakes", label: "Browse Custom Cakes" },
  },
  {
    type: "video" as const,
    src: "/videos/cupcakes-blue.mp4",
    label: "Blue-frosted cupcakes rotating from above",
    badge: "Cupcakes",
    title: "Little cakes.",
    italic: "Big blueberry swirls.",
    desc: "Vanilla sponge piled with blueberry cream, spun slowly from above. Baked in Pretoria for birthdays, lunchboxes, and the days that need a treat.",
    primary: { href: "/treats/cupcakes", label: "Order Now" },
    secondary: { href: "/treats", label: "See Our Treats" },
  },
  {
    type: "video" as const,
    src: "/videos/cake-slice.mp4",
    label: "Decorative cake slice",
    badge: "Bespoke Cakes",
    title: "Custom cakes,",
    italic: "made to delight.",
    desc: "From the first sketch to the last swirl of frosting, we design cakes that taste as beautiful as they look.",
    primary: { href: "/order", label: "Design Your Cake" },
    secondary: { href: "/cakes", label: "See Our Cakes" },
  },
  {
    type: "image" as const,
    src: "/videos/cake-slices.jpg",
    label: "Colorful cake slices on a plate",
    badge: "Mixed Flavours",
    title: "A slice of everything.",
    italic: "One happy table.",
    desc: "Vanilla, chocolate, red velvet and more — colourful slices for sharing, tasting, and treating a crowd.",
    primary: { href: "/order", label: "Order Mixed Slices" },
    secondary: { href: "/treats", label: "Explore Our Treats" },
  },
  {
    type: "image" as const,
    src: "/videos/pancakes.jpg",
    label: "Stack of chocolate pancakes with cherries",
    badge: "Brunch & Treats",
    title: "Slow mornings.",
    italic: "Extra cherries.",
    desc: "Stacks, scones, and homemade treats baked fresh for brunch tables and weekday pick-me-ups.",
    primary: { href: "/order", label: "Order Treats" },
    secondary: { href: "/treats", label: "See Our Treats" },
  },
]

type SlideEl = HTMLVideoElement | HTMLImageElement

export default function HomeHero() {
  const container = useRef<HTMLElement>(null)
  const indexRef = useRef(0)
  const transitioningRef = useRef(false)
  const autoPlayRef = useRef(true)
  const goToRef = useRef<(next: number) => void>(() => {})
  const dwellTimerRef = useRef<number | null>(null)
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useGSAP(
    (_context, contextSafe) => {
      const slides = gsap.utils.toArray<SlideEl>(".hero-slide")
      if (!slides.length) return

      const clearDwell = () => {
        if (dwellTimerRef.current !== null) {
          window.clearTimeout(dwellTimerRef.current)
          dwellTimerRef.current = null
        }
      }

      const playClip = (el: SlideEl) => {
        if (!(el instanceof HTMLVideoElement)) return
        el.currentTime = 0
        const playPromise = el.play()
        if (playPromise) playPromise.catch(() => {})
      }

      const scheduleImageAdvance = contextSafe((fromIndex: number) => {
        clearDwell()
        if (!autoPlayRef.current) return
        if (heroSlides[fromIndex]?.type !== "image") return
        dwellTimerRef.current = window.setTimeout(() => {
          if (!autoPlayRef.current || transitioningRef.current) return
          if (indexRef.current !== fromIndex) return
          goToRef.current((fromIndex + 1) % slides.length)
        }, IMAGE_DWELL_MS)
      })

      gsap.set(slides, { autoAlpha: 0, scale: 1.06 })
      gsap.set(slides[0], { autoAlpha: 1, scale: 1 })
      playClip(slides[0])

      const crossfadeTo = contextSafe((next: number) => {
        const currentIndex = indexRef.current
        if (next === currentIndex || transitioningRef.current) return

        transitioningRef.current = true
        clearDwell()
        const outgoing = slides[currentIndex]
        const incoming = slides[next]
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        playClip(incoming)
        indexRef.current = next
        setCurrent(next)

        const finish = () => {
          if (outgoing instanceof HTMLVideoElement) outgoing.pause()
          transitioningRef.current = false
          scheduleImageAdvance(next)
        }

        if (reduceMotion) {
          gsap.set(outgoing, { autoAlpha: 0, scale: 1 })
          gsap.set(incoming, { autoAlpha: 1, scale: 1 })
          finish()
          return
        }

        gsap
          .timeline({
            defaults: { ease: "power2.inOut", duration: 1.25 },
            onComplete: finish,
          })
          .to(outgoing, { autoAlpha: 0, scale: 1.08 }, 0)
          .fromTo(incoming, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1 }, 0)
      })

      goToRef.current = crossfadeTo
      scheduleImageAdvance(0)

      const onTimeUpdate = (event: Event) => {
        const video = event.currentTarget as HTMLVideoElement
        const i = slides.indexOf(video)
        if (i !== indexRef.current || transitioningRef.current || !autoPlayRef.current) return
        if (!video.duration || Number.isNaN(video.duration)) return
        if (video.duration - video.currentTime > 1.2) return
        crossfadeTo((indexRef.current + 1) % slides.length)
      }

      const onEnded = (event: Event) => {
        const video = event.currentTarget as HTMLVideoElement
        const i = slides.indexOf(video)
        if (i !== indexRef.current || transitioningRef.current || !autoPlayRef.current) return
        crossfadeTo((indexRef.current + 1) % slides.length)
      }

      slides.forEach((el) => {
        if (el instanceof HTMLVideoElement) {
          el.addEventListener("timeupdate", onTimeUpdate)
          el.addEventListener("ended", onEnded)
        }
      })

      return () => {
        clearDwell()
        slides.forEach((el) => {
          if (el instanceof HTMLVideoElement) {
            el.removeEventListener("timeupdate", onTimeUpdate)
            el.removeEventListener("ended", onEnded)
            el.pause()
          }
        })
      }
    },
    { scope: container },
  )

  useGSAP(
    () => {
      gsap.set(".hero-copy-slide > *", { autoAlpha: 1, y: 0, scale: 1 })
    },
    { scope: container, dependencies: [current] },
  )

  const goTo = (next: number) => {
    goToRef.current((next + heroSlides.length) % heroSlides.length)
  }

  const toggleAutoPlay = () => {
    const next = !autoPlayRef.current
    autoPlayRef.current = next
    setIsAutoPlaying(next)
    const slides = container.current?.querySelectorAll<SlideEl>(".hero-slide")
    const active = slides?.[indexRef.current]
    if (!active) return

    if (dwellTimerRef.current !== null) {
      window.clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = null
    }

    if (next) {
      if (active instanceof HTMLVideoElement) {
        active.play().catch(() => {})
      } else {
        dwellTimerRef.current = window.setTimeout(() => {
          if (!autoPlayRef.current || transitioningRef.current) return
          goToRef.current((indexRef.current + 1) % heroSlides.length)
        }, IMAGE_DWELL_MS)
      }
    } else if (active instanceof HTMLVideoElement) {
      active.pause()
    }
  }

  const activeSlide = heroSlides[current]

  return (
    <section
      ref={container}
      className="relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Hero carousel"
    >
      <div className="absolute inset-0 z-0 bg-chocolate-text">
        {heroSlides.map((slide, index) =>
          slide.type === "video" ? (
            <video
              key={slide.src}
              className={`hero-slide absolute inset-0 h-full w-full object-cover will-change-[opacity,transform] ${
                index === 0 ? "" : "opacity-0"
              }`}
              src={slide.src}
              muted
              playsInline
              autoPlay={index === 0}
              preload={index === 0 ? "auto" : "metadata"}
              aria-label={slide.label}
              aria-hidden={index !== current}
            />
          ) : (
            <img
              key={slide.src}
              className={`hero-slide absolute inset-0 h-full w-full object-cover will-change-[opacity,transform] ${
                index === 0 ? "" : "opacity-0"
              }`}
              src={slide.src}
              alt={slide.label}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              aria-hidden={index !== current}
            />
          ),
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div
          className="hero-copy relative flex min-h-[28rem] max-w-2xl flex-col items-start pt-20 lg:min-h-[32rem]"
          aria-live="polite"
        >
          <div key={activeSlide.src} className="hero-copy-slide flex w-full max-w-2xl flex-col items-start">
            <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 shadow-sm backdrop-blur-sm">
              <Cake className="h-[18px] w-[18px] text-white" />
              <span className="text-xs font-medium uppercase tracking-widest text-white">{activeSlide.badge}</span>
            </div>
            {current === 0 ? (
              <h1 className="hero-title mb-6 font-display text-5xl font-bold leading-tight text-white drop-shadow-md lg:text-[64px] lg:leading-[72px]">
                {activeSlide.title}
                <br />
                <span className="font-normal italic">{activeSlide.italic}</span>
              </h1>
            ) : (
              <p className="hero-title mb-6 font-display text-5xl font-bold leading-tight text-white drop-shadow-md lg:text-[64px] lg:leading-[72px]">
                {activeSlide.title}
                <br />
                <span className="font-normal italic">{activeSlide.italic}</span>
              </p>
            )}
            <p className="hero-desc mb-10 max-w-lg text-lg leading-7 text-white/90 drop-shadow">{activeSlide.desc}</p>
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <Link
                href={activeSlide.primary.href}
                prefetch
                className="hero-cta w-full rounded-full bg-dadda-primary px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-on-primary shadow-lg hover:bg-primary-container hover:text-on-primary-container sm:w-auto"
              >
                {activeSlide.primary.label}
              </Link>
              <Link
                href={activeSlide.secondary.href}
                prefetch
                className="hero-cta w-full rounded-full border border-white/50 bg-white/10 px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
              >
                {activeSlide.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => goTo(current - 1)}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/15 p-3 text-white backdrop-blur-md hover:bg-dadda-primary/80 md:left-6 md:p-4"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
      </button>
      <button
        type="button"
        onClick={() => goTo(current + 1)}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/15 p-3 text-white backdrop-blur-md hover:bg-dadda-primary/80 md:right-6 md:p-4"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <div className="flex items-center gap-3">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(index)}
              className={`rounded-full border-2 transition-all ${
                index === current
                  ? "h-3.5 w-8 border-white bg-dadda-primary"
                  : "h-3.5 w-3.5 border-white/50 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}: ${slide.label}`}
              aria-current={index === current ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={toggleAutoPlay}
          className="rounded-full border border-white/30 bg-white/15 p-2.5 text-white backdrop-blur-md hover:bg-dadda-primary/80"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </section>
  )
}
