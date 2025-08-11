"use client"

import { useState } from "react"
import Link from "next/link"
import LazyImage from "@/components/lazy-image"

export type GalleryItem = {
  id: number
  title: string
  category: string
  image: string
  description: string
}

export default function GalleryClient({
  items,
  categories,
}: {
  items: GalleryItem[]
  categories: string[]
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const filteredItems =
    selectedCategory === "All" ? items : items.filter((item) => item.category === selectedCategory)

  const openModal = (id: number) => {
    setSelectedImage(id)
    if (typeof document !== "undefined") document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setSelectedImage(null)
    if (typeof document !== "undefined") document.body.style.overflow = "auto"
  }

  const selectedImageData = selectedImage !== null ? items.find((i) => i.id === selectedImage) : null

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
                  <div className="text-white">
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

      {/* Image Modal */}
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
