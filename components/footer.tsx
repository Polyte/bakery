"use client"

import { useRef } from "react"
import Link from "next/link"
import {
  ArrowUp,
  Cake,
  Facebook,
  Heart,
  Home,
  Images,
  Instagram,
  Info,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  Sparkles,
  Twitter,
} from "lucide-react"
import FooterDrip from "./footer-drip"
import LazyImage from "./lazy-image"
import { gsap, useGSAP } from "@/lib/gsap"

const MAPS_URL =
  "https://www.google.com/maps/place/2337,+6814+Strawberry+St,+Hartebeesthoek+303-Jr,+Akasia,+0182/@-25.6719441,28.0873411,1103m/data=!3m2!1e3!4b1!4m5!3m4!1s0x1ebfd74a6f3d5897:0x60c92cf996fd6970!8m2!3d-25.6719441!4d28.089916"

const copper = "text-[#d4a373]"
const copperHover = "hover:text-[#f0bd8b]"
const headingClass = "mb-5 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#d4a373]"
const linkClass = `inline-flex items-center gap-2.5 text-sm leading-6 text-[#d4a373] ${copperHover} transition-colors`

const quickLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/order", label: "Order", icon: ShoppingBag },
  { href: "/privacy", label: "Privacy", icon: Shield },
]

const specialties = [
  { href: "/cakes/wedding", label: "Wedding Cakes", icon: Sparkles },
  { href: "/cakes/birthday", label: "Birthday Cakes", icon: Cake },
  { href: "/cakes/anniversary", label: "Anniversary Cakes", icon: Heart },
  { href: "/cakes/children", label: "Children's Cakes", icon: Cake },
  { href: "/cakes/corporate", label: "Corporate Cakes", icon: Cake },
  { href: "/treats/cupcakes", label: "Cupcakes", icon: Cake },
  { href: "/treats/popsticles", label: "Popsticles", icon: Sparkles },
]

const socialClass =
  `flex h-9 w-9 items-center justify-center rounded-full border border-[#d4a373]/70 text-[#d4a373] ${copperHover} hover:border-[#f0bd8b]`

function scrollToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".footer-col", { autoAlpha: 1, y: 0 })
      })
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".footer-col",
          { y: 16, autoAlpha: 1 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
          },
        )
      })
      return () => mm.revert()
    },
    { scope: footerRef },
  )

  return (
    <footer ref={footerRef} className="relative w-full overflow-hidden bg-[#2D241E]">
      <FooterDrip />
      <div className="relative z-10 mx-auto max-w-[1200px] px-margin-mobile pb-8 pt-10 lg:px-margin-desktop lg:pt-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="footer-col space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f6efe4] p-1 shadow-[0_0_0_3px_rgba(246,239,228,0.55)]">
                <LazyImage
                  src="/images/dadda-logo.png"
                  alt="Dadda's Confectionery"
                  width={52}
                  height={52}
                  className="h-[52px] w-[52px] object-contain"
                  priority
                />
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#e0b57a]">
                  Dadda&apos;s Confectionery
                </h3>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d4a373]">
                  Baked with Love
                </p>
              </div>
            </Link>
            <p className="text-sm leading-6 text-[#d4a373]/85">
              Creating delicious memories with our artisanal cakes and confections for all your special occasions.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="https://www.facebook.com/daddasconfectionery"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={socialClass}
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/daddasconfectionery"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={socialClass}
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/daddasconfectionery"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className={socialClass}
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav className="footer-col" aria-label="Quick links">
            <h3 className={headingClass}>Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    <link.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Our specialties">
            <h3 className={headingClass}>Our Specialties</h3>
            <ul className="space-y-2.5">
              {specialties.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    <link.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h3 className={headingClass}>Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className={`mr-2 mt-0.5 h-4 w-4 shrink-0 ${copper}`} />
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, 0182
                </a>
              </li>
              <li className="flex items-center">
                <Phone className={`mr-2 h-4 w-4 shrink-0 ${copper}`} />
                <a href="tel:+27762196675" className={linkClass}>
                  +27 76 219 6675
                </a>
              </li>
              <li className="flex items-center">
                <Mail className={`mr-2 h-4 w-4 shrink-0 ${copper}`} />
                <a href="mailto:info@daddasconfectionery.co.za" className={linkClass}>
                  info@daddasconfectionery.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#d4a373]/25 pt-6 text-center text-[12px] font-medium tracking-[0.03em] text-[#d4a373]/90 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Dadda&apos;s Confectionery. All rights reserved.</p>
          <p className="inline-flex items-center font-display italic">
            Baked with <Heart className="mx-1.5 h-3 w-3 fill-[#d4a373] text-[#d4a373]" /> Love
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className={`inline-flex items-center gap-2 ${copper} ${copperHover}`}
          >
            Scroll to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d4a373]/70">
              <ArrowUp className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
