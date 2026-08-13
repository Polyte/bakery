"use client"

import { useId, useRef } from "react"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"

const BLOBS = [
  { cx: 280, cy: 260, rx: 340, ry: 280, fill: "#3d2918" },
  { cx: 980, cy: 200, rx: 380, ry: 260, fill: "#7d562d" },
  { cx: 720, cy: 520, rx: 420, ry: 300, fill: "#5c3d24" },
  { cx: 160, cy: 620, rx: 280, ry: 240, fill: "#1a120c" },
  { cx: 1280, cy: 560, rx: 300, ry: 280, fill: "#6b4928" },
  { cx: 760, cy: 80, rx: 240, ry: 180, fill: "#8a6434" },
]

export default function FooterDrip() {
  const scopeRef = useRef<HTMLDivElement>(null)
  const rawId = useId().replace(/:/g, "")
  const gooId = `footer-choc-goo-${rawId}`
  const glossId = `footer-choc-gloss-${rawId}`

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".footer-choc-blob", {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          autoAlpha: 1,
        })
        gsap.set(".footer-choc-swirl-a, .footer-choc-swirl-b", { rotation: 0 })
        gsap.set(".footer-choc-sheen", { xPercent: 0, autoAlpha: 0.14 })
      })

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tweens: gsap.core.Tween[] = []
        const blobs = gsap.utils.toArray<SVGElement>(".footer-choc-blob")
        blobs.forEach((blob, i) => {
          const dir = i % 2 === 0 ? 1 : -1
          tweens.push(
            gsap.fromTo(
              blob,
              {
                x: -22 * dir,
                y: 14 * dir,
                scaleX: 0.9,
                scaleY: 1.08,
                rotation: -7 * dir,
              },
              {
                x: 26 * dir,
                y: -18 * dir,
                scaleX: 1.12,
                scaleY: 0.9,
                rotation: 9 * dir,
                duration: 10 + i * 1.7,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                transformOrigin: "50% 50%",
              },
            ),
          )
        })

        tweens.push(
          gsap.fromTo(
            ".footer-choc-swirl-a",
            { rotation: 0 },
            { rotation: 360, duration: 52, ease: "none", repeat: -1 },
          ),
          gsap.fromTo(
            ".footer-choc-swirl-b",
            { rotation: 0 },
            { rotation: -360, duration: 78, ease: "none", repeat: -1 },
          ),
          gsap.fromTo(
            ".footer-choc-sheen",
            { xPercent: -80, autoAlpha: 0.08 },
            {
              xPercent: 90,
              autoAlpha: 0.2,
              duration: 16,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            },
          ),
        )

        ScrollTrigger.create({
          trigger: scopeRef.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            tweens.forEach((tween) => (self.isActive ? tween.play() : tween.pause()))
          },
        })
      })

      return () => mm.revert()
    },
    { scope: scopeRef },
  )

  return (
    <div
      ref={scopeRef}
      className="footer-drip-layer pointer-events-none absolute inset-0 z-[1] overflow-hidden contain-paint"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-[230%] w-[230%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="footer-choc-swirl-a h-full w-full opacity-[0.55] blur-3xl"
          style={{
            background:
              "conic-gradient(from 120deg, #1a120c 0deg, #2D241E 48deg, #5c3d24 96deg, #7d562d 148deg, #3d2918 198deg, #4a301c 248deg, #6b4928 300deg, #2D241E 336deg, #1a120c 360deg)",
          }}
        />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2">
        <div
          className="footer-choc-swirl-b h-full w-full opacity-40 blur-3xl"
          style={{
            background:
              "conic-gradient(from 280deg, #2D241E 0deg, #7d562d 70deg, #1a120c 140deg, #5c3d24 210deg, #3d2918 280deg, #2D241E 360deg)",
          }}
        />
      </div>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <filter id={gooId} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
          </filter>
          <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e8c9a0" stopOpacity="0.18" />
            <stop offset="42%" stopColor="#7d562d" stopOpacity="0" />
            <stop offset="100%" stopColor="#1a120c" stopOpacity="0.28" />
          </linearGradient>
        </defs>
        <g filter={`url(#${gooId})`}>
          {BLOBS.map((blob, i) => (
            <ellipse
              key={i}
              className="footer-choc-blob"
              cx={blob.cx}
              cy={blob.cy}
              rx={blob.rx}
              ry={blob.ry}
              fill={blob.fill}
            />
          ))}
        </g>
        <rect width="1440" height="800" fill={`url(#${glossId})`} />
      </svg>

      <div className="absolute inset-0 overflow-hidden">
        <div className="footer-choc-sheen absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-transparent via-[#e8c9a0]/12 to-transparent" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#1a120c_100%)] opacity-55" />
      <div className="absolute inset-0 bg-[#2D241E]/40" />
    </div>
  )
}
