"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Cake, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { gsap, useGSAP } from "@/lib/gsap"
import { onIntroComplete } from "@/lib/intro"
import type { CakeHeroSlide } from "@/lib/cakes"

type CakesHeroProps = {
  slides: CakeHeroSlide[]
  eyebrow: string
  title: string
  italic?: string
  description: string
  ctaLabel?: string
  ctaHref?: string
  ariaLabel?: string
}

export default function CakesHero({
  slides,
  eyebrow,
  title,
  italic,
  description,
  ctaLabel = "Order Your Cake",
  ctaHref = "/order",
  ariaLabel = "Cakes hero",
}: CakesHeroProps) {
  const container = useRef<HTMLElement>(null)
  const indexRef = useRef(0)
  const transitioningRef = useRef(false)
  const autoPlayRef = useRef(true)
  const goToRef = useRef<(next: number) => void>(() => {})
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const many = slides.length > 1

  useGSAP(
    (_context, contextSafe) => {
      const slideEls = gsap.utils.toArray<HTMLVideoElement>(".cakes-hero-slide")
      if (!slideEls.length) return

      let reduceMotion = false
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: reduce)", () => {
        reduceMotion = true
      })
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        reduceMotion = false
      })

      const playClip = (el: HTMLVideoElement) => {
        el.currentTime = 0
        const playPromise = el.play()
        if (playPromise) playPromise.catch(() => {})
      }

      gsap.set(slideEls, { autoAlpha: 0, scale: reduceMotion ? 1 : 1.06 })
      gsap.set(slideEls[0], { autoAlpha: 1, scale: 1 })
      playClip(slideEls[0])

      const crossfadeTo = contextSafe((next: number) => {
        const currentIndex = indexRef.current
        if (next === currentIndex || transitioningRef.current || slideEls.length < 2) return

        transitioningRef.current = true
        const outgoing = slideEls[currentIndex]
        const incoming = slideEls[next]

        playClip(incoming)

        const finish = () => {
          outgoing.pause()
          indexRef.current = next
          setCurrent(next)
          transitioningRef.current = false
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

      const onTimeUpdate = (event: Event) => {
        if (slideEls.length < 2) return
        const video = event.currentTarget as HTMLVideoElement
        const i = slideEls.indexOf(video)
        if (i !== indexRef.current || transitioningRef.current || !autoPlayRef.current) return
        if (!video.duration || Number.isNaN(video.duration)) return
        if (video.duration - video.currentTime > 1.2) return
        crossfadeTo((indexRef.current + 1) % slideEls.length)
      }

      slideEls.forEach((el) => el.addEventListener("timeupdate", onTimeUpdate))

      return () => {
        mm.revert()
        slideEls.forEach((el) => {
          el.removeEventListener("timeupdate", onTimeUpdate)
          el.pause()
        })
      }
    },
    { scope: container, dependencies: [slides.map((s) => s.src).join("|")], revertOnUpdate: true },
  )

  useGSAP(
    (_context, contextSafe) => {
      const mm = gsap.matchMedia()

      const play = contextSafe(() => {
        gsap.set(".cakes-hero-copy > *", { autoAlpha: 1, y: 0, scale: 1 })
      })

      const stopIntro = onIntroComplete(play)
      return () => {
        stopIntro()
        mm.revert()
      }
    },
    { scope: container },
  )

  const goTo = (next: number) => {
    if (!many) return
    goToRef.current((next + slides.length) % slides.length)
  }

  const toggleAutoPlay = () => {
    const next = !autoPlayRef.current
    autoPlayRef.current = next
    setIsAutoPlaying(next)
    const slideEls = container.current?.querySelectorAll<HTMLVideoElement>(".cakes-hero-slide")
    const active = slideEls?.[indexRef.current]
    if (!active) return
    if (next) {
      active.play().catch(() => {})
    } else {
      active.pause()
    }
  }

  return (
    <section
      ref={container}
      className="relative flex h-[80vh] min-h-[560px] w-full items-center justify-center overflow-hidden md:h-[85vh]"
      aria-roledescription={many ? "carousel" : undefined}
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0 z-0 bg-[#2D241E]">
        {slides.map((slide, index) => (
          <video
            key={slide.src}
            className="cakes-hero-slide absolute inset-0 h-full w-full object-cover"
            src={slide.src}
            poster={slide.poster}
            muted
            playsInline
            loop={!many}
            autoPlay={index === 0}
            preload={index === 0 ? "auto" : "metadata"}
            aria-label={slide.label}
            aria-hidden={index !== current}
            style={{ opacity: index === 0 ? 1 : 0 }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,248,239,0.18)_0%,rgba(45,36,30,0.35)_45%,rgba(45,36,30,0.82)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div className="cakes-hero-copy flex max-w-2xl flex-col items-start pt-20">
          <div className="cakes-hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 shadow-sm backdrop-blur-sm">
            <Cake className="h-[18px] w-[18px] text-white" />
            <span className="text-xs font-medium uppercase tracking-widest text-white">{eyebrow}</span>
          </div>
          <h1 className="cakes-hero-title mb-6 font-display text-5xl font-bold leading-tight text-white drop-shadow-md lg:text-[64px] lg:leading-[72px]">
            {title}
            {italic ? (
              <>
                <br />
                <span className="font-normal italic">{italic}</span>
              </>
            ) : null}
          </h1>
          <p className="cakes-hero-desc mb-10 max-w-lg text-lg leading-7 text-white/90 drop-shadow">{description}</p>
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <Link
              href={ctaHref}
              prefetch
              className="cakes-hero-cta w-full rounded-full bg-[#7d562d] px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-on-primary shadow-lg hover:bg-[#623f18] sm:w-auto"
            >
              {ctaLabel}
            </Link>
            <a
              href="https://wa.me/27762196675"
              target="_blank"
              rel="noopener noreferrer"
              className="cakes-hero-cta w-full rounded-full border border-white/50 bg-white/10 px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {many ? (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/15 p-3 text-white backdrop-blur-md hover:bg-[#7d562d]/80 md:left-6 md:p-4"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/15 p-3 text-white backdrop-blur-md hover:bg-[#7d562d]/80 md:right-6 md:p-4"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
            <div className="flex items-center gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`rounded-full border-2 transition-all ${
                    index === current
                      ? "h-3.5 w-8 border-white bg-[#7d562d]"
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
              className="rounded-full border border-white/30 bg-white/15 p-2.5 text-white backdrop-blur-md hover:bg-[#7d562d]/80"
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
