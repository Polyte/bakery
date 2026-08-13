export type Cupcake = {
  id: string
  name: string
  description: string
  price: number
  image: string
  note: string
}

export const CUPCAKES: Cupcake[] = [
  {
    id: "cupcake-vanilla-blueberry",
    name: "Vanilla Blueberry",
    description:
      "Soft vanilla sponge piled with blueberry cream and fresh berries. The swirl from the film, baked in Pretoria.",
    price: 25,
    image: "/images/cupcakes-berries.webp",
    note: "Signature",
  },
  {
    id: "cupcake-chocolate",
    name: "Chocolate",
    description: "Dark cocoa sponge with a ganache swirl. Rich, not bitter. The after-school favourite.",
    price: 25,
    image: "/cakes/cake27.jpg",
    note: "Classic",
  },
  {
    id: "cupcake-red-velvet",
    name: "Red Velvet",
    description: "Cocoa-kissed crimson crumb under cream-cheese frosting. A Pretoria celebration staple.",
    price: 27,
    image: "/cakes/cake15.jpg",
    note: "Crowd favourite",
  },
  {
    id: "cupcake-lemon",
    name: "Lemon",
    description: "Bright lemon sponge with a sharp buttercream peak. Light enough for a weekday table.",
    price: 25,
    image: "/stitch/treats-cupcakes.jpg",
    note: "Zesty",
  },
  {
    id: "cupcake-kids",
    name: "Kids Themed",
    description: "Colour, character toppers, and a sturdy vanilla base. Built for birthday tables and small hands.",
    price: 30,
    image: "/stitch/prod-themed.jpg",
    note: "Party",
  },
  {
    id: "cupcake-wedding-mini",
    name: "Wedding Mini",
    description:
      "Two-bite ivory cakes with gold leaf and a quiet swirl. For Pretoria grazing tables and the dessert hour.",
    price: 25,
    image: "/images/mini-iced-cakes.webp",
    note: "Wedding",
  },
  {
    id: "cupcake-autumn",
    name: "Autumn Spice",
    description: "Warm spice sponge with caramel-toned frosting. Seasonal, and gone when the batch is.",
    price: 25,
    image: "/images/cupcakes-autumn.webp",
    note: "Seasonal",
  },
  {
    id: "cupcake-princess",
    name: "Princess",
    description: "Pastel swirl, edible sparkle, and a vanilla crumb. For the children’s table that wants a little theatre.",
    price: 30,
    image: "/stitch/prod-princess.jpg",
    note: "Themed",
  },
]

export const CUPCAKES_FROM_PRICE = Math.min(...CUPCAKES.map((item) => item.price))
