import Link from "next/link"
import LazyImage from "./lazy-image"

interface FeaturedCakeCardProps {
  title: string
  description: string
  image: string
  category: string
  price: string
  href: string
}

export default function FeaturedCakeCard({ title, description, image, category, price, href }: FeaturedCakeCardProps) {
  let cakeImage = image

  if (!cakeImage) {
    if (category === "Wedding") {
      cakeImage = "/images/generated/image2.jpg"
    } else if (category === "Birthday") {
      cakeImage = "/images/generated/image4.jpg"
    } else if (category === "Children's Party") {
      cakeImage = "/images/generated/image5.jpg"
    } else {
      cakeImage = "/featured-cake.png" // Fallback placeholder
    }
  }

  const formatPrice = (priceString: string) => {
    return priceString.replace(/\$(\d+)/g, "R$1")
  }

  return (
    <div className="card overflow-hidden h-full flex flex-col group">
      <div className="relative h-64 overflow-hidden">
        <LazyImage
          src={cakeImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-dadda-primary text-white text-sm font-medium py-2 px-4 rounded-full shadow-lg">
          {category}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-3 text-brown-dark">{title}</h3>
        <p className="text-brown-medium mb-4 flex-grow leading-relaxed">{description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl text-dadda-primary">{formatPrice(price)}</span>
          <Link href={href} className="text-dadda-primary hover:text-dadda-primary-dark font-medium transition-colors">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}
