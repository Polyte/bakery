"use client"

import { useRef } from "react"
import { gsap, useGSAP } from "@/lib/gsap"

const PALETTE = ["#E8C47A", "#F6E7C1", "#C9A56A", "#7d562d", "#D4A373", "#FDFBF7", "#E8A8A0"]

type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  color: string
  size: number
  drag: number
}

export default function OrderFireworks() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useGSAP(
    () => {
      const wrap = wrapRef.current
      const canvas = canvasRef.current
      if (!wrap || !canvas) return

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(wrap, { autoAlpha: 0 })
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const sparks: Spark[] = []
      let raf = 0
      let running = true
      let viewW = 0
      let viewH = 0
      const started = performance.now()

      const fit = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        viewW = wrap.clientWidth || window.innerWidth
        viewH = wrap.clientHeight || window.innerHeight
        canvas.width = Math.floor(viewW * dpr)
        canvas.height = Math.floor(viewH * dpr)
        canvas.style.width = `${viewW}px`
        canvas.style.height = `${viewH}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      fit()
      window.addEventListener("resize", fit)

      const burst = (x: number, y: number, count: number) => {
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35
          const speed = 1.2 + Math.random() * 4
          sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.15,
            life: 0,
            ttl: 48 + Math.random() * 42,
            color: PALETTE[(Math.random() * PALETTE.length) | 0],
            size: 1.1 + Math.random() * 2.3,
            drag: 0.984 + Math.random() * 0.012,
          })
        }
      }

      const launches = [
        { t: 60, x: 0.22, y: 0.18, n: 40 },
        { t: 260, x: 0.8, y: 0.14, n: 46 },
        { t: 500, x: 0.5, y: 0.1, n: 54 },
        { t: 800, x: 0.12, y: 0.28, n: 34 },
        { t: 1080, x: 0.88, y: 0.24, n: 38 },
        { t: 1420, x: 0.34, y: 0.16, n: 42 },
        { t: 1780, x: 0.68, y: 0.2, n: 36 },
      ]
      let launchIndex = 0

      const tick = (now: number) => {
        if (!running) return
        const elapsed = now - started
        ctx.clearRect(0, 0, viewW, viewH)

        while (launchIndex < launches.length && elapsed >= launches[launchIndex].t) {
          const next = launches[launchIndex]
          burst(next.x * viewW, next.y * viewH, next.n)
          launchIndex += 1
        }

        for (let i = sparks.length - 1; i >= 0; i--) {
          const spark = sparks[i]
          spark.life += 1
          spark.vy += 0.042
          spark.vx *= spark.drag
          spark.vy *= spark.drag
          spark.x += spark.vx
          spark.y += spark.vy
          const t = spark.life / spark.ttl
          if (t >= 1) {
            sparks.splice(i, 1)
            continue
          }
          ctx.fillStyle = spark.color
          ctx.globalAlpha = (1 - t) * 0.92
          ctx.beginPath()
          ctx.arc(spark.x, spark.y, spark.size * (1 - t * 0.35), 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = (1 - t) * 0.22
          ctx.beginPath()
          ctx.arc(spark.x, spark.y, spark.size * 2.8, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1
        if (elapsed < 4200 || sparks.length > 0) raf = requestAnimationFrame(tick)
      }

      raf = requestAnimationFrame(tick)

      gsap.fromTo(
        wrap,
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: 1.15, delay: 3.35, ease: "power2.out" },
      )

      return () => {
        running = false
        cancelAnimationFrame(raf)
        window.removeEventListener("resize", fit)
      }
    },
    { scope: wrapRef },
  )

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
