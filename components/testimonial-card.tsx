import LazyImage from "./lazy-image" // Using LazyImage
import { Star } from "lucide-react"

interface TestimonialCardProps {
  name: string
  role: string
  image: string
  rating: number
  testimonial: string
}

export default function TestimonialCard({ name, role, image, rating, testimonial }: TestimonialCardProps) {
  return (
    <div className="card p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          <LazyImage // Using LazyImage
            src={image || "/placeholder.svg?height=48&width=48&query=person+avatar"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-sm text-brown-medium">{role}</p>
        </div>
      </div>

      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < rating ? "fill-dadda-red text-dadda-red" : "text-gray-300"}`} />
        ))}
      </div>

      <p className="text-brown-dark italic flex-grow">{testimonial}</p>
    </div>
  )
}
