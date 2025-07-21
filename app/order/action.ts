"use server"

import type { OrderDetails, OrderResponse } from "@/lib/order-types"

export async function submitOrder(orderDetails: OrderDetails): Promise<OrderResponse> {
  console.log("Order received on server:", JSON.stringify(orderDetails, null, 2))

  // --- Data Validation (Basic Example) ---
  if (!orderDetails.customerName || !orderDetails.customerEmail || !orderDetails.customerPhone) {
    return { success: false, message: "Missing required customer details. Please go back and fill them in." }
  }
  if (orderDetails.items.length === 0) {
    return { success: false, message: "Cannot place an order with an empty cart." }
  }
  if (orderDetails.deliveryOption === "delivery" && !orderDetails.deliveryAddress) {
    return { success: false, message: "Delivery address is required for delivery orders. Please go back and add it." }
  }
  // Validate email format (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(orderDetails.customerEmail)) {
    return { success: false, message: "Invalid email address format." }
  }

  // --- Simulate Payment Processing ---
  const paymentSuccessful = true
  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (!paymentSuccessful) {
    return { success: false, message: "Payment processing failed. Please try again." }
  }

  // --- Simulate Saving Order to Database ---
  const orderId = `DADDAS-${Date.now().toString().slice(-6)}`
  console.log(`Order ${orderId} "saved" successfully.`)

  // --- Simulate Sending Confirmation Emails ---
  console.log(`Confirmation email "sent" to ${orderDetails.customerEmail}`)
  console.log(`New order notification "sent" to bakery admin.`)

  return {
    success: true,
    message: `Order #${orderId} placed successfully! We'll be in touch soon.`,
    orderId: orderId,
    orderDetails: orderDetails,
  }
}
