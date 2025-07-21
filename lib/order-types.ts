export interface PastryOption {
  id: string
  name: string
  price: number // Price in ZAR
}

export interface PastryCategory {
  id: string
  name: string
  basePrice: number // Base price in ZAR
  sizes?: PastryOption[]
  flavors?: PastryOption[]
  fillings?: PastryOption[]
  frostings?: PastryOption[]
  decorations?: PastryOption[]
  quantityMultipliers?: {
    [key: number]: number // e.g. { 6: 1, 12: 0.95 } for discount
  }
  supportsMessage?: boolean
  supportsDesignRequest?: boolean
}

export interface OrderItem {
  pastryType: string
  size?: string
  flavor?: string
  filling?: string[]
  frosting?: string
  decoration?: string
  quantity: number
  personalizedMessage?: string
  designRequest?: string
  itemPrice: number // Price for this item in ZAR
  id?: string // Optional: for cart item identification
}

export interface OrderDetails {
  customerName: string
  customerEmail: string
  customerPhone: string
  eventDate?: string
  deliveryOption: "pickup" | "delivery"
  deliveryAddress?: string
  items: OrderItem[]
  totalPrice: number // Total price in ZAR
  paymentMethod: string // Simulated
  specialInstructions?: string
}

export interface OrderResponse {
  success: boolean
  message: string
  orderId?: string
  orderDetails?: OrderDetails
}
