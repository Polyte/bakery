import Link from "next/link"
import { ArrowRight, Heart, Cake, Users, Gift } from "lucide-react"
import TestimonialCard from "@/components/testimonial-card"
import EventCategoryCard from "@/components/event-category-card"
import FeaturedCakeCard from "@/components/featured-cake-card"
import HeroCarousel from "@/components/hero-carousel"
import LazyImage from "@/components/lazy-image"

export default function Home() {
  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Event Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">Cakes for Every Celebration</h2>
          <p className="section-subtitle text-center">
            From intimate gatherings to grand celebrations, we create custom cakes that perfectly capture the essence of
            your special moments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-12">
            <EventCategoryCard
              title="Wedding"
              image="/cakes/wedding.jpg"
              href="/cakes/wedding"
              icon={<Heart className="h-6 w-6" />}
            />
            <EventCategoryCard
              title="Birthday"
              image="/hero/image5.jpg"
              href="/cakes/birthday"
              icon={<Cake className="h-6 w-6" />}
            />
            <EventCategoryCard
              title="Anniversary"
              image="/hero/image7.jpg"
              href="/cakes/anniversary"
              icon={<Gift className="h-6 w-6" />}
            />
            <EventCategoryCard
              title="Children's Party"
              image="/hero/image6.jpg"
              href="/cakes/children"
              icon={<Users className="h-6 w-6" />}
            />
            <EventCategoryCard
              title="Corporate Events"
              image="/cakes/cake23.jpg"
              href="/cakes/corporate"
              icon={<Users className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Featured Cakes */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">Our <span style={{ color: "#81a969" }}>Signature</span> Creations</h2>
          <p className="section-subtitle text-center">
            Discover our most beloved cake designs that have brought joy to countless celebrations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <FeaturedCakeCard
              title="Garden Rose Wedding Cake"
              description="Three-tier vanilla sponge with buttercream roses and delicate sugar flowers."
              image="/hero/Image9.jpg"
              category="Wedding"
              price="From R3800"
              href="/cakes/wedding/garden-rose"
            />
            <FeaturedCakeCard
              title="Chocolate Cherry Delight"
              description="Rich chocolate cake with fresh cherries and ganache drip, topped with a signature cherry."
              image="/hero/Image2.jpg"
              category="Birthday"
              price="From R850"
              href="/cakes/birthday/chocolate-cherry"
            />
            <FeaturedCakeCard
              title="Enchanted Castle Cake"
              description="Magical castle cake with turrets and flags, perfect for little princesses and princes."
              image="/hero/Image3.jpg"
              category="Children's Party"
              price="From R1200"
              href="/cakes/children/enchanted-castle"
            />
          </div>

          <div className="text-center mt-12">
            <Link href="/cakes" className="btn-primary inline-flex items-center">
              View All Cakes <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-dadda-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <LazyImage
                src="/hero/Image10.jpg"
                alt="About Dadda's Confectionery"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="section-title"><span style={{ color: "#81a969" }}>A Legacy of Sweet</span> Traditions</h2>
              <p className="text-lg mb-6">
                Dadda's Confectionery is a premier bakery located in the heart of Pretoria, South Africa. Established
                with a passion for creating delicious and visually stunning baked goods, we cater to a wide array of
                occasions, ensuring every celebration is unforgettable.
              </p>
              <p className="text-lg mb-8">
                Our mission is to bring joy and sweetness to every occasion with our meticulously crafted confections.
                We strive to exceed our customers' expectations through innovation, quality ingredients, and
                personalized service.
              </p>
              <Link href="/about" className="btn-primary inline-flex items-center">
                Our Story <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">Sweet Words from Our Customers</h2>
          <p className="section-subtitle text-center">
            Nothing makes us happier than hearing about the joy our cakes bring to your celebrations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <TestimonialCard
              name="Sarah & Michael Johnson"
              role="Wedding Couple"
              image="/happy-couple-park.png"
              rating={5}
              testimonial="Our wedding cake from Dadda's was absolutely perfect! Not only was it the most beautiful cake we'd ever seen, but it tasted incredible. Every guest asked where we got it. Thank you for making our day so special!"
            />
            <TestimonialCard
              name="Maria Rodriguez"
              role="Mother"
              image="/smiling-mother.png"
              rating={5}
              testimonial="The princess castle cake for my daughter's 6th birthday was magical! The attention to detail was amazing, and my little girl's face lit up when she saw it. Dadda's truly bakes with love."
            />
            <TestimonialCard
              name="James Thompson"
              role="Corporate Client"
              image="/professional-client.png"
              rating={5}
              testimonial="We've been ordering from Dadda's for all our corporate events for three years now. Their professionalism, quality, and reliability are unmatched. They always deliver exactly what we need, when we need it."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brown-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <LazyImage
              src="/images/dadda-logo.png"
              alt="Dadda's Confectionery"
              width={80}
              height={80}
              className="h-16 w-16 object-contain mx-auto mb-6"
            />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Create Sweet Memories?</h2>
            <p className="text-xl mb-8">
              Let us bring your cake dreams to life. Contact us today to discuss your custom cake requirements and let's
              create something truly special together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/order" className="btn-primary bg-dadda-primary hover:bg-dadda-primary-dark">
                Start Your Order
              </Link>
              <Link
                href="/gallery"
                className="btn-secondary border-white text-white hover:bg-white hover:text-brown-dark"
              >
                View Our Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
