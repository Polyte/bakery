import LazyImage from "./lazy-image" // Using LazyImage
import Link from "next/link"
import type { ReactNode } from "react"

interface EventCategoryCardProps {
  title: string
  image: string
  href: string
  icon: ReactNode
}

export default function EventCategoryCard({ title, image, href, icon }: EventCategoryCardProps) {
  return (
    <Link href={href} className="group">
      <div className="card overflow-hidden h-[300px] relative"> {/* Added fixed height */}
        <div className="absolute inset-0"> {/* Changed to absolute positioning */}
          <LazyImage
            src={image || "/placeholder.svg?height=256&width=256&query=category+cake"}
            alt={`${title} Cakes`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
            <div className="flex items-center text-white">
              <div className="mr-3 bg-dadda-red p-2 rounded-full">{icon}</div>
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
