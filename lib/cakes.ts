import type { CakeCategoryId, CakeDraft } from "@/lib/cake-order"
import { CAKE_CATEGORY_LABELS } from "@/lib/cake-order"

export type CakeHeroSlide = {
  src: string
  poster?: string
  label: string
}

export type CakeProduct = {
  id: string
  category: CakeCategoryId
  name: string
  description: string
  flavor: string
  price: number
  image: string
  sizeLabel: string
  serves: string
  note?: string
}

export type CakeCategory = {
  id: CakeCategoryId
  href: string
  label: string
  eyebrow: string
  title: string
  italic: string
  description: string
  intro: string
  fromPrice: number
  image: string
  imageAlt: string
  slides: CakeHeroSlide[]
  products: CakeProduct[]
}

export const CAKES_OVERVIEW_SLIDES: CakeHeroSlide[] = [
  {
    src: "/videos/cakes-wedding-tier.mp4",
    poster: "/videos/cakes-wedding-tier.jpg",
    label: "Three-tier wedding cake with pink roses",
  },
  {
    src: "/videos/cakes-chocolate-berries.mp4",
    poster: "/videos/cakes-chocolate-berries.jpg",
    label: "Chocolate cake with fresh berries",
  },
  {
    src: "/videos/cakes-wedding-rotate.mp4",
    poster: "/videos/cakes-wedding-rotate.jpg",
    label: "Floral wedding cake rotating slowly",
  },
]

export const CAKE_PROCESS = [
  {
    step: "01",
    title: "Consult",
    copy: "Tell us the date, guest count, and the feeling you want in the room. WhatsApp or the order form both reach the Pretoria kitchen.",
  },
  {
    step: "02",
    title: "Flavour",
    copy: "Choose sponge and filling — vanilla bean, Belgian ganache, strawberry compote, or salted caramel drip.",
  },
  {
    step: "03",
    title: "Design",
    copy: "We sketch toppers, flowers, and colour so the cake matches the table, not a catalogue photo.",
  },
  {
    step: "04",
    title: "Bake",
    copy: "Baked to order in Amandasig, then collected from 6814 Strawberry Street. Never off a shelf.",
  },
]

const weddingProducts: CakeProduct[] = [
  {
    id: "cake-wedding-garden",
    category: "wedding",
    name: "Garden Berry Wedding Cake",
    description: "Four combed-buttercream tiers with fresh strawberries, raspberries, and peonies. Built for Pretoria garden receptions.",
    flavor: "Vanilla bean & lemon",
    price: 3500,
    image: "/cakes/wedding.jpg",
    sizeLabel: "4-tier",
    serves: "Serves 80–100",
    note: "Signature",
  },
  {
    id: "cake-wedding-rose-tier",
    category: "wedding",
    name: "Pink Rose Three-Tier",
    description: "Ivory tiers finished with sugar roses. The cake from our hero film — made to stand through speeches and still cut clean.",
    flavor: "Vanilla & buttercream",
    price: 4200,
    image: "/videos/cakes-wedding-tier.jpg",
    sizeLabel: "3-tier",
    serves: "Serves 60–80",
    note: "From the film",
  },
  {
    id: "cake-wedding-floral",
    category: "wedding",
    name: "Slow-Turn Floral Cake",
    description: "A classic round stack wrapped in sugar blooms. Quiet enough for a chapel, generous enough for a hall.",
    flavor: "Almond & vanilla",
    price: 3800,
    image: "/videos/cakes-wedding-rotate.jpg",
    sizeLabel: "3-tier",
    serves: "Serves 50–70",
  },
  {
    id: "cake-wedding-truffle",
    category: "wedding",
    name: "Truffle, Macaron & Rose",
    description: "Dark chocolate ganache, French macarons, and fresh roses. For couples who want the dessert table to look like a still life.",
    flavor: "Belgian chocolate",
    price: 4500,
    image: "/videos/cakes-truffles.jpg",
    sizeLabel: "2-tier",
    serves: "Serves 40–55",
    note: "Rich",
  },
]

const birthdayProducts: CakeProduct[] = [
  {
    id: "cake-birthday-wife",
    category: "birthday",
    name: "Gold Letter Birthday Cake",
    description: "Tall barrel cake, piped swirls, gold lettering. We set the words — a name, an age, a private joke — in the Pretoria kitchen.",
    flavor: "Vanilla bean",
    price: 950,
    image: "/cakes/cake9.jpg",
    sizeLabel: '8" round',
    serves: "Serves 12–16",
  },
  {
    id: "cake-birthday-message",
    category: "birthday",
    name: "Custom Message Barrel",
    description: "Edible print, torn-gold edges, macarons, and a laser-cut topper. Bring the wording; we handle the rest.",
    flavor: "Vanilla & chocolate",
    price: 1100,
    image: "/cakes/cake1.jpg",
    sizeLabel: "Tall barrel",
    serves: "Serves 16–20",
    note: "Bespoke",
  },
  {
    id: "cake-birthday-chocolate",
    category: "birthday",
    name: "Chocolate & Berries",
    description: "Dense chocolate sponge, ganache, and a crown of berries. The close-up from our cakes film, baked to the date you give us.",
    flavor: "Belgian chocolate",
    price: 980,
    image: "/videos/cakes-chocolate-berries.jpg",
    sizeLabel: '8" round',
    serves: "Serves 12–16",
    note: "Popular",
  },
  {
    id: "cake-birthday-bundle",
    category: "birthday",
    name: "Cake & Cupcake Bundle",
    description: "A small celebration cake boxed with matching cupcakes — forest green, gold script, Pretoria pickup.",
    flavor: "Vanilla & chocolate",
    price: 1200,
    image: "/cakes/cake22.jpg",
    sizeLabel: "Cake + 8 cupcakes",
    serves: "Serves 16–20",
  },
  {
    id: "cake-birthday-cherry",
    category: "birthday",
    name: "Cherry Slice Celebration",
    description: "Soft sponge, cream, a single cherry. Order as a whole cake; we cut it at collection if you ask.",
    flavor: "Vanilla & cherry",
    price: 850,
    image: "/videos/cakes-cherry-slice.jpg",
    sizeLabel: '8" round',
    serves: "Serves 12–14",
  },
]

const anniversaryProducts: CakeProduct[] = [
  {
    id: "cake-anniversary-love",
    category: "anniversary",
    name: "LOVE Heart Box",
    description: "Round cake and matching cupcakes in a delivery box. Buttercream roses, gold pearls, a marbled heart that reads LOVE.",
    flavor: "Red velvet & cream cheese",
    price: 1400,
    image: "/cakes/cake15.jpg",
    sizeLabel: "Cake + 6 cupcakes",
    serves: "Serves 14–18",
    note: "Romantic",
  },
  {
    id: "cake-anniversary-forty",
    category: "anniversary",
    name: "Orchid Milestone Cake",
    description: "Ivory barrel, gold line-art, orchids and wheat. Written for a fortieth — we change the number to yours.",
    flavor: "Vanilla bean",
    price: 1600,
    image: "/cakes/cake7.jpg",
    sizeLabel: "Tall barrel",
    serves: "Serves 16–22",
  },
  {
    id: "cake-anniversary-raspberry",
    category: "anniversary",
    name: "Chocolate Raspberry Stand",
    description: "Chocolate shards, raspberry gelée, pistachios. A grown-up cake for a quiet dinner in Akasia or a table of twelve.",
    flavor: "Dark chocolate & raspberry",
    price: 1250,
    image: "/images/cake-raspberry.webp",
    sizeLabel: '8" round',
    serves: "Serves 10–14",
    note: "Signature",
  },
  {
    id: "cake-anniversary-mini",
    category: "anniversary",
    name: "Mini Iced Cakes",
    description: "Three dripping mini cakes with meringues and macarons. Share them, or keep one each and argue over the third.",
    flavor: "Vanilla & citrus",
    price: 540,
    image: "/images/mini-iced-cakes.webp",
    sizeLabel: "Box of 3",
    serves: "Serves 3–6",
  },
]

const childrenProducts: CakeProduct[] = [
  {
    id: "cake-children-rainbow",
    category: "children",
    name: "Rainbow Cloud Cake",
    description: "Ivory buttercream, rainbow topper, painted dots, and the child's name in gold script. Loud in the best way.",
    flavor: "Vanilla rainbow",
    price: 980,
    image: "/cakes/cake5.jpg",
    sizeLabel: "Tall barrel",
    serves: "Serves 14–18",
    note: "Favourite",
  },
  {
    id: "cake-children-spiderman",
    category: "children",
    name: "Superhero Party Cake",
    description: "Edible print, comic toppers, name on the board. We work from the character they actually love, not a generic cape.",
    flavor: "Chocolate & vanilla",
    price: 1100,
    image: "/cakes/cake18.jpg",
    sizeLabel: "Tall barrel",
    serves: "Serves 16–20",
  },
  {
    id: "cake-children-unicorn",
    category: "children",
    name: "Unicorn Cream Cake",
    description: "The cake from the decorating film: swirled cream, horn, pastels. Baked the morning of collection so the colours stay bright.",
    flavor: "Vanilla & strawberry",
    price: 1050,
    image: "/videos/cakes-unicorn.jpg",
    sizeLabel: '8" round',
    serves: "Serves 12–16",
    note: "From the film",
  },
  {
    id: "cake-children-frozen",
    category: "children",
    name: "Winter Theme Cupcakes",
    description: "A boxed dozen with edible prints, snowflakes, and the child's name. Easy to pass around a party table.",
    flavor: "Vanilla",
    price: 720,
    image: "/cakes/cake17.jpg",
    sizeLabel: "Dozen",
    serves: "Serves 12",
  },
  {
    id: "cake-children-first",
    category: "children",
    name: "First Birthday Cupcakes",
    description: "Pink roses, gold lettering, a first-year name. Soft sponge, nothing too tall for small hands.",
    flavor: "Vanilla & strawberry",
    price: 850,
    image: "/cakes/cake40.jpg",
    sizeLabel: "Dozen",
    serves: "Serves 12",
  },
]

const corporateProducts: CakeProduct[] = [
  {
    id: "cake-corporate-teal",
    category: "corporate",
    name: "Boxed Teal Dozen",
    description: "Dark chocolate cupcakes, teal rosettes, gold pearls. A boardroom dozen that still looks like a bakery, not a canteen.",
    flavor: "Dark chocolate",
    price: 780,
    image: "/cakes/cake27.jpg",
    sizeLabel: "Dozen",
    serves: "Serves 12",
    note: "Office favourite",
  },
  {
    id: "cake-corporate-logo",
    category: "corporate",
    name: "Logo & Launch Cake",
    description: "Smooth ivory, edible logo, gold script. For product launches and milestone years on Strawberry Street or your Pretoria office.",
    flavor: "Vanilla & chocolate",
    price: 1800,
    image: "/cakes/cake22.jpg",
    sizeLabel: '10" round',
    serves: "Serves 20–28",
    note: "Bespoke",
  },
  {
    id: "cake-corporate-minis",
    category: "corporate",
    name: "Mini Iced Cakes",
    description: "Individual dripping cakes for a tasting table or client gift. Packed so they survive the N1.",
    flavor: "Vanilla & citrus",
    price: 95,
    image: "/images/mini-iced-cakes.webp",
    sizeLabel: "Each",
    serves: "Serves 1",
  },
  {
    id: "cake-corporate-board",
    category: "corporate",
    name: "Dessert Board",
    description: "Naked berry cake beside croissants and cream. For breakfast launches and afternoon sign-offs.",
    flavor: "Chocolate, berry & vanilla",
    price: 1500,
    image: "/images/cake-croissants.webp",
    sizeLabel: "Sharing board",
    serves: "Serves 10–14",
  },
  {
    id: "cake-corporate-tenth",
    category: "corporate",
    name: "Milestone Cupcake Box",
    description: "Green swirl dozen with fondant discs — a year, a team name, a product. We print what you send.",
    flavor: "Chocolate",
    price: 720,
    image: "/cakes/cake10.jpg",
    sizeLabel: "Half dozen / dozen",
    serves: "Serves 6–12",
  },
]

export const CAKE_CATEGORIES: Record<CakeCategoryId, CakeCategory> = {
  wedding: {
    id: "wedding",
    href: "/cakes/wedding",
    label: "Wedding Cakes",
    eyebrow: "Pretoria weddings",
    title: "Wedding cakes",
    italic: "for Pretoria days.",
    description:
      "From-scratch wedding cakes for Pretoria — garden berries, sugar roses, chocolate and macarons. Collect from Amandasig, or we deliver by arrangement.",
    intro:
      "Give us six to eight weeks when you can. We bake the sponge the day before, finish flowers the morning of, and pack the cake so it survives the drive from 6814 Strawberry Street to the venue.",
    fromPrice: 3500,
    image: "/cakes/wedding.jpg",
    imageAlt: "Four-tier wedding cake with berries and peonies",
    slides: [
      CAKES_OVERVIEW_SLIDES[0],
      CAKES_OVERVIEW_SLIDES[2],
      {
        src: "/videos/cakes-truffles.mp4",
        poster: "/videos/cakes-truffles.jpg",
        label: "Cake with truffles, macarons, and roses",
      },
    ],
    products: weddingProducts,
  },
  birthday: {
    id: "birthday",
    href: "/cakes/birthday",
    label: "Birthday Cakes",
    eyebrow: "Your day, your wording",
    title: "Birthday cakes",
    italic: "baked in Pretoria.",
    description:
      "Birthday cakes baked in Pretoria with gold lettering, berries, and boxed bundles. Three to five days' notice is enough for most designs.",
    intro:
      "We bake every birthday cake to the date you give us — vanilla, chocolate, or cherry — then set the message in gold or on an edible print. Pickup from Villa Lanta Estate, Amandasig.",
    fromPrice: 850,
    image: "/cakes/cake9.jpg",
    imageAlt: "Tall birthday cake with gold lettering and a butterfly",
    slides: [
      {
        src: "/videos/cakes-chocolate-berries.mp4",
        poster: "/videos/cakes-chocolate-berries.jpg",
        label: "Chocolate cake with fresh berries",
      },
      {
        src: "/videos/cakes-cherry-slice.mp4",
        poster: "/videos/cakes-cherry-slice.jpg",
        label: "Slice of cake with a cherry",
      },
    ],
    products: birthdayProducts,
  },
  anniversary: {
    id: "anniversary",
    href: "/cakes/anniversary",
    label: "Anniversary Cakes",
    eyebrow: "Another year, another layer",
    title: "Anniversary cakes",
    italic: "for Pretoria tables.",
    description:
      "Red velvet boxes, orchid milestones, chocolate raspberry stands. Anniversary cakes from Dadda's kitchen in Pretoria.",
    intro:
      "Anniversaries do not need a hall. They need a cake that looks like you meant it. We finish gold leaf and fresh flowers the morning you collect from Strawberry Street.",
    fromPrice: 1200,
    image: "/cakes/cake15.jpg",
    imageAlt: "Love-themed cake and cupcakes in a bakery box",
    slides: [
      {
        src: "/videos/cakes-wedding-rotate.mp4",
        poster: "/videos/cakes-wedding-rotate.jpg",
        label: "Floral cake rotating slowly",
      },
      {
        src: "/videos/cakes-chocolate-berries.mp4",
        poster: "/videos/cakes-chocolate-berries.jpg",
        label: "Chocolate cake with berries",
      },
    ],
    products: anniversaryProducts,
  },
  children: {
    id: "children",
    href: "/cakes/children",
    label: "Children's Cakes",
    eyebrow: "For the small guests",
    title: "Kids birthday cakes",
    italic: "rainbows and first years.",
    description:
      "Children's cakes with edible prints, rainbow toppers, and boxed cupcakes. Baked in Pretoria, named on the board.",
    intro:
      "Send the character, the colours, and the spelling of the name. We print, pipe, and pack so the cake is the loudest thing at the party — in a good way.",
    fromPrice: 720,
    image: "/cakes/cake5.jpg",
    imageAlt: "Rainbow children's birthday cake with a cloud topper",
    slides: [
      {
        src: "/videos/cakes-unicorn.mp4",
        poster: "/videos/cakes-unicorn.jpg",
        label: "Unicorn cake being decorated with cream",
      },
    ],
    products: childrenProducts,
  },
  corporate: {
    id: "corporate",
    href: "/cakes/corporate",
    label: "Corporate Cakes",
    eyebrow: "Offices, launches, logos",
    title: "Corporate cakes",
    italic: "for Pretoria offices.",
    description:
      "Logo cakes, boxed dozens, and dessert boards for Pretoria offices. From-scratch, delivered or collected from Amandasig.",
    intro:
      "Send the logo as a PNG and the headcount. We print, box, and label for a boardroom or a launch. Give us two to four working days.",
    fromPrice: 720,
    image: "/cakes/cake27.jpg",
    imageAlt: "Boxed dozen of teal-frosted chocolate cupcakes",
    slides: [
      {
        src: "/videos/cakes-truffles.mp4",
        poster: "/videos/cakes-truffles.jpg",
        label: "Elegant cake with truffles and macarons",
      },
    ],
    products: corporateProducts,
  },
}

export const CAKE_CATEGORY_LIST = (Object.keys(CAKE_CATEGORIES) as CakeCategoryId[]).map(
  (id) => CAKE_CATEGORIES[id],
)

export function getCakeCategory(id: CakeCategoryId) {
  return CAKE_CATEGORIES[id]
}

export function cakeKind(category: CakeCategoryId) {
  return CAKE_CATEGORY_LABELS[category]
}

export function cakeDraftPatch(product: CakeProduct): Partial<CakeDraft> {
  return {
    productName: product.name,
    productImage: product.image,
    sizePrice: product.price,
    flavorLabel: product.flavor,
    sizeLabel: product.sizeLabel,
    serves: product.serves,
    category: product.category,
    fillingId: null,
  }
}
