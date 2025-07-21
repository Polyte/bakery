"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { pastryCategories } from "@/lib/pastry-data"
import type { PastryCategory, OrderItem, OrderDetails } from "@/lib/order-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { ShoppingCart, Send } from "lucide-react"
import { submitOrder } from "@/app/order/action"

const initialOrderItemState: OrderItem = {
  pastryType: pastryCategories[0].id,
  quantity: 1,
  itemPrice: pastryCategories[0].basePrice,
}

export default function OrderForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    deliveryOption: "pickup",
    deliveryAddress: "",
    specialInstructions: "",
  })
  const [currentOrderItem, setCurrentOrderItem] = useState<OrderItem>(initialOrderItemState)
  const [cart, setCart] = useState<OrderItem[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedPastryCategory, setSelectedPastryCategory] = useState<PastryCategory>(pastryCategories[0])
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCustomerDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setCustomerDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: keyof typeof customerDetails, value: string) => {
    setCustomerDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleOrderItemChange = (field: keyof OrderItem, value: any) => {
    setCurrentOrderItem((prev) => ({ ...prev, [field]: value }))
  }

  const handleMultiSelectChange = (field: keyof OrderItem, optionId: string) => {
    setCurrentOrderItem((prev) => {
      const currentValues = (prev[field] as string[] | undefined) || []
      const newValues = currentValues.includes(optionId)
        ? currentValues.filter((v) => v !== optionId)
        : [...currentValues, optionId]
      return { ...prev, [field]: newValues }
    })
  }

  const calculateItemPrice = useCallback(() => {
    if (!selectedPastryCategory) return 0

    let price = 0
    // For cakes, the size price is the full price (not base + size)
    if (selectedPastryCategory.id === "cake" && currentOrderItem.size && selectedPastryCategory.sizes) {
      const sizeOpt = selectedPastryCategory.sizes.find((s) => s.id === currentOrderItem.size)
      if (sizeOpt) price = sizeOpt.price
    } else {
      price = selectedPastryCategory.basePrice
      if (currentOrderItem.size && selectedPastryCategory.sizes) {
        const sizeOpt = selectedPastryCategory.sizes.find((s) => s.id === currentOrderItem.size)
        if (sizeOpt) price += sizeOpt.price
      }
    }
    if (currentOrderItem.flavor && selectedPastryCategory.flavors) {
      const flavorOpt = selectedPastryCategory.flavors.find((f) => f.id === currentOrderItem.flavor)
      if (flavorOpt) price += flavorOpt.price
    }
    if (currentOrderItem.frosting && selectedPastryCategory.frostings) {
      const frostingOpt = selectedPastryCategory.frostings.find((f) => f.id === currentOrderItem.frosting)
      if (frostingOpt) price += frostingOpt.price
    }
    if (currentOrderItem.decoration && selectedPastryCategory.decorations) {
      const decoOpt = selectedPastryCategory.decorations.find((d) => d.id === currentOrderItem.decoration)
      if (decoOpt)
        price +=
          decoOpt.price *
          (selectedPastryCategory.id === "cupcakes" || selectedPastryCategory.id === "cookies"
            ? currentOrderItem.quantity
            : 1)
    }

    if (currentOrderItem.filling && selectedPastryCategory.fillings) {
      ;(currentOrderItem.filling as string[]).forEach((fillingId) => {
        const fillingOpt = selectedPastryCategory.fillings?.find((f) => f.id === fillingId)
        if (fillingOpt) price += fillingOpt.price
      })
    }

    if (selectedPastryCategory.id === "cupcakes" || selectedPastryCategory.id === "cookies") {
      price *= currentOrderItem.quantity
    } else if (selectedPastryCategory.id === "cake" || selectedPastryCategory.id === "tarts") {
      price *= currentOrderItem.quantity
    }

    return price
  }, [
    selectedPastryCategory,
    currentOrderItem.size,
    currentOrderItem.flavor,
    currentOrderItem.filling, // Array reference stability is important here
    currentOrderItem.frosting,
    currentOrderItem.decoration,
    currentOrderItem.quantity,
  ])

  useEffect(() => {
    const newPrice = calculateItemPrice()
    setCurrentOrderItem((prev) => {
      if (prev.itemPrice !== newPrice) {
        return { ...prev, itemPrice: newPrice }
      }
      return prev
    })
  }, [calculateItemPrice]) // Now only depends on the memoized calculateItemPrice

  useEffect(() => {
    const newCategory = pastryCategories.find((p) => p.id === currentOrderItem.pastryType) || pastryCategories[0]
    setSelectedPastryCategory(newCategory) // Update derived state

    const defaultQuantity = newCategory.id === "cake" || newCategory.id === "tarts" ? 1 : 12
    // Calculate a *base* item price for the reset state. The other effect will refine it.
    const baseItemPriceForReset =
      newCategory.basePrice * (newCategory.id === "cupcakes" || newCategory.id === "cookies" ? defaultQuantity : 1)

    setCurrentOrderItem((prev) => ({
      // Preserve previous ID if it exists, though not typical for currentOrderItem before cart
      // id: prev.id,
      pastryType: newCategory.id,
      quantity: defaultQuantity,
      itemPrice: baseItemPriceForReset, // Set an initial price
      size: newCategory.sizes?.[0]?.id,
      flavor: newCategory.flavors?.[0]?.id,
      filling: [], // Always reset fillings
      frosting: newCategory.frostings?.[0]?.id,
      decoration: newCategory.decorations?.[0]?.id,
      personalizedMessage: "", // Reset personalized message
      designRequest: "", // Reset design request
    }))
  }, [currentOrderItem.pastryType]) // Only depends on pastryType

  useEffect(() => {
    const cartTotal = cart.reduce((sum, item) => sum + item.itemPrice, 0)
    setTotalPrice(cartTotal)
  }, [cart])

  const addItemToCart = () => {
    if (
      currentOrderItem.itemPrice <= 0 &&
      selectedPastryCategory.basePrice > 0 &&
      selectedPastryCategory.id !== "cupcakes" &&
      selectedPastryCategory.id !== "cookies"
    ) {
      setFormFeedback({ type: "error", message: "Please make selections for your item." })
      return
    }
    setCart((prev) => [...prev, { ...currentOrderItem, id: Date.now().toString() }])

    const defaultQuantity = selectedPastryCategory.id === "cake" || selectedPastryCategory.id === "tarts" ? 1 : 12
    const baseItemPrice =
      selectedPastryCategory.basePrice *
      (selectedPastryCategory.id === "cake" || selectedPastryCategory.id === "tarts" ? 1 : defaultQuantity)

    setCurrentOrderItem({
      pastryType: selectedPastryCategory.id, // Keep current pastry type
      quantity: defaultQuantity,
      itemPrice: baseItemPrice,
      size: selectedPastryCategory.sizes?.[0]?.id,
      flavor: selectedPastryCategory.flavors?.[0]?.id,
      filling: [],
      frosting: selectedPastryCategory.frostings?.[0]?.id,
      decoration: selectedPastryCategory.decorations?.[0]?.id,
      personalizedMessage: "",
      designRequest: "",
    })
    setFormFeedback({ type: "success", message: `${selectedPastryCategory.name} added to cart!` })
    setTimeout(() => setFormFeedback(null), 3000)
  }

  const removeItemFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) {
      setFormFeedback({ type: "error", message: "Your cart is empty. Please add items before placing an order." })
      return
    }
    setIsSubmitting(true)
    setFormFeedback(null)

    const orderData: OrderDetails = {
      ...customerDetails,
      items: cart,
      totalPrice: totalPrice,
      paymentMethod: "Credit Card (Simulated)",
    }

    const result = await submitOrder(orderData)
    setFormFeedback({ type: result.success ? "success" : "error", message: result.message })
    setIsSubmitting(false)

    if (result.success) {
      setCurrentStep(3)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Item Customization & Cart
        return (
          <>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-dadda-primary flex items-center">
                      <ShoppingCart className="mr-2 h-6 w-6" /> Customize Your Item
                    </CardTitle>
                    <CardDescription>Select pastry type and customize your options.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="pastryType" className="text-lg font-medium">
                        Pastry Type
                      </Label>
                      <Select
                        value={currentOrderItem.pastryType}
                        onValueChange={(value) => handleOrderItemChange("pastryType", value)}
                      >
                        <SelectTrigger id="pastryType" className="mt-1">
                          <SelectValue placeholder="Select a pastry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {pastryCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPastryCategory.sizes && (
                      <div>
                        <Label htmlFor="size" className="text-lg font-medium">
                          Size
                        </Label>
                        <Select
                          value={currentOrderItem.size}
                          onValueChange={(value) => handleOrderItemChange("size", value)}
                        >
                          <SelectTrigger id="size" className="mt-1">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedPastryCategory.sizes.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.name} (R{opt.price})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedPastryCategory.flavors && (
                      <div>
                        <Label htmlFor="flavor" className="text-lg font-medium">
                          Flavor
                        </Label>
                        <Select
                          value={currentOrderItem.flavor}
                          onValueChange={(value) => handleOrderItemChange("flavor", value)}
                        >
                          <SelectTrigger id="flavor" className="mt-1">
                            <SelectValue placeholder="Select flavor" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedPastryCategory.flavors.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.name} (+R{opt.price})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedPastryCategory.fillings && (
                      <div>
                        <Label className="text-lg font-medium">Cake Toppers (select multiple)</Label>
                        <div className="mt-2 space-y-2">
                          {selectedPastryCategory.fillings.map((opt) => (
                            <div key={opt.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`filling-${opt.id}`}
                                checked={(currentOrderItem.filling as string[] | undefined)?.includes(opt.id)}
                                onCheckedChange={() => handleMultiSelectChange("filling", opt.id)}
                              />
                              <Label htmlFor={`filling-${opt.id}`} className="font-normal">
                                {opt.name} (+R{opt.price})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPastryCategory.colours && (
                      <div>
                        <Label htmlFor="colour" className="text-lg font-medium">
                          Cake Color (if applicable)
                        </Label>
                        <Select
                          value={currentOrderItem.frosting}
                          onValueChange={(value) => handleOrderItemChange("colour", value)}
                        >
                          <SelectTrigger id="colour" className="mt-1">
                            <SelectValue placeholder="Select colour" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedPastryCategory.colours.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.name} (+R{opt.price})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedPastryCategory.decorations && (
                      <div>
                        <Label htmlFor="decoration" className="text-lg font-medium">
                          Decoration
                        </Label>
                        <Select
                          value={currentOrderItem.decoration}
                          onValueChange={(value) => handleOrderItemChange("decoration", value)}
                        >
                          <SelectTrigger id="decoration" className="mt-1">
                            <SelectValue placeholder="Select decoration" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedPastryCategory.decorations.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.name} (+R
                                {opt.price *
                                  (selectedPastryCategory.id === "cupcakes" || selectedPastryCategory.id === "cookies"
                                    ? currentOrderItem.quantity
                                    : 1)}
                                )
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="quantity" className="text-lg font-medium">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={currentOrderItem.quantity}
                        onChange={(e) => handleOrderItemChange("quantity", Number.parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                      {selectedPastryCategory.id === "cupcakes" && (
                        <p className="text-sm text-gray-500 mt-1">
                          Cupcakes are typically ordered in dozens (12, 24, etc.). Price is per Dozen.
                        </p>
                      )}
                      {selectedPastryCategory.id === "cookies" && (
                        <p className="text-sm text-gray-500 mt-1">
                          Cookies are typically ordered in dozens (12, 24, etc.). Price is per cookie.
                        </p>
                      )}
                    </div>

                    {selectedPastryCategory.supportsMessage && (
                      <div>
                        <Label htmlFor="personalizedMessage" className="text-lg font-medium">
                          Personalized Message
                        </Label>
                        <Textarea
                          id="personalizedMessage"
                          value={currentOrderItem.personalizedMessage || ""}
                          onChange={(e) => handleOrderItemChange("personalizedMessage", e.target.value)}
                          placeholder="E.g., Happy Birthday John!"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {selectedPastryCategory.supportsDesignRequest && (
                      <div>
                        <Label htmlFor="designRequest" className="text-lg font-medium">
                          Specific Design Requests
                        </Label>
                        <Textarea
                          id="designRequest"
                          value={currentOrderItem.designRequest || ""}
                          onChange={(e) => handleOrderItemChange("designRequest", e.target.value)}
                          placeholder="E.g., Blue and silver theme, superhero characters..."
                          className="mt-1"
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-4">
                    <div className="text-2xl font-bold text-right text-dadda-primary">
                      Item Price: R{currentOrderItem.itemPrice.toFixed(2)}
                    </div>
                    <Button onClick={addItemToCart} size="lg" className="w-full">
                      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-dadda-primary flex items-center">
                      <ShoppingCart className="mr-2 h-6 w-6" /> Your Cart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cart.length === 0 ? (
                      <p className="text-brown-medium">Your cart is empty.</p>
                    ) : (
                      <ul className="space-y-4">
                        {cart.map((item) => (
                          <li key={item.id} className="border p-4 rounded-lg bg-cream/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-brown-dark">
                                  {item.quantity}x {pastryCategories.find((p) => p.id === item.pastryType)?.name}
                                </h4>
                                <p className="text-sm text-brown-medium">
                                  {item.flavor &&
                                    `Flavor: ${pastryCategories.find((p) => p.id === item.pastryType)?.flavors?.find((f) => f.id === item.flavor)?.name}`}
                                  {item.size &&
                                    `, Size: ${pastryCategories.find((p) => p.id === item.pastryType)?.sizes?.find((s) => s.id === item.size)?.name}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-dadda-primary">R{item.itemPrice.toFixed(2)}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => removeItemFromCart(item.id!)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  {cart.length > 0 && (
                    <CardFooter className="flex flex-col items-stretch gap-4">
                      <div className="text-3xl font-bold text-right text-dadda-primary">
                        Total: R{totalPrice.toFixed(2)}
                      </div>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        size="lg"
                        className="w-full"
                        disabled={cart.length === 0}
                      >
                        Proceed to Checkout
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </div>
          </>
        )
      case 2: // Customer Details & Payment
        return (
          <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-dadda-primary">Customer & Delivery Details</CardTitle>
              <CardDescription>Please provide your information to complete the order.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitOrder}>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={customerDetails.name}
                      onChange={handleCustomerDetailsChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={handleCustomerDetailsChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={customerDetails.phone}
                    onChange={handleCustomerDetailsChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eventDate">Event Date (Optional)</Label>
                  <Input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    value={customerDetails.eventDate}
                    onChange={handleCustomerDetailsChange}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Delivery Option *</Label>
                  <RadioGroup
                    name="deliveryOption"
                    value={customerDetails.deliveryOption}
                    onValueChange={(value) => handleRadioChange("deliveryOption", value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Pickup from Bakery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery">Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>
                {customerDetails.deliveryOption === "delivery" && (
                  <div>
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={customerDetails.deliveryAddress}
                      onChange={handleCustomerDetailsChange}
                      required={customerDetails.deliveryOption === "delivery"}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions / Dietary Notes</Label>
                  <Textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={customerDetails.specialInstructions}
                    onChange={handleCustomerDetailsChange}
                    placeholder="Any allergies, specific requests, etc."
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mt-6 mb-2 text-dadda-primary">Payment (Simulated)</h3>
                  <p className="text-sm text-brown-medium">
                    This is a simulated payment section. In a real application, a payment gateway like Stripe or PayFast
                    would be integrated here.
                  </p>
                  <div className="mt-2 p-4 border border-dashed border-dadda-primary rounded-lg bg-dadda-primary/10">
                    <p className="font-semibold">Total Amount Due: R{totalPrice.toFixed(2)}</p>
                    <p className="text-xs">Payment will be "processed" successfully for this demo.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Cart
                </Button>
                <Button type="submit" disabled={isSubmitting || cart.length === 0} size="lg">
                  {isSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Place Order (R{totalPrice.toFixed(2)})
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )
      case 3: // Confirmation
        return (
          <Card className="shadow-lg max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto bg-dadda-primary text-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <Send className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl text-dadda-primary">Order Confirmed!</CardTitle>
              <CardDescription>{formFeedback?.message || "Thank you for your order."}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-brown-medium mb-6">
                We've received your order and will be in touch shortly to finalize details if needed. A confirmation
                email has been "sent" to {customerDetails.email}.
              </p>
              <div className="text-left border p-4 rounded-lg bg-cream/50 space-y-2">
                <h4 className="font-semibold text-lg text-brown-dark">Order Summary:</h4>
                {/* Display items from the successful order, not the current cart which is now empty */}
                {((formFeedback?.type === "success" && (formFeedback as any).orderDetails?.items) || cart).map(
                  (item: OrderItem, index: number) => (
                    <p key={item.id || index} className="text-sm">
                      {item.quantity}x {pastryCategories.find((p) => p.id === item.pastryType)?.name} - R
                      {item.itemPrice.toFixed(2)}
                    </p>
                  ),
                )}
                <p className="font-bold text-dadda-primary text-xl pt-2 border-t mt-2">
                  Total: R
                  {(
                    (formFeedback?.type === "success" && (formFeedback as any).orderDetails?.totalPrice) ||
                    totalPrice
                  ).toFixed(2)}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  setCurrentStep(1)
                  setCart([]) // Clear cart for new order
                  setCustomerDetails({
                    // Reset customer details
                    name: "",
                    email: "",
                    phone: "",
                    eventDate: "",
                    deliveryOption: "pickup",
                    deliveryAddress: "",
                    specialInstructions: "",
                  })
                  setFormFeedback(null) // Clear feedback
                }}
                className="w-full"
                size="lg"
              >
                Place Another Order
              </Button>
            </CardFooter>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {" "}
      {/* Changed from form to div to avoid nested forms if renderStepContent returns a form */}
      {formFeedback && (
        <div
          className={`p-4 rounded-md text-white ${formFeedback.type === "success" ? "bg-dadda-primary" : "bg-dadda-red"}`}
        >
          {formFeedback.message}
        </div>
      )}
      {renderStepContent()}
    </div>
  )
}
