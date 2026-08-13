"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import LazyImage from "./lazy-image"
import { ChevronDown, Menu, ShoppingBag, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { gsap, useGSAP } from "@/lib/gsap"
import { useCakeOrder } from "@/components/cake-order-provider"
import { cartCount } from "@/lib/cake-order"

const navBefore = [{ href: "/", label: "Home" }]

const navAfter = [
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const treatsLinks = [
  { href: "/treats", label: "Scones & Treats" },
  { href: "/treats/cupcakes", label: "Cupcakes" },
  { href: "/treats/popsticles", label: "Popsticles" },
]

const cakesLinks = [
  { href: "/cakes", label: "All Cakes" },
  { href: "/cakes/wedding", label: "Wedding Cakes" },
  { href: "/cakes/birthday", label: "Birthday Cakes" },
  { href: "/cakes/anniversary", label: "Anniversary Cakes" },
  { href: "/cakes/children", label: "Children's Cakes" },
  { href: "/cakes/corporate", label: "Corporate Cakes" },
]

const primaryPrefetch = ["/", "/gallery", "/about", "/contact", "/cakes", "/treats", "/order", "/checkout"]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [treatsOpen, setTreatsOpen] = useState(false)
  const [treatsMobileOpen, setTreatsMobileOpen] = useState(false)
  const [cakesOpen, setCakesOpen] = useState(false)
  const [cakesMobileOpen, setCakesMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const treatsCloseTimer = useRef<number>(0)
  const cakesCloseTimer = useRef<number>(0)
  const isOpenRef = useRef(false)
  const openMenuRef = useRef<() => void>(() => {})
  const closeMenuRef = useRef<() => void>(() => {})
  const { draft } = useCakeOrder()
  const bagCount = cartCount(draft)

  const isHome = pathname === "/"
  const isAbout = pathname === "/about"
  const treatsActive = pathname === "/treats" || pathname.startsWith("/treats/")
  const cakesActive = pathname === "/cakes" || pathname.startsWith("/cakes/")
  const lightNav = isHome && !isScrolled && !isMenuOpen
  const showGlass = isScrolled || isAbout || cakesActive || isMenuOpen

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    closeMenuRef.current()
    setTreatsOpen(false)
    setTreatsMobileOpen(false)
    setCakesOpen(false)
    setCakesMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    primaryPrefetch.forEach((href) => router.prefetch(href))
  }, [router])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".header-nav-link", { autoAlpha: 1, y: 0 })
      })
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".header-nav-link",
          { y: -12, autoAlpha: 1 },
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.06,
            duration: 0.5,
            delay: 0.15,
            ease: "power2.out",
            clearProps: "transform",
          },
        )
      })
      return () => mm.revert()
    },
    { scope: headerRef },
  )

  useGSAP(
    (_context, contextSafe) => {
      const overlay = menuRef.current
      if (!overlay) return

      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" })
      gsap.set(".mobile-nav-item", { autoAlpha: 0, y: 28 })

      const unlockScroll = () => {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }

      const lockScroll = () => {
        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
      }

      openMenuRef.current = contextSafe(() => {
        if (isOpenRef.current) return
        isOpenRef.current = true
        setIsMenuOpen(true)
        lockScroll()

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        gsap.set(overlay, { pointerEvents: "auto" })

        if (reduceMotion) {
          gsap.set(overlay, { autoAlpha: 1 })
          gsap.set(".mobile-nav-item", { autoAlpha: 1, y: 0 })
          return
        }

        gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" })
        gsap.fromTo(
          ".mobile-nav-item",
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.5, delay: 0.12, ease: "power3.out" },
        )
      })

      closeMenuRef.current = contextSafe(() => {
        if (!isOpenRef.current) return
        isOpenRef.current = false
        setTreatsMobileOpen(false)
        setCakesMobileOpen(false)

        const finish = () => {
          gsap.set(overlay, { pointerEvents: "none" })
          unlockScroll()
          setIsMenuOpen(false)
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (reduceMotion) {
          gsap.set(overlay, { autoAlpha: 0 })
          gsap.set(".mobile-nav-item", { autoAlpha: 0, y: 28 })
          finish()
          return
        }

        gsap.to(".mobile-nav-item", {
          y: -12,
          autoAlpha: 0,
          stagger: 0.03,
          duration: 0.22,
          ease: "power2.in",
        })
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.35,
          delay: 0.08,
          ease: "power2.in",
          onComplete: finish,
        })
      })

      const onKeyDown = contextSafe((event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setTreatsOpen(false)
          setCakesOpen(false)
          closeMenuRef.current()
        }
      })

      const onResize = contextSafe(() => {
        if (window.matchMedia("(min-width: 1024px)").matches) closeMenuRef.current()
      })

      window.addEventListener("keydown", onKeyDown)
      window.addEventListener("resize", onResize)

      return () => {
        window.removeEventListener("keydown", onKeyDown)
        window.removeEventListener("resize", onResize)
        unlockScroll()
      }
    },
    { scope: headerRef },
  )

  const toggleMenu = () => {
    if (isOpenRef.current) closeMenuRef.current()
    else openMenuRef.current()
  }

  const openTreats = () => {
    window.clearTimeout(treatsCloseTimer.current)
    window.clearTimeout(cakesCloseTimer.current)
    setCakesOpen(false)
    setTreatsOpen(true)
    treatsLinks.forEach((item) => router.prefetch(item.href))
  }

  const scheduleCloseTreats = () => {
    window.clearTimeout(treatsCloseTimer.current)
    treatsCloseTimer.current = window.setTimeout(() => setTreatsOpen(false), 160)
  }

  const openCakes = () => {
    window.clearTimeout(cakesCloseTimer.current)
    window.clearTimeout(treatsCloseTimer.current)
    setTreatsOpen(false)
    setCakesOpen(true)
    cakesLinks.forEach((item) => router.prefetch(item.href))
  }

  const scheduleCloseCakes = () => {
    window.clearTimeout(cakesCloseTimer.current)
    cakesCloseTimer.current = window.setTimeout(() => setCakesOpen(false), 160)
  }

  const navLinkClass = (active: boolean) =>
    [
      "header-nav-link relative px-4 py-2 text-sm font-semibold tracking-wide",
      "after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:origin-left after:rounded-full after:bg-current after:content-[''] after:transition-transform after:duration-300",
      active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
      active
        ? lightNav
          ? "text-white after:bg-white"
          : "text-dadda-primary after:bg-dadda-primary"
        : lightNav
          ? "text-white/80 hover:text-white after:bg-white/80"
          : "text-on-surface-variant hover:text-chocolate-text after:bg-dadda-primary",
    ].join(" ")

  const renderNavLink = (item: { href: string; label: string }) => {
    const active = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch
        className={navLinkClass(active)}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 z-50 w-full transition-[background-color,box-shadow] duration-500 ${
        showGlass
          ? "bg-white/25 shadow-[0_8px_32px_rgba(45,36,30,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div
        className={`relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-margin-mobile transition-[height] duration-500 lg:px-margin-desktop ${
          isScrolled ? "h-16" : "h-24"
        } ${
          showGlass
            ? "border-b border-white/40 backdrop-blur-xl"
            : ""
        }`}
      >
        <Link href="/" prefetch className="flex items-center" aria-label="Dadda's Confectionery home">
          <LazyImage
            src="/images/dadda-logo.png"
            alt="Dadda's Confectionery"
            width={isScrolled ? 48 : 72}
            height={isScrolled ? 48 : 72}
            className={`object-contain drop-shadow-md transition-[width,height] duration-500 ${
              isScrolled ? "h-12 w-12" : "h-[72px] w-[72px]"
            }`}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navBefore.map(renderNavLink)}

          <div
            className="relative"
            onMouseEnter={openCakes}
            onMouseLeave={scheduleCloseCakes}
            onFocus={openCakes}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCakesOpen(false)
            }}
          >
            <Link
              href="/cakes"
              prefetch
              className={`${navLinkClass(cakesActive)} inline-flex items-center gap-1`}
              aria-haspopup="menu"
              aria-expanded={cakesOpen}
              aria-controls="cakes-menu"
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setTreatsOpen(false)
                  setCakesOpen(true)
                  window.requestAnimationFrame(() => {
                    document.getElementById("cakes-menu-first")?.focus()
                  })
                }
              }}
            >
              Cakes
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${cakesOpen ? "rotate-180" : ""}`} />
            </Link>
            <ul
              id="cakes-menu"
              role="menu"
              aria-hidden={!cakesOpen}
              className={`absolute left-0 top-full z-20 min-w-[220px] rounded-xl border border-white/50 bg-white/90 p-2 shadow-pastry backdrop-blur-xl ${
                cakesOpen ? "block" : "hidden"
              }`}
            >
              {cakesLinks.map((item, index) => {
                const active = pathname === item.href
                return (
                  <li key={item.href} role="none">
                    <Link
                      id={index === 0 ? "cakes-menu-first" : undefined}
                      role="menuitem"
                      href={item.href}
                      prefetch
                      className={`block rounded-lg px-4 py-3 text-sm font-semibold tracking-wide ${
                        active
                          ? "bg-dadda-primary/10 text-dadda-primary"
                          : "text-chocolate-text hover:bg-dadda-primary/10 hover:text-dadda-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div
            className="relative"
            onMouseEnter={openTreats}
            onMouseLeave={scheduleCloseTreats}
            onFocus={openTreats}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setTreatsOpen(false)
            }}
          >
            <Link
              href="/treats"
              prefetch
              className={`${navLinkClass(treatsActive)} inline-flex items-center gap-1`}
              aria-haspopup="menu"
              aria-expanded={treatsOpen}
              aria-controls="treats-menu"
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setCakesOpen(false)
                  setTreatsOpen(true)
                  window.requestAnimationFrame(() => {
                    document.getElementById("treats-menu-first")?.focus()
                  })
                }
              }}
            >
              Treats
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${treatsOpen ? "rotate-180" : ""}`} />
            </Link>
            <ul
              id="treats-menu"
              role="menu"
              aria-hidden={!treatsOpen}
              className={`absolute left-0 top-full z-20 min-w-[220px] rounded-xl border border-white/50 bg-white/90 p-2 shadow-pastry backdrop-blur-xl ${
                treatsOpen ? "block" : "hidden"
              }`}
            >
              {treatsLinks.map((item, index) => {
                const active = pathname === item.href
                return (
                  <li key={item.href} role="none">
                    <Link
                      id={index === 0 ? "treats-menu-first" : undefined}
                      role="menuitem"
                      href={item.href}
                      prefetch
                      className={`block rounded-lg px-4 py-3 text-sm font-semibold tracking-wide ${
                        active
                          ? "bg-dadda-primary/10 text-dadda-primary"
                          : "text-chocolate-text hover:bg-dadda-primary/10 hover:text-dadda-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {navAfter.map(renderNavLink)}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            prefetch
            className={`header-nav-link relative inline-flex h-11 w-11 items-center justify-center rounded-full ${
              lightNav ? "text-white hover:bg-white/15" : "text-chocolate-text hover:bg-dadda-primary/10"
            }`}
            aria-label={bagCount ? `Cart, ${bagCount} items` : "Cart"}
          >
            <ShoppingBag size={22} />
            {bagCount > 0 && (
              <span className="absolute right-0.5 top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-dadda-primary px-1 text-[10px] font-bold leading-none text-on-primary">
                {bagCount > 9 ? "9+" : bagCount}
              </span>
            )}
          </Link>
          <Link
            href="/order"
            prefetch
            className="header-nav-link hidden rounded-full bg-dadda-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-sm hover:bg-primary-container hover:text-on-primary-container hover:shadow-pastry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container md:inline-flex"
          >
            Order Now
          </Link>
          <button
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden ${
              lightNav ? "text-white hover:bg-white/15" : "text-chocolate-text hover:bg-dadda-primary/10"
            }`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        ref={menuRef}
        id="mobile-menu"
        className="fixed inset-0 z-0 flex flex-col bg-background/95 backdrop-blur-2xl lg:hidden"
        aria-hidden={!isMenuOpen}
      >
        <div className="flex h-full flex-col px-8 pb-10 pt-28">
          <p className="mobile-nav-item mb-8 font-display text-sm italic text-on-surface-variant">Baked with Love</p>

          <nav className="flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
            {navBefore.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`mobile-nav-item flex min-h-14 items-center border-b border-outline-variant/40 font-display text-3xl font-semibold tracking-tight ${
                    active ? "text-dadda-primary" : "text-chocolate-text hover:text-dadda-primary"
                  }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => closeMenuRef.current()}
                >
                  {item.label}
                </Link>
              )
            })}

            <div className="mobile-nav-item border-b border-outline-variant/40">
              <button
                type="button"
                className={`flex min-h-14 w-full items-center justify-between font-display text-3xl font-semibold tracking-tight ${
                  cakesActive ? "text-dadda-primary" : "text-chocolate-text"
                }`}
                aria-expanded={cakesMobileOpen}
                aria-controls="mobile-cakes-menu"
                onClick={() => {
                  setCakesMobileOpen((open) => {
                    if (!open) cakesLinks.forEach((item) => router.prefetch(item.href))
                    return !open
                  })
                }}
              >
                Cakes
                <ChevronDown className={`h-7 w-7 transition-transform ${cakesMobileOpen ? "rotate-180" : ""}`} />
              </button>
              {cakesMobileOpen && (
                <div id="mobile-cakes-menu" className="flex flex-col pb-3 pl-2">
                  {cakesLinks.map((item) => {
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        className={`flex min-h-12 items-center font-display text-2xl font-semibold ${
                          active ? "text-dadda-primary" : "text-chocolate-text hover:text-dadda-primary"
                        }`}
                        aria-current={active ? "page" : undefined}
                        onClick={() => closeMenuRef.current()}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mobile-nav-item border-b border-outline-variant/40">
              <button
                type="button"
                className={`flex min-h-14 w-full items-center justify-between font-display text-3xl font-semibold tracking-tight ${
                  treatsActive ? "text-dadda-primary" : "text-chocolate-text"
                }`}
                aria-expanded={treatsMobileOpen}
                aria-controls="mobile-treats-menu"
                onClick={() => {
                  setTreatsMobileOpen((open) => {
                    if (!open) treatsLinks.forEach((item) => router.prefetch(item.href))
                    return !open
                  })
                }}
              >
                Treats
                <ChevronDown className={`h-7 w-7 transition-transform ${treatsMobileOpen ? "rotate-180" : ""}`} />
              </button>
              {treatsMobileOpen && (
                <div id="mobile-treats-menu" className="flex flex-col pb-3 pl-2">
                  {treatsLinks.map((item) => {
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        className={`flex min-h-14 items-center font-display text-2xl font-semibold ${
                          active ? "text-dadda-primary" : "text-chocolate-text hover:text-dadda-primary"
                        }`}
                        aria-current={active ? "page" : undefined}
                        onClick={() => closeMenuRef.current()}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {navAfter.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={`mobile-nav-item flex min-h-14 items-center border-b border-outline-variant/40 font-display text-3xl font-semibold tracking-tight ${
                    active ? "text-dadda-primary" : "text-chocolate-text hover:text-dadda-primary"
                  }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => closeMenuRef.current()}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mobile-nav-item mt-8 flex flex-col gap-3">
            <Link
              href="/checkout"
              prefetch
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-dadda-primary px-8 py-4 text-sm font-semibold uppercase tracking-widest text-dadda-primary"
              onClick={() => closeMenuRef.current()}
            >
              <ShoppingBag className="h-4 w-4" />
              Cart{bagCount > 0 ? ` (${bagCount})` : ""}
            </Link>
            <Link
              href="/order"
              prefetch
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-dadda-primary px-8 py-4 text-sm font-semibold uppercase tracking-widest text-on-primary shadow-pastry hover:bg-primary-container hover:text-on-primary-container"
              onClick={() => closeMenuRef.current()}
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
