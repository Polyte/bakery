import Link from "next/link"
import LazyImage from "@/components/lazy-image"

export default function GalleryRedirectPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-dadda-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dadda-primary">Our Gallery</h1>
          <p className="text-xl max-w-2xl mx-auto text-brown-dark">
            Explore our portfolio of custom cakes and confections. Visit the <Link href="/gallery" className="text-dadda-primary underline">Gallery page</Link> to see our creations!
          </p>
        </div>
      </section>
    </>
  )
}
