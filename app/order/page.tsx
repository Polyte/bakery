import OrderForm from "@/components/order-form"
import { Separator } from "@/components/ui/separator"

export default function OrderPage() {
  return (
    <>
      <section className="pt-32 pb-12 bg-dadda-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dadda-primary">Create Your Custom Order</h1>
          <p className="text-xl max-w-3xl mx-auto text-brown-dark">
            Design your perfect cake, cupcakes, or other delightful treats with our easy-to-use order form. Let's bake
            something special for your occasion!
          </p>
        </div>
      </section>
      <Separator />
      <section className="py-12 bg-cream">
        <div className="container mx-auto px-4">
          <OrderForm />
        </div>
      </section>
    </>
  )
}
