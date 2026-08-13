import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Montserrat } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Preloader from "@/components/preloader"
import PageAnimations from "@/components/page-animations"
import { CakeOrderProvider } from "@/components/cake-order-provider"
import JsonLd from "@/components/json-ld"
import { bakeryJsonLd, pageMetadata, PAGES, SITE, websiteJsonLd } from "@/lib/seo"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
})

const homeSeo = PAGES["/"]
const home = pageMetadata("/")

export const viewport: Viewport = {
  themeColor: "#7d562d",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: homeSeo.absoluteTitle!,
    template: `%s | ${SITE.name}`,
  },
  description: homeSeo.description,
  keywords: [...homeSeo.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "food",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE.url,
    languages: {
      "en-ZA": SITE.url,
      en: SITE.url,
    },
  },
  openGraph: home.openGraph,
  twitter: home.twitter,
  icons: {
    icon: "/images/dadda-logo.png",
    apple: "/images/dadda-logo.png",
  },
  appleWebApp: {
    capable: true,
    title: SITE.shortName,
    statusBarStyle: "default",
  },
  other: {
    "geo.region": "ZA-GP",
    "geo.placename": "Amandasig, Pretoria",
    "geo.position": `${SITE.latitude};${SITE.longitude}`,
    ICBM: `${SITE.latitude}, ${SITE.longitude}`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-ZA" className="scroll-smooth">
      <body className={`${playfair.variable} ${montserrat.variable} font-sans bg-background text-on-surface antialiased`}>
        <JsonLd data={[bakeryJsonLd(), websiteJsonLd()]} />
        <CakeOrderProvider>
          <Preloader />
          <Header />
          <PageAnimations>
            <main>{children}</main>
          </PageAnimations>
          <Footer />
        </CakeOrderProvider>
      </body>
    </html>
  )
}
