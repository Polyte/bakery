"use client"

import { useState } from "react"
import Link from "next/link"
import { Filter, ChevronDown } from "lucide-react"
import LazyImage from '@/components/lazy-image'

// Sample cake data
const cakes = [
  {
    id: 1,
    title: "Elegant Rose Wedding Cake",
    category: "Wedding",
    flavors: ["Vanilla", "Buttercream"],
    price: 3500,
    image: "/cakes/cake3.jpg",
    slug: "elegant-rose",
  },
  {
    id: 2,
    title: "Chocolate Drip Birthday Cake",
    category: "Birthday",
    flavors: ["Chocolate", "Ganache"],
    price: 850,
    image: "/images/generated/cake-chocolate-drip.png",
    slug: "chocolate-drip",
  },
  {
    id: 3,
    title: "Unicorn Fantasy Cake",
    category: "Children's Party",
    flavors: ["Rainbow", "Vanilla"],
    price: 950,
    image: "/images/generated/cake-unicorn-fantasy.png",
    slug: "unicorn-fantasy",
  },
  {
    id: 4,
    title: "Golden Anniversary Cake",
    category: "Anniversary",
    flavors: ["Red Velvet", "Cream Cheese"],
    price: 1200,
    image: "/images/generated/cake-golden-anniversary.png",
    slug: "golden-anniversary",
  },
  {
    id: 5,
    title: "Corporate Logo Cake",
    category: "Corporate Events",
    flavors: ["Vanilla", "Chocolate"],
    price: 1500,
    image: "/images/generated/cake-corporate-logo.png",
    slug: "corporate-logo",
  },
  {
    id: 6,
    title: "Rustic Naked Wedding Cake",
    category: "Wedding",
    flavors: ["Lemon", "Vanilla"],
    price: 3200,
    image: "/images/generated/cake-rustic-naked.png",
    slug: "rustic-naked",
  },
  {
    id: 7,
    title: "Superhero Birthday Cake",
    category: "Birthday",
    flavors: ["Chocolate", "Vanilla"],
    price: 900,
    image: "/images/generated/cake-superhero.png",
    slug: "superhero",
  },
  {
    id: 8,
    title: "Princess Castle Cake",
    category: "Children's Party",
    flavors: ["Strawberry", "Vanilla"],
    price: 1100,
    image: "/cakes/cake6.jpg",
    slug: "princess-castle",
  },
  {
    id: 9,
    title: "Silver Jubilee Cake",
    category: "Anniversary",
    flavors: ["Coconut", "Vanilla"],
    price: 1300,
    image: "/cakes/cake8.jpg",
    slug: "silver-jubilee",
  },
  {
    id: 10,
    title: "Product Launch Cake",
    category: "Corporate Events",
    flavors: ["Chocolate", "Caramel"],
    price: 1800,
    image: "/cakes/cake8.jpg",
    slug: "product-launch",
  },
]

// Available filters
const categories = ["All", "Wedding", "Birthday", "Anniversary", "Children's Party", "Corporate Events"]
const flavors = [
  "All",
  "Vanilla",
  "Chocolate",
  "Red Velvet",
  "Lemon",
  "Strawberry",
  "Coconut",
  "Rainbow",
  "Caramel",
  "Buttercream",
  "Ganache",
  "Cream Cheese",
]
const priceRanges = ["All", "Under R1000", "R1000 - R2000", "R2000 - R3000", "Over R3000"]

export default function CakesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedFlavor, setSelectedFlavor] = useState("All")
  const [selectedPriceRange, setSelectedPriceRange] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  // Filter cakes based on selected filters
  const filteredCakes = cakes.filter((cake) => {
    // Category filter
    if (selectedCategory !== "All" && cake.category !== selectedCategory) {
      return false
    }

    // Flavor filter
    if (selectedFlavor !== "All" && !cake.flavors.includes(selectedFlavor)) {
      return false
    }

    // Price range filter
    if (selectedPriceRange !== "All") {
      if (selectedPriceRange === "Under R1000" && cake.price >= 1000) {
        return false
      } else if (selectedPriceRange === "R1000 - R2000" && (cake.price < 1000 || cake.price > 2000)) {
        return false
      } else if (selectedPriceRange === "R2000 - R3000" && (cake.price < 2000 || cake.price > 3000)) {
        return false
      } else if (selectedPriceRange === "Over R3000" && cake.price <= 3000) {
        return false
      }
    }

    return true
  })

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-pink-light">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Cake Collection</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Browse our extensive range of custom cakes for every occasion. Filter by category, flavor, or price to find
            your perfect cake.
          </p>
        </div>
      </section>

      {/* Cake Catalog */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-6">
            <button
              className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                <span>Filter Cakes</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters */}
            <div className={`md:w-1/4 ${showFilters ? "block" : "hidden"} md:block`}>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-6">Filter Cakes</h2>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="mr-2"
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Flavor Filter */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Flavor</h3>
                  <select
                    value={selectedFlavor}
                    onChange={(e) => setSelectedFlavor(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {flavors.map((flavor) => (
                      <option key={flavor} value={flavor}>
                        {flavor}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-bold mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range}
                          checked={selectedPriceRange === range}
                          onChange={() => setSelectedPriceRange(range)}
                          className="mr-2"
                        />
                        {range}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cake Grid */}
            <div className="md:w-3/4">
              {filteredCakes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCakes.map((cake) => (
                    <Link
                      href={`/cakes/${cake.category.toLowerCase().replace("'s", "").replace(" ", "-")}/${cake.slug}`}
                      key={cake.id}
                    >
                      <div className="card overflow-hidden h-full flex flex-col">
                        <div className="relative h-64 overflow-hidden">
                          <LazyImage
                            src={cake.image || "/placeholder.svg"}
                            alt={cake.title}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-4 left-4 bg-pink-primary text-white text-sm font-medium py-1 px-3 rounded-full">
                            {cake.category}
                          </div>
                        </div>

                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold mb-2">{cake.title}</h3>
                          <p className="text-brown-medium mb-2">Flavors: {cake.flavors.join(", ")}</p>
                          <div className="mt-auto pt-4">
                            <span className="font-bold text-lg">R{cake.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">No cakes found</h3>
                  <p>Try adjusting your filters to see more options.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-pink-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't See What You're Looking For?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            We specialize in custom cakes designed specifically for your event. Contact us to discuss your dream cake!
          </p>
          <Link href="/contact" className="btn-primary">
            Request Custom Cake
          </Link>
        </div>
      </section>
    </>
  )
}
