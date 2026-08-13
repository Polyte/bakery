"use client"

import { useRef } from "react"
import { usePathname } from "next/navigation"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"

const HEADER_OFFSET = 88

function isHidden(el: HTMLElement) {
  if (el.hidden) return true
  const panel = el.matches('[role="tabpanel"]') ? el : el.closest<HTMLElement>('[role="tabpanel"]')
  if (!panel) return false
  return panel.hidden || panel.getAttribute("data-state") === "inactive"
}

function fromVars(type: string | undefined): gsap.TweenVars {
  if (type === "fade-left") return { x: -32, y: 0 }
  if (type === "fade-right") return { x: 32, y: 0 }
  if (type === "scale") return { x: 0, y: 0, scale: 0.98 }
  return { x: 0, y: 32 }
}

export default function PageAnimations({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useGSAP(
    (_context, contextSafe) => {
      const root = container.current
      if (!root) return

      const mm = gsap.matchMedia()
      const bound = new WeakSet<Element>()

      mm.add("(prefers-reduced-motion: reduce)", () => {})

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const bindAnimate = (el: HTMLElement) => {
          if (bound.has(el)) return
          if (el.hasAttribute("data-stagger-item") && el.closest("[data-stagger]")) return
          if (isHidden(el)) return
          bound.add(el)

          gsap.fromTo(el, fromVars(el.dataset.animate), {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            immediateRender: false,
            overwrite: "auto",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
              once: true,
            },
          })
        }

        const bindStagger = (parent: HTMLElement) => {
          if (bound.has(parent)) return
          if (isHidden(parent)) return
          const items = parent.querySelectorAll<HTMLElement>("[data-stagger-item]")
          if (!items.length) return
          bound.add(parent)
          items.forEach((item) => bound.add(item))

          gsap.fromTo(
            items,
            { y: 24, x: 0 },
            {
              y: 0,
              x: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.1,
              immediateRender: false,
              overwrite: "auto",
              clearProps: "transform",
              scrollTrigger: {
                trigger: parent,
                start: "top 88%",
                toggleActions: "play none none none",
                once: true,
              },
            },
          )
        }

        const bindParallax = (el: HTMLElement) => {
          if (bound.has(el)) return
          bound.add(el)
          gsap.to(el, {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          })
        }

        const scan = () => {
          root.querySelectorAll<HTMLElement>("[data-animate]").forEach(bindAnimate)
          root.querySelectorAll<HTMLElement>("[data-stagger]").forEach(bindStagger)
          root.querySelectorAll<HTMLElement>("[data-parallax]").forEach(bindParallax)
        }

        scan()

        let scanQueued = false
        const queueScan = () => {
          if (scanQueued) return
          scanQueued = true
          window.requestAnimationFrame(() => {
            scanQueued = false
            scan()
            ScrollTrigger.refresh()
          })
        }

        const observer = new MutationObserver(queueScan)
        observer.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-state", "hidden"],
        })

        const onAnchorClick = contextSafe((event: Event) => {
          const target = event.target
          if (!(target instanceof Element)) return
          const link = target.closest("a[href^='#']")
          if (!(link instanceof HTMLAnchorElement)) return

          const hash = link.getAttribute("href")
          if (!hash || hash === "#") return

          const dest = document.querySelector(hash)
          if (!(dest instanceof HTMLElement)) return

          event.preventDefault()
          event.stopPropagation()
          window.history.pushState(null, "", hash)
          gsap.to(window, {
            duration: 1.05,
            ease: "power3.inOut",
            scrollTo: { y: dest, offsetY: HEADER_OFFSET, autoKill: true },
          })
        })

        document.addEventListener("click", onAnchorClick, true)

        const refresh = () => ScrollTrigger.refresh()
        const timeout = window.setTimeout(refresh, 400)
        window.addEventListener("load", refresh)
        root.querySelectorAll("img").forEach((img) => {
          if (!img.complete) img.addEventListener("load", refresh, { once: true })
        })

        return () => {
          observer.disconnect()
          window.clearTimeout(timeout)
          window.removeEventListener("load", refresh)
          document.removeEventListener("click", onAnchorClick, true)
        }
      })

      return () => mm.revert()
    },
    { scope: container, dependencies: [pathname], revertOnUpdate: true },
  )

  return <div ref={container}>{children}</div>
}
