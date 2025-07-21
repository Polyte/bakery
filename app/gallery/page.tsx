"use client"

import Link from "next/link"
import { useState } from "react"
import LazyImage from '@/components/lazy-image'

// Enhanced gallery data using the new high-quality images
const galleryItems = [
  {
    id: 1,
    title: "Elegant Wedding Creation",
    category: "Wedding",
    image: "/cakes/cake1.jpg",
    description: "A stunning multi-tiered wedding cake, the epitome of elegance.",
  },
  {
    id: 2,
    title: "Vibrant Birthday Cupcakes",
    category: "Birthday",
    image: "/cakes/cake17.jpg",
    description: "Colorful and delicious cupcakes perfect for any birthday bash.",
  },
  {
    id: 3,
    title: "Classic Scones for Tea Time",
    category: "Pastries", // New category for gallery
    image: "/cakes/cake18.jpg",
    description: "Warm, freshly baked scones served with cream and jam.",
  },
  {
    id: 4,
    title: "Artisanal Pastry Spread",
    category: "Corporate Events",
    image: "/cakes/wed.jpg",
    description: "An exquisite selection of handcrafted pastries for discerning tastes.",
  },
  {
    id: 5,
    title: "Dadda's Signature Chocolate Cake",
    category: "Signature", // New category for gallery
    image: "/cakes/cake5.jpg",
    description: "Our famous rich and decadent chocolate layer cake.",
  },
  {
    id: 6,
    title: "Joyful Celebration Cake",
    category: "Wedding",
    image: "/cakes/wedding.jpg",
    description: "A beautiful custom cake designed for a joyous celebration.",
  },
  {
    id: 7,
    title: "Detailed Wedding Cake Art",
    category: "Wedding",
    image: "/cakes/cake7.jpg",
    description: "Close-up showcasing the intricate details of a wedding cake.",
  },
  {
    id: 8,
    title: "Fun Birthday Party Cake",
    category: "Birthday",
    image: "/cakes/cake18.jpg",
    description: "A festive cake that's the highlight of any birthday party.",
  },
  {
    id: 9,
    title: "Whimsical Children's Cake",
    category: "Children's Party",
    image: "/cakes/cake9.jpg",
    description: "A playful and imaginative cake designed for children's parties.",
  },
  {
    id: 10,
    title: "Elegant Corporate Desserts",
    category: "Corporate Events",
    image: "/cakes/cake10.jpg",
    description: "Sophisticated desserts perfect for corporate gatherings.",
  },
  {
    id: 11,
    title: "Unicorn Fantasy Creation",
    category: "Children's Party",
    image: "/cakes/cake11.jpg",
    description: "A magical unicorn cake that brings dreams to life.",
  },
  {
    id: 12,
    title: "Rustic Naked Wedding Charm",
    category: "Wedding",
    image: "/cakes/cake12.jpg",
    description: "A beautifully simple rustic naked cake for a charming wedding.",
  },
]

// Available filters
const categories = [
  "All",
  "Wedding",
  "Birthday",
  "Anniversary",
  "Children's Party",
  "Corporate Events",
  "Pastries",
  "Signature",
]

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // Filter gallery items based on selected category
  const filteredItems =
    selectedCategory === "All" ? galleryItems : galleryItems.filter((item) => item.category === selectedCategory)

  // Handle opening the modal
  const openModal = (id: number) => {
    setSelectedImage(id)
    document.body.style.overflow = "hidden"
  }

  // Handle closing the modal
  const closeModal = () => {
    setSelectedImage(null)
    document.body.style.overflow = "auto"
  }

  // Get the selected image data
  const selectedImageData = selectedImage !== null ? galleryItems.find((item) => item.id === selectedImage) : null

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-dadda-green-light">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Cake Gallery</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Browse our portfolio of custom cake creations and confections for various events and celebrations.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full transition-all duration-300 font-medium ${
                  selectedCategory === category
                    ? "bg-dadda-green text-brown-dark shadow-lg"
                    : "bg-white text-brown-dark hover:bg-dadda-green-light border border-dadda-green"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
                onClick={() => openModal(item.id)}
              >
                <LazyImage
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-">
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-dadda-green-light">{item.category}</p>
                    <p className="text-xs mt-2 opacity-90">{item.description}</p>
                  </div>
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-dadda-green text-white text-xs font-medium py-1 px-3 rounded-full">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Image Modal */}
      {selectedImage !== null && selectedImageData && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 text-white text-xl font-bold hover:text-dadda-green transition-colors"
              onClick={closeModal}
            >
              Close ×
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative aspect-[4/3]">
                <LazyImage
                  src={selectedImageData.image || "/placeholder.svg"}
                  alt={selectedImageData.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-brown-dark">{selectedImageData.title}</h3>
                  <span className="bg-dadda-green text-white text-sm font-medium py-1 px-3 rounded-full">
                    {selectedImageData.category}
                  </span>
                </div>
                <p className="text-brown-medium text-lg">{selectedImageData.description}</p>
                <div className="mt-4 flex gap-3">
                  <Link href="/order" className="btn-primary" onClick={closeModal}>
                    Order Similar
                  </Link>
                  <Link href="/cakes" className="btn-secondary" onClick={closeModal}>
                    View More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
