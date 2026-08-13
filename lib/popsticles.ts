export type Popsticle = {
  id: string
  name: string
  description: string
  price: number
  image: string
  note: string
}

export const POPSTICLES: Popsticle[] = [
  {
    id: "popsticle-dark",
    name: "Dark Chocolate",
    description: "70% cocoa shell around Madagascar vanilla ice cream. A clean snap, then a slow melt.",
    price: 30,
    image: "/videos/popsticles-dark.jpg",
    note: "Classic",
  },
  {
    id: "popsticle-milk",
    name: "Milk Chocolate",
    description: "Creamy milk-chocolate coat with a buttermilk vanilla centre. The one everyone reaches for first.",
    price: 30,
    image: "/videos/popsticles-milk.jpg",
    note: "Crowd favourite",
  },
  {
    id: "popsticle-strawberry",
    name: "Strawberry Dip",
    description: "White-chocolate dip blushed with house strawberry, over berry-ripple ice cream.",
    price: 30,
    image: "/videos/popsticles-strawberry.jpg",
    note: "Seasonal",
  },
  {
    id: "popsticle-cookies",
    name: "Cookies & Cream",
    description: "Crushed biscuit in the cream, dark chocolate on the outside. Crunch in every bite.",
    price: 30,
    image: "/videos/popsticles-cookies.jpg",
    note: "Crunch",
  },
  {
    id: "popsticle-caramel",
    name: "Caramel Crunch",
    description: "Salted caramel ice cream under a milk-chocolate shell, finished with toffee shard.",
    price: 32,
    image: "/videos/popsticles-caramel.jpg",
    note: "Signature",
  },
  {
    id: "popsticle-mint",
    name: "Mint",
    description: "Cool mint cream inside a dark-chocolate coat. Fresh, not toothpaste. Pretoria summer in a stick.",
    price: 30,
    image: "/videos/popsticles-mint.jpg",
    note: "Cool",
  },
]

export const POPSTICLES_FROM_PRICE = Math.min(...POPSTICLES.map((item) => item.price))
