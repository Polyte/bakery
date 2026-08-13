export type Treat = {
  id: string
  name: string
  description: string
  price: number
  image: string
  note: string
  kind: "Scones" | "Treats"
  unit: string
}

export const TREATS: Treat[] = [
  {
    id: "scone-vanilla",
    name: "Vanilla & Buttermilk",
    description:
      "The golden buttery scone. Crisp shell, tender crumb, packed as a 5 litre tub. Serve warm with clotted cream and house strawberry jam.",
    price: 300,
    image: "/stitch/treats-scones.jpg",
    note: "Signature",
    kind: "Scones",
    unit: "5 litre tub · Pretoria pickup",
  },
  {
    id: "scone-raspberry",
    name: "White Chocolate & Raspberry",
    description:
      "Buttermilk scones studded with white chocolate and raspberry. A Pretoria morning tea tub, baked to the order on the board.",
    price: 330,
    image: "/stitch/treats-jam.jpg",
    note: "Sweet",
    kind: "Scones",
    unit: "5 litre tub · Pretoria pickup",
  },
  {
    id: "scone-cheddar",
    name: "Aged Cheddar & Herb",
    description:
      "Savoury scones with aged cheddar and garden herbs. For the office breakfast or a braai table that wants bread, not cake.",
    price: 320,
    image: "/videos/fresh-rolls.jpg",
    note: "Savoury",
    kind: "Scones",
    unit: "5 litre tub · Pretoria pickup",
  },
  {
    id: "scone-10l",
    name: "Mixed Scones 10L",
    description:
      "A 10 litre tub of mixed scones for a Pretoria office breakfast or family table. Tell us the flavour mix on WhatsApp.",
    price: 450,
    image: "/stitch/treats-scones.jpg",
    note: "Sharing",
    kind: "Scones",
    unit: "10 litre tub · Pretoria pickup",
  },
  {
    id: "scone-20l",
    name: "Mixed Scones 20L",
    description:
      "A 20 litre tub for events. Plain, raisin, cheese, or mixed — baked the morning you collect from Amandasig.",
    price: 750,
    image: "/videos/fresh-rolls.jpg",
    note: "Events",
    kind: "Scones",
    unit: "20 litre tub · Pretoria pickup",
  },
  {
    id: "treat-croissant",
    name: "Butter Croissant",
    description: "Flaky, laminated, pulled from the Amandasig oven the morning you collect. Order a few; they do not keep.",
    price: 45,
    image: "/stitch/treats-croissants.jpg",
    note: "Daily",
    kind: "Treats",
    unit: "Each · Pretoria pickup",
  },
  {
    id: "treat-macaron",
    name: "French Macaron",
    description: "Almond shells with a ganache or fruit centre. Mix colours in the same box for a Pretoria dessert table.",
    price: 35,
    image: "/stitch/treats-macarons.jpg",
    note: "Delicate",
    kind: "Treats",
    unit: "Each · Pretoria pickup",
  },
  {
    id: "treat-tart",
    name: "Dark Chocolate Tart",
    description: "A glossy slice of 70% ganache on a cocoa crust, finished with gold leaf. One slice, not a sharing tin.",
    price: 85,
    image: "/stitch/treats-tart.jpg",
    note: "Slice",
    kind: "Treats",
    unit: "Each · Pretoria pickup",
  },
]

export const TREATS_FROM_PRICE = Math.min(...TREATS.map((item) => item.price))
