import Link from "next/link"
import LazyImage from "./lazy-image" // Using LazyImage
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-brown-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <LazyImage // Using LazyImage
                src="/images/dadda-logo.png"
                alt="Dadda's Confectionery"
                width={60}
                height={60}
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-dadda-green">Dadda's Confectionery</h3>
                <p className="text-sm text-gray-300 flex items-center">
                  Baked with <Heart className="h-3 w-3 mx-1 text-dadda-red" /> Love
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              Creating delicious memories with our artisanal cakes and confections for all your special occasions.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-gray-300 hover:text-dadda-green transition-colors" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-gray-300 hover:text-dadda-green transition-colors" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-gray-300 hover:text-dadda-green transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-dadda-green">Quick Links</h3>
            <ul className="space-y-2">
             
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-dadda-green transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-dadda-green transition-colors">
                  About Us
                </Link>
              </li>
             
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-dadda-green transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Specialties */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-dadda-green">Our Specialties</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-dadda-green transition-colors">
                  Wedding Cakes
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-dadda-green transition-colors">
                  Birthday Cakes
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-dadda-green transition-colors">
                  Anniversary Cakes
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-dadda-green transition-colors">
                  Children's Cakes
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-dadda-green transition-colors">
                  Corporate Cakes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-dadda-green">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-dadda-red mr-2 mt-0.5" />
                <span className="text-gray-300">6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, 0182</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-dadda-red mr-2" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-dadda-green transition-colors">
                  +27 76 219 6675
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-dadda-red mr-2" />
                <a
                  href="mailto:info@daddasconfectionery.com"
                  className="text-gray-300 hover:text-dadda-green transition-colors"
                >
                  info@daddasconfectionery.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-400">
          <p> {new Date().getFullYear()} Dadda's Confectionery. All rights reserved. Baked with Love.</p>
        </div>
      </div>
    </footer>
  )
}
