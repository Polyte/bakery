import type { PastryCategory } from "./order-types"

export const pastryCategories: PastryCategory[] = [
  {
    id: "cake",
    name: "Cakes",
    basePrice: 3500,
    sizes: [
      { id: "2-tier-wedding", name: "2 Tier (Wedding)", price: 3500 },
      { id: "3-tier-wedding", name: "3 Tier (Wedding)", price: 5500 },
      { id: "15cm-fondant", name: "15cm (Fondant)", price: 1050 },
      { id: "17cm-fondant", name: "17cm (Fondant)", price: 1200 },
      { id: "20cm-fondant", name: "20cm (Fondant)", price: 1450 },
      { id: "2-tier-fondant", name: "2 Tier (Fondant)", price: 2500 },
    ],
    flavors: [
      { id: "vanilla", name: "Vanilla", price: 0 },
      { id: "chocolate", name: "Chocolate", price: 0 },
    ],
    fillings: [ 

      { id: "figurines", name: "Figurines", price: 80 },
      { id: "edible-print", name: "Edible Print", price: 100 },
      { id: "flossy-paper", name: "Flossy Paper", price: 100 },
      { id: "wood-toppers", name: "Wood Toppers", price: 80 },
      { id: "custom-toppers", name: "Custom Toppers", price: 100 },
    ],
    colours: [
      { id: "gold", name: "Gold", price: 0 },
      { id: "silver", name: "Silver", price: 0 },
      { id: "pink", name: "Pink", price: 0 },
      { id: "blue", name: "Blue", price: 0 },
      { id: "red", name: "Red", price: 0 },
      { id: "green", name: "Green", price: 0 },
      { id: "yellow", name: "Yellow", price: 0 },
      { id: "purple", name: "Purple", price: 0 }, 
      { id: "white", name: "White", price: 0 },
      { id: "brown", name: "Brown", price: 0 },
      { id: "orange", name: "Orange", price: 0 },
      { id: "maroon", name: "Maroon", price: 0 },
      { id: "navy-blue", name: "Navy Blue", price: 0 },
    ],
    decorations: [
      { id: "simple", name: "Simple", price: 0 },
      { id: "floral", name: "Floral", price: 400 },
      { id: "themed", name: "Custom Themed", price: 600 },
    ],
    supportsMessage: true,
    supportsDesignRequest: true,
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    basePrice: 25,
    flavors: [
      { id: "vanilla", name: "Vanilla", price: 0 },
      { id: "chocolate", name: "Chocolate", price: 0 },
      { id: "red-velvet", name: "Red Velvet", price: 2 },
    ],
    frostings: [
      { id: "vanilla-buttercream", name: "Vanilla Buttercream", price: 0 },
      { id: "chocolate-buttercream", name: "Chocolate Buttercream", price: 2 },
      { id: "cream-cheese", name: "Cream Cheese", price: 3 },
    ],
    decorations: [
      { id: "sprinkles", name: "Sprinkles", price: 0 },
      { id: "fondant-topper", name: "Fondant Topper", price: 5 },
    ],
    quantityMultipliers: {
      6: 25,
      12: 25,
      18: 25,
      24: 25,
    },
    supportsMessage: false,
    supportsDesignRequest: true,
  },
  {
    id: "popsicles",
    name: "Popsicles",
    basePrice: 30,
    flavors: [
      { id: "vanilla", name: "Vanilla", price: 0 },
      { id: "chocolate", name: "Chocolate", price: 0 },
      { id: "red-velvet", name: "Red Velvet", price: 2 },
    ],
    decorations: [
      { id: "sprinkles", name: "Sprinkles", price: 0 },
      { id: "drizzle", name: "Chocolate Drizzle", price: 2 },
      { id: "fondant-topper", name: "Fondant Topper", price: 5 },
    ],
    quantityMultipliers: {
      12: 30,
    },
    supportsMessage: false,
    supportsDesignRequest: true,
  },
  {
    id: "scones",
    name: "Scones",
    basePrice: 300,
    sizes: [
      { id: "5L", name: "5L", price: 0 },
      { id: "10L", name: "10L", price: 150 },
      { id: "20L", name: "20L", price: 450 },
    ],
    flavors: [
      { id: "plain", name: "Plain", price: 0 },
      { id: "raisin", name: "Raisin", price: 10 },
      { id: "cheese", name: "Cheese", price: 20 },
      { id: "blueberry", name: "Blueberry", price: 30 },
    ],
    supportsMessage: false,
    supportsDesignRequest: false,
  },
  {
    id: "cookies",
    name: "Cookies",
    basePrice: 350,
    sizes: [
      { id: "5L", name: "5L", price: 0 },
      { id: "10L", name: "10L", price: 150 },
    ],
    flavors: [
      { id: "sugar", name: "Sugar Cookies", price: 0 },
      { id: "chocolate-chip", name: "Chocolate Chip", price: 20 },
      { id: "oatmeal-raisin", name: "Oatmeal Raisin", price: 20 },
    ],
    decorations: [
      { id: "icing", name: "Icing", price: 10 },
      { id: "piping", name: "Piping", price: 15 },
      { id: "logo", name: "Edible Image/Logo", price: 25 },
    ],
    supportsMessage: false,
    supportsDesignRequest: true,
  },
]
