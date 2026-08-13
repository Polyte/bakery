import type { Metadata } from "next"
import { CAKE_CATEGORIES, CAKE_CATEGORY_LIST } from "@/lib/cakes"
import { CUPCAKES } from "@/lib/cupcakes"
import { POPSTICLES } from "@/lib/popsticles"
import { TREATS } from "@/lib/treats"

export const SITE = {
  name: "Dadda's Confectionery",
  shortName: "Dadda's",
  tagline: "Baked with Love",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.daddasconfectionery.co.za").replace(/\/$/, ""),
  locale: "en_ZA",
  language: "en-ZA",
  email: "info@daddasconfectionery.co.za",
  phone: "+27762196675",
  phoneDisplay: "+27 76 219 6675",
  whatsapp: "https://wa.me/27762196675",
  streetAddress: "6814 Strawberry Street, Unit 2337 Villa Lanta Estate",
  locality: "Amandasig",
  region: "Gauteng",
  postalCode: "0182",
  country: "ZA",
  countryName: "South Africa",
  city: "Pretoria",
  latitude: -25.6719441,
  longitude: 28.089916,
  mapsUrl:
    "https://www.google.com/maps/place/2337,+6814+Strawberry+St,+Hartebeesthoek+303-Jr,+Akasia,+0182/@-25.6719441,28.0873411,17z",
  priceRange: "R",
  foundingYear: "2018",
  social: {
    facebook: "https://www.facebook.com/daddasconfectionery",
    instagram: "https://www.instagram.com/daddasconfectionery",
    twitter: "https://twitter.com/daddasconfectionery",
  },
  hours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" },
    { days: ["Saturday"], opens: "09:00", closes: "13:00" },
  ],
  areasServed: [
    "Pretoria",
    "Amandasig",
    "Akasia",
    "Pretoria North",
    "Tshwane",
    "Centurion",
    "Hartbeespoort",
    "Gauteng",
  ],
} as const

export const DEFAULT_OG_IMAGE = "/videos/cakes-wedding-tier.jpg"

export type SeoFaq = { question: string; answer: string }

export type SeoPage = {
  path: string
  title: string
  absoluteTitle?: string
  description: string
  keywords: string[]
  ogImage: string
  ogImageAlt: string
  breadcrumbs: { name: string; path: string }[]
  faqs?: SeoFaq[]
  noindex?: boolean
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
}

const homeFaqs: SeoFaq[] = [
  {
    question: "Where is Dadda's Confectionery?",
    answer:
      "We bake from 6814 Strawberry Street, Unit 2337 Villa Lanta Estate, Amandasig, Pretoria (Akasia, 0182). Collect from the kitchen or ask about delivery across Tshwane.",
  },
  {
    question: "How far in advance should I order a custom cake in Pretoria?",
    answer:
      "Birthday and children's cakes usually need three to five days. Wedding cakes need six to eight weeks. Corporate orders often land in two to four working days. WhatsApp +27 76 219 6675 for tight dates.",
  },
  {
    question: "Do you deliver cakes in Pretoria?",
    answer:
      "Yes. Pickup from Amandasig is included. We deliver by arrangement across Pretoria, Akasia, Pretoria North, Centurion, and greater Tshwane.",
  },
  {
    question: "What can I order from Dadda's?",
    answer:
      "Custom wedding, birthday, anniversary, children's, and corporate cakes, plus cupcakes, scones, pastries, and chocolate-coated Popsticles. Everything is baked to order, never pulled from a freezer.",
  },
]

const cakeFaqs: SeoFaq[] = [
  {
    question: "Are your cakes baked from scratch in Pretoria?",
    answer:
      "Yes. Every cake is mixed, baked, and finished in our Amandasig kitchen the day it is meant to be eaten. We do not sell frozen supermarket cakes.",
  },
  {
    question: "Can I choose filling and flavour?",
    answer:
      "Vanilla bean, Belgian chocolate ganache, strawberry compote, salted caramel, red velvet, and lemon are regular options. Tell us dietary notes when you order.",
  },
  {
    question: "How do I collect my cake?",
    answer:
      "Collect from 6814 Strawberry Street, Villa Lanta Estate, Amandasig. We pack for the drive. Delivery across Pretoria is available by arrangement.",
  },
]

export const PAGES: Record<string, SeoPage> = {
  "/": {
    path: "/",
    title: "Custom Cakes in Pretoria",
    absoluteTitle: "Custom Cakes & Treats in Pretoria | Dadda's Confectionery",
    description:
      "Order custom wedding, birthday and children's cakes from Dadda's Confectionery in Amandasig, Pretoria. Baked from scratch. Collect or WhatsApp +27 76 219 6675.",
    keywords: [
      "custom cakes Pretoria",
      "bakery Pretoria",
      "Dadda's Confectionery",
      "wedding cakes Pretoria",
      "birthday cakes Pretoria",
      "cakes Amandasig",
      "bakery Akasia",
      "cupcakes Pretoria",
      "custom cake Pretoria North",
      "best bakery in Pretoria",
    ],
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "Three-tier wedding cake with pink roses from Dadda's Confectionery in Pretoria",
    breadcrumbs: [{ name: "Home", path: "/" }],
    faqs: homeFaqs,
    changeFrequency: "weekly",
    priority: 1,
  },
  "/cakes": {
    path: "/cakes",
    title: "Custom Cakes in Pretoria",
    description:
      "Wedding, birthday, anniversary, children's and corporate cakes baked from scratch in Amandasig, Pretoria. Order online or collect from Strawberry Street.",
    keywords: [
      "custom cakes Pretoria",
      "celebration cakes Pretoria",
      "order cake Pretoria",
      "cake shop Amandasig",
      "fresh cakes Pretoria",
      "bakery Pretoria North",
      "cake bakery Akasia",
      "Dadda's cakes",
    ],
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "Celebration cakes baked to order at Dadda's Confectionery Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cakes", path: "/cakes" },
    ],
    faqs: cakeFaqs,
    changeFrequency: "weekly",
    priority: 0.95,
  },
  "/cakes/wedding": {
    path: "/cakes/wedding",
    title: "Wedding Cakes in Pretoria",
    description:
      "From-scratch Pretoria wedding cakes — garden berry tiers, sugar roses, chocolate and macarons. Collect from Amandasig or we deliver to your venue.",
    keywords: [
      "wedding cakes Pretoria",
      "wedding cake Pretoria",
      "custom wedding cake Gauteng",
      "tiered wedding cake Pretoria",
      "wedding bakery Amandasig",
      "bridal cake Akasia",
      "wedding cake Tshwane",
      "sugar rose wedding cake",
    ],
    ogImage: "/videos/cakes-wedding-tier.jpg",
    ogImageAlt: "Three-tier pink rose wedding cake baked in Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cakes", path: "/cakes" },
      { name: "Wedding Cakes", path: "/cakes/wedding" },
    ],
    faqs: [
      {
        question: "How far in advance should I order a wedding cake in Pretoria?",
        answer:
          "Give us six to eight weeks when you can. We bake the sponge the day before, finish flowers the morning of, and pack the cake for the drive from Amandasig to the venue.",
      },
      {
        question: "Do you deliver wedding cakes to Pretoria venues?",
        answer:
          "Yes, by arrangement across Tshwane. Many couples collect from 6814 Strawberry Street. Tell us the venue and time when you enquire.",
      },
      {
        question: "How many guests does a three-tier wedding cake serve?",
        answer:
          "Our three-tier cakes typically serve 60–80 guests. Four-tier garden berry cakes serve about 80–100. We size the cake to your guest list.",
      },
    ],
    changeFrequency: "monthly",
    priority: 0.9,
  },
  "/cakes/birthday": {
    path: "/cakes/birthday",
    title: "Birthday Cakes in Pretoria",
    description:
      "Custom birthday cakes in Pretoria with gold lettering, chocolate and berries, or cake-and-cupcake bundles. Baked to order. Pickup in Amandasig.",
    keywords: [
      "birthday cakes Pretoria",
      "birthday cake Pretoria",
      "custom birthday cake Amandasig",
      "kids birthday cake Pretoria",
      "chocolate birthday cake Pretoria",
      "order birthday cake Pretoria North",
      "personalised birthday cake Akasia",
      "cake with name Pretoria",
    ],
    ogImage: "/videos/cakes-chocolate-berries.jpg",
    ogImageAlt: "Chocolate birthday cake with fresh berries from Dadda's Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cakes", path: "/cakes" },
      { name: "Birthday Cakes", path: "/cakes/birthday" },
    ],
    faqs: [
      {
        question: "How many days' notice do you need for a birthday cake?",
        answer:
          "Three to five days is enough for most Pretoria birthday cakes. Same-week WhatsApp orders are sometimes possible if the diary is open.",
      },
      {
        question: "Can you write a name or age on the cake?",
        answer:
          "Yes. We set messages in gold lettering or on an edible print. Spell the name when you order so it is right on the board.",
      },
    ],
    changeFrequency: "monthly",
    priority: 0.9,
  },
  "/cakes/anniversary": {
    path: "/cakes/anniversary",
    title: "Anniversary Cakes Pretoria",
    description:
      "Anniversary cakes from Dadda's in Pretoria — red velvet LOVE boxes, orchid milestones, chocolate raspberry stands. Collect from Amandasig.",
    keywords: [
      "anniversary cakes Pretoria",
      "anniversary cake Pretoria",
      "romantic cake Pretoria",
      "red velvet cake Pretoria",
      "milestone cake Amandasig",
      "couple cake Pretoria",
      "chocolate raspberry cake",
    ],
    ogImage: "/videos/cakes-wedding-rotate.jpg",
    ogImageAlt: "Floral anniversary cake from Dadda's Confectionery",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cakes", path: "/cakes" },
      { name: "Anniversary Cakes", path: "/cakes/anniversary" },
    ],
    faqs: [
      {
        question: "Do you bake small anniversary cakes for two?",
        answer:
          "Yes. Anniversary cakes at Dadda's range from a quiet box for two to a stand for twenty. Gold leaf and fresh flowers are finished the morning you collect.",
      },
    ],
    changeFrequency: "monthly",
    priority: 0.85,
  },
  "/cakes/children": {
    path: "/cakes/children",
    title: "Kids Birthday Cakes Pretoria",
    description:
      "Children's birthday cakes in Pretoria — unicorn cream, rainbow toppers, superhero prints, and boxed cupcakes. Named on the board. Pickup Amandasig.",
    keywords: [
      "kids birthday cakes Pretoria",
      "children's cakes Pretoria",
      "unicorn cake Pretoria",
      "superhero cake Pretoria",
      "rainbow cake Pretoria",
      "kids party cake Amandasig",
      "character cake Pretoria",
      "first birthday cake Pretoria",
    ],
    ogImage: "/videos/cakes-unicorn.jpg",
    ogImageAlt: "Unicorn children's birthday cake decorated at Dadda's Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cakes", path: "/cakes" },
      { name: "Children's Cakes", path: "/cakes/children" },
    ],
    faqs: [
      {
        question: "Can you make character or themed kids cakes?",
        answer:
          "Send the character, colours, and the spelling of the name. We print, pipe, and pack so the cake is the loudest thing at the Pretoria party — in a good way.",
      },
    ],
    changeFrequency: "monthly",
    priority: 0.85,
  },
  "/cakes/corporate": {
    path: "/cakes/corporate",
    title: "Corporate Cakes in Pretoria",
    description:
      "Corporate cakes and boxed cupcakes for Pretoria offices — logo cakes, dessert boards, and launch dozens. From-scratch, collected or delivered from Amandasig.",
    keywords: [
      "corporate cakes Pretoria",
      "logo cake Pretoria",
      "office cakes Pretoria",
      "branded cupcakes Pretoria",
      "launch cake Tshwane",
      "company cake Akasia",
      "dessert board Pretoria",
      "corporate catering bakery Pretoria",
    ],
    ogImage: "/videos/cakes-truffles.jpg",
    ogImageAlt: "Elegant corporate cake with truffles and macarons",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Cakes", path: "/cakes" },
      { name: "Corporate Cakes", path: "/cakes/corporate" },
    ],
    faqs: [
      {
        question: "Can you print a company logo on a cake?",
        answer:
          "Yes. Send a PNG logo and the headcount. We print, box, and label for a Pretoria boardroom or launch. Give us two to four working days.",
      },
    ],
    changeFrequency: "monthly",
    priority: 0.8,
  },
  "/treats": {
    path: "/treats",
    title: "Scones & Treats in Pretoria",
    description:
      "Artisanal scones, croissants, macarons and sweet treats from Dadda's Confectionery in Pretoria. Baked fresh in Amandasig. Order a box for morning tea.",
    keywords: [
      "scones Pretoria",
      "bakery treats Pretoria",
      "fresh scones Amandasig",
      "croissants Pretoria",
      "macarons Pretoria",
      "pastries Akasia",
      "morning bakery Pretoria North",
      "chocolate tart Pretoria",
    ],
    ogImage: "/stitch/treats-scones.jpg",
    ogImageAlt: "Golden buttery scones from Dadda's Confectionery Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Scones & Treats", path: "/treats" },
    ],
    faqs: [
      {
        question: "Do you bake scones fresh every day?",
        answer:
          "Scones, croissants, and morning treats are baked in Amandasig to the orders on the board. Order ahead for a Pretoria tea, office breakfast, or weekend table.",
      },
      {
        question: "What treats can I order besides cakes?",
        answer:
          "Signature buttery scones with clotted cream, butter croissants, French macarons, dark chocolate tart, cupcakes, and chocolate-coated Popsticles.",
      },
    ],
    changeFrequency: "weekly",
    priority: 0.85,
  },
  "/treats/cupcakes": {
    path: "/treats/cupcakes",
    title: "Cupcakes in Pretoria",
    description:
      "Hand-finished cupcakes from Dadda's in Pretoria — vanilla blueberry, chocolate, red velvet, lemon, kids themed, and wedding minis. Collect from Amandasig.",
    keywords: [
      "cupcakes Pretoria",
      "custom cupcakes Pretoria",
      "red velvet cupcakes Pretoria",
      "wedding cupcakes Pretoria",
      "kids cupcakes Amandasig",
      "boxed cupcakes Pretoria",
      "cupcake bakery Akasia",
      "themed cupcakes Pretoria",
    ],
    ogImage: "/images/cupcakes-berries.webp",
    ogImageAlt: "Vanilla blueberry cupcakes topped with fresh berries",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Scones & Treats", path: "/treats" },
      { name: "Cupcakes", path: "/treats/cupcakes" },
    ],
    faqs: [
      {
        question: "Can I mix cupcake flavours in one Pretoria order?",
        answer:
          "Yes. Mix vanilla blueberry, chocolate, red velvet, lemon, kids themed, wedding minis, and seasonal flavours in one box. Collect from Amandasig.",
      },
      {
        question: "Do you make themed cupcakes for children's parties?",
        answer:
          "Yes. Colour, character toppers, and a sturdy vanilla base — built for birthday tables and small hands. Princess and milestone designs are on the menu.",
      },
    ],
    changeFrequency: "weekly",
    priority: 0.85,
  },
  "/treats/popsticles": {
    path: "/treats/popsticles",
    title: "Chocolate Ice Cream Pops Pretoria",
    description:
      "Hand-dipped chocolate Popsticles in Pretoria — ice cream bars in dark, milk, strawberry, cookies & cream, caramel and mint. Frozen pickup in Amandasig.",
    keywords: [
      "ice cream popsicles Pretoria",
      "chocolate coated ice cream Pretoria",
      "gourmet popsicles Pretoria",
      "cakesicles Pretoria",
      "Popsticles Dadda's",
      "ice cream bars Amandasig",
      "frozen treats Pretoria",
      "cookies and cream popsicle",
    ],
    ogImage: "/videos/popsticles.jpg",
    ogImageAlt: "Hand-dipped chocolate ice cream Popsticles from Dadda's Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Scones & Treats", path: "/treats" },
      { name: "Popsticles", path: "/treats/popsticles" },
    ],
    faqs: [
      {
        question: "What are Popsticles?",
        answer:
          "Popsticles are Dadda's chocolate-coated ice cream bars on a stick. We churn a dense cream, freeze it, then dip each bar in tempered chocolate so the shell snaps.",
      },
      {
        question: "How should I collect Popsticles in Pretoria?",
        answer:
          "They stay frozen until pickup. We pack insulated boxes from 6814 Strawberry Street, Amandasig. Tell us your window and keep them frozen until you unwrap them.",
      },
    ],
    changeFrequency: "weekly",
    priority: 0.8,
  },
  "/order": {
    path: "/order",
    title: "Order a Cake in Pretoria",
    description:
      "Request a custom cake quote from Dadda's Confectionery in Pretoria. Wedding, birthday, and celebration cakes baked with love. WhatsApp +27 76 219 6675.",
    keywords: [
      "order cake Pretoria",
      "custom cake quote Pretoria",
      "order wedding cake Pretoria",
      "cake order Amandasig",
      "WhatsApp bakery Pretoria",
      "order cupcakes Pretoria",
      "cake enquiry Pretoria",
    ],
    ogImage: "/stitch/order-v3/hero-cupcakes.jpg",
    ogImageAlt: "Modern boutique cakes and cupcakes from Dadda's Confectionery Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Order", path: "/order" },
    ],
    faqs: [
      {
        question: "How do I order a cake from Dadda's?",
        answer:
          "Use the quote form on this page, start a signature cake checkout, or WhatsApp +27 76 219 6675. We confirm flavour, date, and pickup from Amandasig.",
      },
      {
        question: "Do you take last-minute cake orders in Pretoria?",
        answer:
          "WhatsApp the kitchen for urgent dates. Birthday cakes often fit in three to five days. Wedding cakes need more lead time.",
      },
    ],
    changeFrequency: "monthly",
    priority: 0.9,
  },
  "/order/enquiry": {
    path: "/order/enquiry",
    title: "Custom Cake Enquiry Pretoria",
    description:
      "Build a custom pastry order with Dadda's Confectionery in Pretoria. Choose cakes, cupcakes, scones and treats with Rand pricing.",
    keywords: [
      "custom cake enquiry Pretoria",
      "design your cake Pretoria",
      "cake order form Pretoria",
      "custom cupcakes order",
    ],
    ogImage: "/shop/overview-hero.jpg",
    ogImageAlt: "Custom cake enquiry form for Dadda's Confectionery",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Order", path: "/order" },
      { name: "Custom Enquiry", path: "/order/enquiry" },
    ],
    changeFrequency: "monthly",
    priority: 0.7,
  },
  "/gallery": {
    path: "/gallery",
    title: "Cake Gallery Pretoria",
    description:
      "Browse custom wedding, birthday and celebration cakes from Dadda's Confectionery in Pretoria. Real cakes from our Amandasig kitchen, not catalogue stock.",
    keywords: [
      "cake gallery Pretoria",
      "wedding cake photos Pretoria",
      "custom cake designs Pretoria",
      "bakery portfolio Amandasig",
      "cake inspiration Pretoria",
    ],
    ogImage: "/stitch/celeb-1.jpg",
    ogImageAlt: "Custom celebration cakes from Dadda's Confectionery gallery",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Gallery", path: "/gallery" },
    ],
    changeFrequency: "weekly",
    priority: 0.75,
  },
  "/about": {
    path: "/about",
    title: "Pretoria Bakery in Amandasig",
    description:
      "Meet Dadda's Confectionery, an artisanal bakery in Amandasig, Pretoria. From-scratch cakes and treats baked with love for every celebration in Tshwane.",
    keywords: [
      "bakery Pretoria",
      "about Dadda's Confectionery",
      "artisan bakery Amandasig",
      "family bakery Pretoria",
      "best cake shop Pretoria North",
      "bakery Akasia",
    ],
    ogImage: "/stitch/about-hero.jpg",
    ogImageAlt: "Inside Dadda's Confectionery bakery in Amandasig Pretoria",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
    faqs: [
      {
        question: "Who bakes at Dadda's Confectionery?",
        answer:
          "Dadda's is a Pretoria bakery rooted in family recipes and from-scratch method. Every cake and treat is finished by hand in Amandasig for the date you give us.",
      },
    ],
    changeFrequency: "yearly",
    priority: 0.6,
  },
  "/contact": {
    path: "/contact",
    title: "Contact Pretoria Bakery",
    description:
      "Contact Dadda's Confectionery in Amandasig, Pretoria. Call or WhatsApp +27 76 219 6675, email info@daddasconfectionery.co.za, or visit 6814 Strawberry Street.",
    keywords: [
      "bakery Pretoria contact",
      "Dadda's Confectionery phone",
      "cake shop Amandasig",
      "WhatsApp cake order Pretoria",
      "bakery Akasia address",
      "cake enquiry Pretoria",
    ],
    ogImage: "/stitch/about-craft.jpg",
    ogImageAlt: "Visit Dadda's Confectionery at 6814 Strawberry Street Amandasig",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ],
    faqs: [
      {
        question: "What are Dadda's Confectionery opening hours?",
        answer:
          "Monday to Friday 9:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM. Closed Sunday. Cake collections are booked to a pickup window.",
      },
      {
        question: "What is the best way to reach the bakery?",
        answer:
          "WhatsApp or call +27 76 219 6675 for dates and quotes. Email info@daddasconfectionery.co.za, or send the contact form with your event details.",
      },
    ],
    changeFrequency: "yearly",
    priority: 0.7,
  },
  "/privacy": {
    path: "/privacy",
    title: "Privacy & Security",
    description:
      "How Dadda's Confectionery in Pretoria protects your personal information, cake orders, and payments.",
    keywords: ["Dadda's Confectionery privacy", "bakery privacy policy Pretoria"],
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "Dadda's Confectionery privacy and security",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Privacy", path: "/privacy" },
    ],
    changeFrequency: "yearly",
    priority: 0.2,
  },
  "/checkout": {
    path: "/checkout",
    title: "Checkout",
    description: "Complete your cake order with Dadda's Confectionery in Pretoria.",
    keywords: [],
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "Checkout at Dadda's Confectionery",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Checkout", path: "/checkout" },
    ],
    noindex: true,
  },
  "/order/filling": {
    path: "/order/filling",
    title: "Choose Cake Filling",
    description: "Choose a filling for your custom cake from Dadda's Confectionery.",
    keywords: [],
    ogImage: "/shop/filling-preview.jpg",
    ogImageAlt: "Cake filling options",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Order", path: "/order" },
      { name: "Filling", path: "/order/filling" },
    ],
    noindex: true,
  },
  "/order/overview": {
    path: "/order/overview",
    title: "Order Overview",
    description: "Review your custom cake order from Dadda's Confectionery.",
    keywords: [],
    ogImage: "/shop/overview-hero.jpg",
    ogImageAlt: "Cake order overview",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Order", path: "/order" },
      { name: "Overview", path: "/order/overview" },
    ],
    noindex: true,
  },
  "/order/confirmed": {
    path: "/order/confirmed",
    title: "Order Confirmed",
    description: "Your Dadda's Confectionery order is confirmed.",
    keywords: [],
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "Order confirmed",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Order confirmed", path: "/order/confirmed" },
    ],
    noindex: true,
  },
  "/order/tracking": {
    path: "/order/tracking",
    title: "Track Your Cake Order",
    description: "Track your cake order from Dadda's Confectionery in Pretoria.",
    keywords: [],
    ogImage: "/shop/tracking-deco.jpg",
    ogImageAlt: "Track cake order",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Tracking", path: "/order/tracking" },
    ],
    noindex: true,
  },
  "/order/modify": {
    path: "/order/modify",
    title: "Modify Your Order",
    description: "Update your Dadda's Confectionery cake order.",
    keywords: [],
    ogImage: "/shop/modify-bg.jpg",
    ogImageAlt: "Modify cake order",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Modify order", path: "/order/modify" },
    ],
    noindex: true,
  },
  "/order/calendar": {
    path: "/order/calendar",
    title: "Add Pickup to Calendar",
    description: "Add your Dadda's Confectionery cake pickup to your calendar.",
    keywords: [],
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "Cake pickup calendar",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Calendar", path: "/order/calendar" },
    ],
    noindex: true,
  },
  "/blog": {
    path: "/blog",
    title: "Gallery",
    description: "Redirecting to the Dadda's Confectionery cake gallery.",
    keywords: [],
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: "Cake gallery",
    breadcrumbs: [{ name: "Home", path: "/" }],
    noindex: true,
  },
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`
}

export function pageMetadata(path: string): Metadata {
  const page = PAGES[path]
  if (!page) {
    throw new Error(`Missing SEO config for ${path}`)
  }

  const url = absoluteUrl(page.path)
  const image = absoluteUrl(page.ogImage)
  const title = page.absoluteTitle ? { absolute: page.absoluteTitle } : page.title

  return {
    title,
    description: page.description,
    keywords: page.keywords.length ? [...page.keywords] : undefined,
    alternates: {
      canonical: url,
      languages: { "en-ZA": url, "en": url },
    },
    robots: page.noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      title: page.absoluteTitle ?? `${page.title} | ${SITE.name}`,
      description: page.description,
      images: [{ url: image, width: 1200, height: 630, alt: page.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@daddasconfectionery",
      title: page.absoluteTitle ?? `${page.title} | ${SITE.name}`,
      description: page.description,
      images: [image],
    },
  }
}

export function indexablePages() {
  return Object.values(PAGES).filter((page) => !page.noindex)
}

function offer(price: number) {
  return {
    "@type": "Offer",
    priceCurrency: "ZAR",
    price: price.toFixed(2),
    availability: "https://schema.org/InStoreOnly",
    url: SITE.url,
    seller: { "@type": "Bakery", name: SITE.name },
  }
}

export function bakeryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Bakery", "LocalBusiness"],
    "@id": `${SITE.url}/#bakery`,
    name: SITE.name,
    alternateName: ["Daddas Confectionery", "Dadda's Cakes", "Daddas Cakes Pretoria"],
    description:
      "Artisanal bakery in Amandasig, Pretoria specialising in custom wedding cakes, birthday cakes, cupcakes, scones, and chocolate Popsticles baked from scratch.",
    url: SITE.url,
    image: [
      absoluteUrl(DEFAULT_OG_IMAGE),
      absoluteUrl("/images/cupcakes-berries.webp"),
      absoluteUrl("/stitch/about-hero.jpg"),
    ],
    logo: absoluteUrl("/images/dadda-logo.png"),
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: "RR",
    currenciesAccepted: "ZAR",
    paymentAccepted: "Visa, Mastercard, Instant EFT, Apple Pay, Google Pay, EFT",
    foundingDate: SITE.foundingYear,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.streetAddress,
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.latitude,
      longitude: SITE.longitude,
    },
    hasMap: SITE.mapsUrl,
    areaServed: SITE.areasServed.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: [
      ...SITE.hours.map((block) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: block.days,
        opens: block.opens,
        closes: block.closes,
      })),
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "00:00",
        closes: "00:00",
      },
    ],
    sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.twitter],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SITE.phone,
        contactType: "customer service",
        areaServed: "ZA",
        availableLanguage: ["English", "Afrikaans"],
      },
    ],
    makesOffer: CAKE_CATEGORY_LIST.map((category) => ({
      "@type": "Offer",
      name: category.label,
      url: absoluteUrl(category.href),
      priceCurrency: "ZAR",
      price: category.fromPrice,
    })),
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.url}/#bakery` },
  }
}

export function breadcrumbJsonLd(page: SeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

export function faqJsonLd(faqs: SeoFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}

function productNode(input: {
  id: string
  name: string
  description: string
  image: string
  price: number
  url: string
  category: string
}) {
  return {
    "@type": "Product",
    "@id": `${SITE.url}/#product-${input.id}`,
    name: input.name,
    description: input.description,
    image: absoluteUrl(input.image),
    sku: input.id,
    brand: { "@type": "Brand", name: SITE.name },
    category: input.category,
    url: absoluteUrl(input.url),
    offers: offer(input.price),
  }
}

export function productListJsonLd(path: string) {
  if (path.startsWith("/cakes/") && path !== "/cakes") {
    const id = path.split("/")[2] as keyof typeof CAKE_CATEGORIES
    const category = CAKE_CATEGORIES[id]
    if (!category) return null
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: category.label,
      itemListElement: category.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: productNode({
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          url: category.href,
          category: category.label,
        }),
      })),
    }
  }

  if (path === "/treats") {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Scones & Treats",
      itemListElement: TREATS.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: productNode({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          price: item.price,
          url: "/treats",
          category: item.kind,
        }),
      })),
    }
  }

  if (path === "/treats/cupcakes") {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Cupcakes",
      itemListElement: CUPCAKES.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: productNode({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          price: item.price,
          url: "/treats/cupcakes",
          category: "Cupcakes",
        }),
      })),
    }
  }

  if (path === "/treats/popsticles") {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Popsticles",
      itemListElement: POPSTICLES.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: productNode({
          id: item.id,
          name: `${item.name} Popsticle`,
          description: item.description,
          image: item.image,
          price: item.price,
          url: "/treats/popsticles",
          category: "Ice cream popsicles",
        }),
      })),
    }
  }

  return null
}

export function pageGraph(path: string) {
  const page = PAGES[path]
  if (!page) return []

  const graph: object[] = [breadcrumbJsonLd(page)]
  if (page.faqs?.length) graph.push(faqJsonLd(page.faqs))
  const products = productListJsonLd(path)
  if (products) graph.push(products)
  return graph
}
