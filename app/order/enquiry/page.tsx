import Link from "next/link"
import OrderForm from "@/components/order-form"
import { Separator } from "@/components/ui/separator"
import SeoGraph from "@/components/seo-graph"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/order/enquiry")

export default function OrderEnquiryPage() {
  return (
    <>
      <SeoGraph path="/order/enquiry" />
      <section className="bg-dadda-primary/10 pb-12 pt-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-dadda-primary md:text-5xl" data-animate="fade-up">
            Create Your Custom Cake Order in Pretoria
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-brown-dark" data-animate="fade-up">
            Design your perfect cake, cupcakes, or other delightful treats with our easy-to-use order form. Let&apos;s
            bake something special for your occasion!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/order/filling" className="btn-primary inline-flex" data-animate="fade-up">
              Configure a Signature Cake
            </Link>
            <Link
              href="/order"
              className="inline-flex rounded-full border border-dadda-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest text-dadda-primary hover:bg-dadda-primary/10"
              data-animate="fade-up"
            >
              Back to Order Now
            </Link>
          </div>
        </div>
      </section>
      <Separator />
      <section className="bg-cream py-12">
        <div className="container mx-auto px-4" data-animate="fade-up">
          <OrderForm />
        </div>
      </section>
    </>
  )
}
