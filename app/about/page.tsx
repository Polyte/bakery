import LazyImage from '@/components/lazy-image'
import Link from "next/link"

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-dadda-green-light">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Dadda's Confectionery</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Our story, our passion, and our commitment to creating the perfect confection for your special moments.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <LazyImage // Using LazyImage
                src="/cakes/cake1.jpg"
                alt="Our artisanal pastries"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="section-title">Our Story</h2>
              <p className="text-lg mb-6">
                Dadda's Confectionery is a premier bakery located in the heart of Pretoria, South Africa. Established
                with a passion for creating delicious and visually stunning baked goods, we cater to a wide array of
                occasions, ensuring every celebration is unforgettable.
              </p>
              <p className="text-lg mb-6">
                What started as a small family dream has grown into a beloved local institution, known for our attention
                to detail, exceptional taste, and stunning designs. Today, our team of skilled pastry chefs and cake
                artists continues to craft edible works of art for all occasions.
              </p>
              <p className="text-lg">
                Our commitment to quality and creativity sets us apart, making us a beloved choice for all things sweet.
                From intimate family gatherings to grand celebrations, we're honored to be part of so many special
                moments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-dadda-green-light p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-brown-dark">Our Mission</h3>
              <p className="text-lg">
                Our mission is to bring joy and sweetness to every occasion with our meticulously crafted confections.
                We strive to exceed our customers' expectations through innovation, quality ingredients, and
                personalized service.
              </p>
            </div>
            <div className="bg-cream p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-brown-dark">Our Vision</h3>
              <p className="text-lg">
                To be the best cake confectionery company in all of South Africa, serving memorable occasions including
                weddings, anniversaries, birthday celebrations, corporate and private parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Specialties with Images */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">Our Specialties</h2>
          <p className="section-subtitle text-center">
            We offer an extensive range of baked goods to suit every occasion and taste.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <div className="card overflow-hidden">
              <div className="relative h-48">
                <LazyImage // Using LazyImage
                  src="/cakes/cake11.jpg"
                  alt="Custom Cupcakes"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Custom Cupcakes</h3>
                <p>
                  Beautifully decorated cupcakes perfect for any celebration, from simple elegance to elaborate themes.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="relative h-48">
                <LazyImage // Using LazyImage
                  src="/cakes/cake45.jpg"
                  alt="French Macarons"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">French Macarons</h3>
                <p>Delicate and sophisticated macarons in a variety of flavors and colors for elegant occasions.</p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="relative h-48">
                <LazyImage // Using LazyImage
                  src="/cakes/cake13.jpg"
                  alt="Themed Cakes"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Themed Cakes</h3>
                <p>
                  Elaborate custom cakes that bring your imagination to life, perfect for children's parties and special
                  themes.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="relative h-48">
                <LazyImage // Using LazyImage
                  src="/cakes/cake20.jpg"
                  alt="Gourmet Treats"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Gourmet Treats</h3>
                <p>Premium individual treats featuring fresh fruits, rich chocolates, and artisanal techniques.</p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="relative h-48">
                <LazyImage // Using LazyImage
                  src="/cakes/cake35.jpg"
                  alt="Wedding Cakes"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Wedding Cakes</h3>
                <p>
                  Elegant wedding cakes with intricate designs and beautiful floral decorations for your special day.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="relative h-48">
                <LazyImage // Using LazyImage
                  src="/cakes/cake32.jpg"
                  alt="Artisan Pastries"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Artisan Pastries</h3>
                <p>Handcrafted pastries with seasonal fruits and premium ingredients for the discerning palate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-brown-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Dream Confection?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Contact us today to schedule a consultation and let us bring your sweetest visions to life!
          </p>
          <Link href="/contact" className="btn-primary bg-dadda-red hover:bg-dadda-red-dark">
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  )
}
