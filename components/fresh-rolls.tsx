"use client"

import { useRef } from "react"
import Link from "next/link"
import LazyImage from "@/components/lazy-image"
import { gsap, useGSAP } from "@/lib/gsap"

export default function FreshRolls() {
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

  return (
    <section
      ref={sectionRef}
      id="fresh-rolls"
      className="relative flex min-h-[50vh] w-full items-center justify-center overflow-hidden md:min-h-[62vh]"
      aria-label="Freshly baked rolls and scones"
    >
      <div ref={mediaRef} className="absolute inset-x-0 -top-[20%] z-0 h-[140%] w-full will-change-transform">
        <div className="absolute inset-0">
          <LazyImage src="/videos/fresh-rolls.jpg" alt="" fill className="object-cover" sizes="100vw" />
        </div>
        <video
          ref={videoRef}
          className="h-full w-full object-cover motion-reduce:hidden"
          src="/videos/fresh-rolls.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label="Freshly baked rolls on a rustic wooden table"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#2D241E]/75 via-[#2D241E]/35 to-black/20" />

      <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile py-16 text-center lg:px-margin-desktop">
        <div className="mb-6 flex items-center justify-center gap-4" data-animate="fade-up">
          <span className="h-px w-12 bg-[#7d562d]" />
          <span className="font-sans text-[12px] font-medium uppercase tracking-widest text-[#7d562d]">
            Fresh from the oven
          </span>
          <span className="h-px w-12 bg-[#7d562d]" />
        </div>
        <h2
          className="mx-auto mb-4 max-w-3xl font-display text-[28px] font-bold leading-9 tracking-tight text-white drop-shadow-sm md:text-[48px] md:leading-[56px] md:tracking-[-0.02em]"
          data-animate="fade-up"
        >
          Freshly baked rolls
          <span className="mt-1 block font-light italic text-white/80">Scones, still warm</span>
        </h2>
        <p
          className="mx-auto mb-8 max-w-xl font-sans text-base leading-6 text-white/85 md:text-lg md:leading-7"
          data-animate="fade-up"
        >
          Golden crusts and a tender crumb, pulled from the Pretoria oven every morning. Pair a buttery scone with
          clotted cream, or take a bag of rolls still warm from the tray.
        </p>
        <div data-animate="fade-up">
          <Link
            href="#scones-menu"
            className="inline-flex rounded-full bg-[#7d562d] px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-widest text-white shadow-md hover:bg-[#623f18]"
          >
            Order scones
          </Link>
        </div>
      </div>
    </section>
  )
}
