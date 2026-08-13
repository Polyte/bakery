"use client"

import { useId, useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

const DROPS = [
  { cx: 198, cy: 102, rx: 6.5, ry: 11 },
  { cx: 468, cy: 112, rx: 5.5, ry: 10 },
  { cx: 796, cy: 114, rx: 7.5, ry: 13 },
  { cx: 1156, cy: 104, rx: 6, ry: 10 },
]

export default function FooterDrip() {
  const scopeRef = useRef<HTMLDivElement>(null)
  const rawId = useId().replace(/:/g, "")
  const ganacheId = `footer-ganache-${rawId}`
  const glossId = `footer-drip-gloss-${rawId}`

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".footer-drip-layer", {
          y: 0,
          autoAlpha: 1,
          scaleY: 1,
          transformOrigin: "50% 0%",
        })
        gsap.set(".footer-drip-drop", { y: 0, autoAlpha: 1 })
      })

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".footer-drip-layer",
          { y: -12, autoAlpha: 0, scaleY: 0.72 },
          {
            y: 0,
            autoAlpha: 1,
            scaleY: 1,
            duration: 0.85,
            ease: "power2.out",
            transformOrigin: "50% 0%",
          },
        )

        gsap.fromTo(
          ".footer-drip-drop",
          { y: -6, autoAlpha: 0.65 },
          {
            y: 4,
            autoAlpha: 1,
            duration: 2.4,
            ease: "sine.inOut",
            stagger: 0.18,
            repeat: -1,
            yoyo: true,
            delay: 0.9,
            immediateRender: false,
          },
        )
      })

      return () => mm.revert()
    },
    { scope: scopeRef },
  )

  return (
    <div
      ref={scopeRef}
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="footer-drip-layer h-full w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id={ganacheId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D241E" />
            <stop offset="42%" stopColor="#3d2918" />
            <stop offset="100%" stopColor="#7d562d" />
          </linearGradient>
          <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8c9a0" stopOpacity="0.28" />
            <stop offset="48%" stopColor="#7d562d" stopOpacity="0" />
            <stop offset="100%" stopColor="#1a120c" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${ganacheId})`}
          d="M0 0H1440V26C1385 28 1368 78 1332 90C1298 101 1282 34 1244 38C1206 42 1192 86 1154 96C1118 105 1102 36 1064 40C1026 44 1012 74 974 82C938 90 922 30 884 34C846 38 832 100 794 110C758 119 742 44 704 48C666 52 652 80 614 88C578 96 562 32 524 36C486 40 472 92 434 104C398 115 382 42 344 46C306 50 292 76 254 84C218 92 202 28 164 32C126 36 108 70 72 78C40 85 18 30 0 32Z"
        />
        <path
          fill={`url(#${glossId})`}
          d="M0 0H1440V26C1385 28 1368 78 1332 90C1298 101 1282 34 1244 38C1206 42 1192 86 1154 96C1118 105 1102 36 1064 40C1026 44 1012 74 974 82C938 90 922 30 884 34C846 38 832 100 794 110C758 119 742 44 704 48C666 52 652 80 614 88C578 96 562 32 524 36C486 40 472 92 434 104C398 115 382 42 344 46C306 50 292 76 254 84C218 92 202 28 164 32C126 36 108 70 72 78C40 85 18 30 0 32Z"
        />
        {DROPS.map((drop, i) => (
          <ellipse
            key={i}
            className="footer-drip-drop"
            cx={drop.cx}
            cy={drop.cy}
            rx={drop.rx}
            ry={drop.ry}
            fill="#7d562d"
          />
        ))}
      </svg>
    </div>
  )
}
