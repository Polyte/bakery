import type React from "react"
import type { Metadata } from "next"
import { Josefin_Sans } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Preloader from "@/components/preloader"

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dadda's Confectionery | Baked with Love",
  description:
    "Artisanal custom cakes and confections baked with love. Specializing in wedding cakes, birthday cakes, and custom desserts for all occasions in Pretoria, South Africa.",
  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${josefinSans.variable} font-josefin bg-cream text-brown-dark antialiased`}>
        <Preloader />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
