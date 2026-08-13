"use client"

import { useRef, useState } from "react"
import { gsap, useGSAP } from "@/lib/gsap"
import { markIntroComplete } from "@/lib/intro"
import LazyImage from "./lazy-image"

export default function Preloader() {
  const container = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useGSAP(
    () => {
      if (!container.current) return

      document.body.style.overflow = "hidden"
      let finished = false

      const finish = () => {
        if (finished) return
        finished = true
        document.body.style.overflow = ""
        markIntroComplete()
        setIsVisible(false)
      }

      const failsafe = window.setTimeout(finish, 600)
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(container.current, { autoAlpha: 0 })
        finish()
      })

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: finish,
        })

        tl.fromTo(".preloader-logo", { scale: 0.72, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: "back.out(1.4)" })
          .fromTo(".preloader-dot", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.4 }, "-=0.25")
          .fromTo(".preloader-text", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, "<")
          .to(".preloader-logo", { scale: 1.06, duration: 0.5, ease: "power1.inOut", yoyo: true, repeat: 1 }, "+=0.15")
          .to(container.current, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" }, "+=0.15")
      })

      return () => {
        window.clearTimeout(failsafe)
        document.body.style.overflow = ""
        mm.revert()
      }
    },
    { scope: container },
  )

  if (!isVisible) return null

  return (
    <div
      ref={container}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      aria-hidden="true"
    >
      <div className="text-center">
        <div className="preloader-logo relative mx-auto mb-6 h-32 w-32">
          <LazyImage
            src="/images/dadda-logo.png"
            alt="Dadda's Confectionery"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="preloader-dot h-3 w-3 rounded-full bg-dadda-red" />
          <div className="preloader-dot h-3 w-3 rounded-full bg-dadda-red" />
          <div className="preloader-dot h-3 w-3 rounded-full bg-dadda-red" />
        </div>
        <p className="preloader-text mt-4 font-medium text-dadda-primary">
          Loading with <span style={{ color: "red" }}>Love....</span>
        </p>
      </div>
    </div>
  )
}
