"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Heart, Cake, Sparkles, Coffee, Gift } from "lucide-react"
import Link from "next/link"
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

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") prevSlide()
      if (event.key === "ArrowRight") nextSlide()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, prevSlide])

  const currentSlideData = carouselSlides[currentSlide]

  return (
    <section
      className="relative min-h-[600px] h-[calc(100vh-4rem)] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Hero carousel showcasing Dadda's Confectionery offerings"
    >
      {/* Background Images with Enhanced Parallax Effect */}
      <div className="absolute inset-0 h-full">
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
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

      {/* Enhanced Floating Logo Watermark */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-40 h-40 opacity-10 pointer-events-none hidden xl:block">
        <LazyImage src="/images/dadda-logo.png" alt="" fill className="object-contain animate-bounce-gentle" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl">
            {/* Animated Content */}
            <div key={currentSlide} className="animate-fade-in-up text-white">
              {/* Enhanced Icon with Theme-based Styling */}
              {currentSlideData.icon && (
                <div
                  className={`mb-8 text-white rounded-full p-5 w-fit backdrop-blur-sm border-2 border-white/30 ${
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

              {/* Subtitle */}
              <p className="text-lg md:text-xl mb-6 text-dadda-primary font-medium tracking-wide uppercase">
                {currentSlideData.subtitle}
              </p>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                {currentSlideData.title}
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl mb-10 max-w-3xl leading-relaxed text-gray-100">
                {currentSlideData.description}
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href={currentSlideData.cta.primary.href}
                  className="btn-primary text-xl px-10 py-5 bg-dadda-primary hover:bg-dadda-primary-dark shadow-2xl"
                >
                  {currentSlideData.cta.primary.text}
                </Link>
                <Link
                  href={currentSlideData.cta.secondary.href}
                  className="btn-secondary border-2 border-white text-white hover:bg-white hover:text-brown-dark text-xl px-10 py-5 backdrop-blur-sm"
                >
                  {currentSlideData.cta.secondary.text}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-dadda-primary/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-dadda-primary/50 border border-white/30"
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-dadda-primary/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-dadda-primary/50 border border-white/30"
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      {/* Enhanced Dot Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-4">
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
              className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                index === currentSlide
                  ? "bg-dadda-primary border-white"
                  : "bg-white/50 hover:bg-white/75 border-white/50"
              }`}
            />
            {index === currentSlide && (
              <div className="absolute -inset-3 rounded-full border-2 border-dadda-primary/50 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-white/20 z-20">
        <div
          className="h-full bg-gradient-to-r from-dadda-primary to-dadda-primary-light transition-all duration-300 ease-linear"
          style={{
            width: `${((currentSlide + 1) / carouselSlides.length) * 100}%`,
          }}
        />
      </div>

      {/* Enhanced Auto-play Indicator */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-white/20 backdrop-blur-md hover:bg-dadda-primary/80 text-white p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-dadda-primary/50 border border-white/30"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? (
            <div className="w-5 h-5 flex space-x-1">
              <div className="w-1.5 h-5 bg-white rounded-sm"></div>
              <div className="w-1.5 h-5 bg-white rounded-sm"></div>
            </div>
          ) : (
            <div className="w-5 h-5 relative">
              <div className="absolute inset-0 border-l-4 border-l-white border-y-2 border-y-transparent border-r-0 rounded-sm"></div>
            </div>
          )}
        </button>
      </div>

      {/* Enhanced Slide Counter */}
      <div className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
        {currentSlide + 1} / {carouselSlides.length}
      </div>
    </section>
  )
}
