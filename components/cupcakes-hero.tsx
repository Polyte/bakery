"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

export default function CupcakesHero() {
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
      className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden md:h-[80vh]"
      aria-label="Cupcakes"
    >
      <div ref={mediaRef} className="absolute inset-x-0 -top-[20%] z-0 h-[140%] w-full will-change-transform">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/videos/cupcakes-blue.mp4"
          poster="/videos/cupcakes-blue.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-label="Blue-frosted cupcakes rotating from above"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#fff8ef] via-[#fff8ef]/45 to-[#2D241E]/40" />

      <div className="relative z-10 mx-auto mt-20 max-w-container-max px-margin-mobile text-center lg:px-margin-desktop">
        <div className="mb-6 flex items-center justify-center gap-4" data-animate="fade-up">
          <span className="h-px w-12 bg-dadda-primary" />
          <span className="text-[12px] font-medium uppercase tracking-widest text-dadda-primary">
            Baked in Pretoria
          </span>
          <span className="h-px w-12 bg-dadda-primary" />
        </div>
        <h1
          className="mx-auto max-w-4xl font-display text-[28px] font-bold leading-9 tracking-tight text-chocolate-text drop-shadow-sm md:text-[48px] md:leading-[56px] md:tracking-[-0.02em]"
          data-animate="fade-up"
        >
          Cupcakes in Pretoria
          <span className="block font-light italic text-on-surface-variant">Little cakes, finished by hand</span>
        </h1>
      </div>
    </section>
  )
}
