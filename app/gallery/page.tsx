import fs from "fs"
import path from "path"
import type { Metadata } from "next"
import GalleryClient from "./GalleryClient"

export const metadata: Metadata = {
  title: "Our Cake Gallery",
}

// Curated base items (kept from previous implementation)
const curatedItems = [
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
    category: "Pastries",
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
    category: "Signature",
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

function toTitle(name: string) {
  const base = name.replace(/\.[^/.]+$/, "").replace(/[._-]+/g, " ")
  return base
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ")
}

export default async function GalleryPage() {
  const cakesDir = path.join(process.cwd(), "public", "cakes")
  let dynamicItems: {
    id: number
    title: string
    category: string
    image: string
    description: string
  }[] = []

  try {
    const files = fs.readdirSync(cakesDir)
    const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]) // include common formats
    const startId = curatedItems.length + 1

    dynamicItems = files
      .filter((f) => allowed.has(path.extname(f).toLowerCase()))
      .map((file, idx) => ({
        id: startId + idx,
        title: toTitle(file),
        category: "Gallery",
        image: `/cakes/${file}`,
        description: "From our cakes collection.",
      }))
  } catch (e) {
    // If the directory doesn't exist or reading fails, proceed with curated only
    dynamicItems = []
  }

  // Merge curated with dynamic, preferring unique images
  const seen = new Set<string>()
  const allItems = [...curatedItems, ...dynamicItems].filter((it) => {
    if (seen.has(it.image)) return false
    seen.add(it.image)
    return true
  })

  const categories = Array.from(new Set(["All", ...allItems.map((i) => i.category)]))

  return <GalleryClient items={allItems} categories={categories} />
}
