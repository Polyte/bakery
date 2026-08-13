"use client"

import { useRef } from "react"
import Link from "next/link"
import { Croissant } from "lucide-react"
import { gsap, useGSAP } from "@/lib/gsap"

export default function TreatsHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const media = mediaRef.current
      const video = videoRef.current
      if (!section || !media) return

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (!video) return
        video.pause()
        video.removeAttribute("autoplay")
        video.currentTime = 0
      })

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        video?.play().catch(() => {})

        gsap.fromTo(
          media,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
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

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[80vh] min-h-[560px] w-full items-center overflow-hidden md:h-[85vh]"
      aria-label="Scones and treats"
    >
      <div ref={mediaRef} className="absolute inset-x-0 -top-[20%] z-0 h-[140%] w-full will-change-transform">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/videos/sweet-pastries.mp4"
          poster="/videos/sweet-pastries.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-label="Sweet pastries displayed in a cafe"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(255,248,239,0.18)_0%,rgba(45,36,30,0.35)_45%,rgba(45,36,30,0.82)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div className="flex max-w-2xl flex-col items-start pt-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 shadow-sm backdrop-blur-sm">
            <Croissant className="h-[18px] w-[18px] text-white" />
            <span className="text-xs font-medium uppercase tracking-widest text-white">Morning rituals · Pretoria</span>
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-white drop-shadow-md lg:text-[64px] lg:leading-[72px]">
            Scones &amp;
            <br />
            <span className="font-normal italic">sweet treats</span>
          </h1>
          <p className="mb-10 max-w-lg text-lg leading-7 text-white/90 drop-shadow">
            Buttery scones, croissants, and tarts baked in Amandasig the morning you collect. Add a box to the cart, or
            pair them with cupcakes and Popsticles.
          </p>
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <Link
              href="#scones-menu"
              className="w-full rounded-full bg-[#7d562d] px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-on-primary shadow-lg hover:bg-[#623f18] sm:w-auto"
            >
              Shop scones
            </Link>
            <a
              href="https://wa.me/27762196675"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full border border-white/50 bg-white/10 px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
