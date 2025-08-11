"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import LazyImage from "./lazy-image" // Using LazyImage
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Determine if we are on the homepage
  const isHome = pathname === "/"
  // Use solid background and dark text if not home, or if scrolled on home
  const solidHeader = !isHome || isScrolled

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${solidHeader ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-transparent py-4"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Left Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-start">
            <Link
              href="/"
              className={`font-medium transition-colors duration-300 ${solidHeader ? "text-brown-dark hover:text-dadda-primary" : "text-white hover:text-dadda-primary"}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`font-medium transition-colors duration-300 ${solidHeader ? "text-brown-dark hover:text-dadda-primary" : "text-white hover:text-dadda-primary"}`}
            >
              About Us
            </Link>
            
          </nav>

          {/* Enhanced Center Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link href="/" className="flex-shrink-0 relative group">
              <div className={`transition-all duration-500 ${solidHeader ? "scale-90" : "scale-100"}`}>
                <div className="relative">
                  <LazyImage // Using LazyImage
                    src="/images/dadda-logo.png"
                    alt="Dadda's Confectionery"
                    width={solidHeader ? 60 : 90} // Dynamic width
                    height={solidHeader ? 60 : 90} // Dynamic height
                    className={`object-contain transition-all duration-500 drop-shadow-lg group-hover:scale-110`}
                    priority
                  />
                  {!solidHeader && <div className="absolute inset-0 bg-white/20 rounded-full blur-xl -z-10"></div>}
                </div>
              </div>
            </Link>
          </div>

          {/* Right Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-end">
          <Link
              href="/gallery"
              className={`font-medium transition-colors duration-300 ${solidHeader ? "text-brown-dark hover:text-dadda-primary" : "text-white hover:text-dadda-primary"}`}
            >
            Our Gallery
            </Link>
            {/* <Link
              href="/cakes"
              className={`font-medium transition-colors duration-300 ${solidHeader ? "text-brown-dark hover:text-dadda-primary" : "text-white hover:text-dadda-primary"}`}
            >
              Our Cakes
            </Link> */}
            <Link href="/order" className="btn-primary">
              Order Now
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 transition-colors duration-300 ${solidHeader ? "text-brown-dark" : "text-white"}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg">
          <div className="py-4 px-6 space-y-4">
            <Link
              href="/"
              className="block text-brown-dark hover:text-dadda-primary font-medium py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/cakes"
              className="block text-brown-dark hover:text-dadda-primary font-medium py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Cakes
            </Link>
            <Link
              href="/gallery"
              className="block text-brown-dark hover:text-dadda-primary font-medium py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/about"
              className="block text-brown-dark hover:text-dadda-primary font-medium py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/cakes"
              className="block text-brown-dark hover:text-dadda-primary font-medium py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Cakes
            </Link>
            <Link href="/order" className="btn-primary text-center block mt-4" onClick={() => setIsMenuOpen(false)}>
              Order Now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
