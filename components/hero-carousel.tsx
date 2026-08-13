"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, Heart, Cake, Sparkles, Coffee, Gift } from "lucide-react"
import Link from "next/link"
import { gsap, useGSAP } from "@/lib/gsap"
import { onIntroComplete } from "@/lib/intro"
import LazyImage from "./lazy-image"

interface CarouselSlide {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  cta: {
    primary: { text: string; href: string }
    secondary: { text: string; href: string }
  }
  icon?: React.ReactNode
  theme: string
}

const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: "Exquisite Wedding Cakes",
    subtitle: "Crafting Dreams in Sugar & Flour",
    description:
      "Our wedding cakes are more than dessert; they're a centerpiece of your celebration, baked with love and designed to perfection. Let us create a masterpiece for your special day.",
    image: "/cakes/wed.jpg",
    cta: {
      primary: { text: "Explore Wedding Cakes", href: "/gallery" },
      secondary: { text: "Book a Consultation", href: "/contact" },
    },
    icon: <Heart className="h-8 w-8" />,
    theme: "elegant",
  },
  {
    id: 2,
    title: "Vibrant Cupcake Assortments",
    subtitle: "A Bite of Happiness for Every Occasion",
    description:
      "Discover our delightful range of cupcakes, from classic flavors to custom creations. Perfect for parties, gifts, or a sweet treat just for you.",
    image: "/cakes/cake11.jpg",
    cta: {
      primary: { text: "View Cupcakes", href: "/cakes/cupcakes" },
      secondary: { text: "Order Now", href: "/order" },
    },
    icon: <Cake className="h-8 w-8" />,
    theme: "colorful",
  },
  {
    id: 3,
    title: "Classic Scones & Tea Time Treats",
    subtitle: "Timeless Elegance, Freshly Baked",
    description:
      "Indulge in our traditional scones, served warm with clotted cream and jam. The perfect accompaniment to your afternoon tea or a cozy morning.",
    image: "/cakes/cake10.jpg",
    cta: {
      primary: { text: "Discover High Tea", href: "/cakes/pastries" },
      secondary: { text: "Visit Our Bakery", href: "/contact" },
    },
    icon: <Coffee className="h-8 w-8" />,
    theme: "classic",
  },
  {
    id: 4,
    title: "Artisanal Pastry Collection",
    subtitle: "Masterpieces of Flavor and Texture",
    description:
      "Explore our exquisite selection of handcrafted pastries, from delicate eclairs to rich fruit tarts. Each bite is a testament to our passion for baking.",
    image: "/cakes/cake30.jpg",
    cta: {
      primary: { text: "Browse Pastries", href: "/cakes/pastries" },
      secondary: { text: "Catering Inquiry", href: "/contact" },
    },
    icon: <Sparkles className="h-8 w-8" />,
    theme: "gourmet",
  },
  {
    id: 5,
    title: "Dadda's Signature Chocolate Cake",
    subtitle: "Pure Indulgence, Unforgettable Taste",
    description:
      "Experience our renowned signature chocolate cake – layers of moist chocolate sponge, rich ganache, and artful decoration. A true showstopper for any event.",
    image: "/cakes/cake7.jpg",
    cta: {
      primary: { text: "Order Signature Cake", href: "/order" },
      secondary: { text: "Learn More", href: "/about" },
    },
    icon: <Gift className="h-8 w-8" />,
    theme: "luxurious",
  },
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const container = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const nextSlide = useCallback(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)

    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }, [isTransitioning])

  const prevSlide = useCallback(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)

    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }, [isTransitioning])

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentSlide) return

      setIsTransitioning(true)
      setCurrentSlide(index)

      setTimeout(() => {
        setIsTransitioning(false)
      }, 800)
    },
    [currentSlide, isTransitioning],
  )

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") prevSlide()
      if (event.key === "ArrowRight") nextSlide()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, prevSlide])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hero-slides", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        gsap.to(".hero-watermark", {
          y: 12,
          duration: 2.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      })
      return () => mm.revert()
    },
    { scope: container },
  )

  useGSAP(
    (_context, contextSafe) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      gsap.set(".hero-copy > *", { autoAlpha: 1, y: 0, scale: 1 })

      const playSlide = contextSafe(() => {
        gsap.set(".hero-copy > *", { autoAlpha: 1, y: 0, scale: 1 })

        if (reduceMotion) {
          gsap.set(".hero-slide", {
            autoAlpha: (i: number) => (i === currentSlide ? 1 : 0),
            scale: 1,
          })
          if (progressRef.current) {
            gsap.set(progressRef.current, {
              scaleX: (currentSlide + 1) / carouselSlides.length,
              transformOrigin: "left center",
            })
          }
          return
        }

        const slides = gsap.utils.toArray<HTMLElement>(".hero-slide")
        slides.forEach((slide, i) => {
          gsap.to(slide, {
            autoAlpha: i === currentSlide ? 1 : 0,
            duration: 1,
            ease: "power2.inOut",
            overwrite: "auto",
          })
        })

        const activeImg = slides[currentSlide]?.querySelector("img")
        if (activeImg) {
          gsap.fromTo(activeImg, { scale: 1.08 }, { scale: 1, duration: 6.2, ease: "none", overwrite: "auto" })
        }

        if (progressRef.current) {
          gsap.to(progressRef.current, {
            scaleX: (currentSlide + 1) / carouselSlides.length,
            duration: 0.6,
            ease: "power2.out",
            transformOrigin: "left center",
            overwrite: "auto",
          })
        }
      })

      return onIntroComplete(playSlide)
    },
    { scope: container, dependencies: [currentSlide], revertOnUpdate: true },
  )

  const currentSlideData = carouselSlides[currentSlide]

  return (
    <section
      ref={container}
      className="relative min-h-[600px] h-[calc(100vh-4rem)] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Hero carousel showcasing Dadda's Confectionery offerings"
    >
      <div className="hero-slides absolute inset-0 h-full">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="hero-slide absolute inset-0 h-full w-full"
            style={{ opacity: index === 0 ? 1 : 0, visibility: index === 0 ? "inherit" : "hidden" }}
            aria-hidden={index !== currentSlide}
          >
            <LazyImage
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60" />
          </div>
        ))}
      </div>

      <div className="hero-watermark pointer-events-none absolute top-1/2 right-10 hidden h-40 w-40 -translate-y-1/2 opacity-10 xl:block">
        <LazyImage src="/images/dadda-logo.png" alt="" fill className="object-contain" sizes="160px" />
      </div>

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl">
            <div key={currentSlide} className="hero-copy text-white">
              {currentSlideData.icon && (
                <div
                  className={`hero-icon mb-8 w-fit rounded-full border-2 border-white/30 p-5 text-white backdrop-blur-sm ${
                    currentSlideData.theme === "elegant"
                      ? "bg-dadda-primary/40"
                      : currentSlideData.theme === "playful"
                        ? "bg-pink-500/40"
                        : currentSlideData.theme === "gourmet"
                          ? "bg-amber-500/40"
                          : "bg-dadda-red/40"
                  }`}
                >
                  {currentSlideData.icon}
                </div>
              )}

              <p className="hero-subtitle mb-6 text-lg font-medium uppercase tracking-wide text-dadda-primary md:text-xl">
                {currentSlideData.subtitle}
              </p>

              <h1 className="hero-title mb-8 text-5xl font-bold leading-tight md:text-7xl lg:text-8xl">
                {currentSlideData.title}
              </h1>

              <p className="hero-desc mb-10 max-w-3xl text-xl leading-relaxed text-gray-100 md:text-2xl">
                {currentSlideData.description}
              </p>

              <div className="flex flex-col gap-6 sm:flex-row">
                <Link
                  href={currentSlideData.cta.primary.href}
                  className="hero-cta btn-primary bg-dadda-primary px-10 py-5 text-xl shadow-2xl hover:bg-dadda-primary-dark"
                >
                  {currentSlideData.cta.primary.text}
                </Link>
                <Link
                  href={currentSlideData.cta.secondary.href}
                  className="hero-cta btn-secondary border-2 border-white px-10 py-5 text-xl text-white backdrop-blur-sm hover:bg-white hover:text-brown-dark"
                >
                  {currentSlideData.cta.secondary.text}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/20 p-4 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-dadda-primary/80 focus:outline-none focus:ring-2 focus:ring-dadda-primary/50"
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-white/20 p-4 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-dadda-primary/80 focus:outline-none focus:ring-2 focus:ring-dadda-primary/50"
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 space-x-4">
        {carouselSlides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentSlide ? "scale-125" : "hover:scale-110"
            }`}
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
            aria-current={index === currentSlide ? "true" : "false"}
            disabled={isTransitioning}
          >
            <div
              className={`h-4 w-4 rounded-full border-2 transition-all duration-300 ${
                index === currentSlide
                  ? "border-white bg-dadda-primary"
                  : "border-white/50 bg-white/50 hover:bg-white/75"
              }`}
            />
            {index === currentSlide && (
              <div className="absolute -inset-3 rounded-full border-2 border-dadda-primary/50 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 z-20 h-2 w-full origin-left bg-white/20">
        <div
          ref={progressRef}
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-dadda-primary to-dadda-primary-light"
        />
      </div>

      <div className="absolute right-6 top-6 z-20">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="rounded-full border border-white/30 bg-white/20 p-3 text-white backdrop-blur-md transition-all duration-300 hover:bg-dadda-primary/80 focus:outline-none focus:ring-2 focus:ring-dadda-primary/50"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? (
            <div className="flex h-5 w-5 space-x-1">
              <div className="h-5 w-1.5 rounded-sm bg-white"></div>
              <div className="h-5 w-1.5 rounded-sm bg-white"></div>
            </div>
          ) : (
            <div className="relative h-5 w-5">
              <div className="absolute inset-0 rounded-sm border-y-2 border-l-4 border-r-0 border-y-transparent border-l-white"></div>
            </div>
          )}
        </button>
      </div>

      <div className="absolute left-6 top-6 z-20 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
        {currentSlide + 1} / {carouselSlides.length}
      </div>
    </section>
  )
}
