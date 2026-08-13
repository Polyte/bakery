import type { Metadata } from "next"
import Link from "next/link"
import { CreditCard, Lock, Mail, Shield, ShieldCheck } from "lucide-react"
import SeoGraph from "@/components/seo-graph"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata("/privacy")

const sections = [
  {
    icon: Lock,
    title: "Encryption Standards",
    paragraphs: [
      "At Dadda's Confectionery, the trust of our patrons is paramount. To ensure that your personal and transactional information remains strictly confidential, our entire platform is fortified with 256-bit SSL (Secure Socket Layer) encryption.",
      "This industry-leading security measure establishes an encrypted link between our server and your browser, guaranteeing that all data passed between them remains private and integral. Whether you are browsing our curated selections or finalizing a purchase, your connection is fully secure.",
    ],
  },
  {
    icon: Shield,
    title: "Data Handling",
    paragraphs: [
      "We believe that luxury service extends to how we manage your personal information. Any data collected—such as names, addresses, and contact details—is utilized exclusively for fulfilling your orders, providing personalized recommendations, and elevating your overall experience.",
      "We firmly pledge never to sell, rent, or unauthorizedly distribute your personal details to third parties. Your information is treated with the same meticulous care and respect as the ingredients in our artisanal pastries.",
    ],
  },
  {
    icon: CreditCard,
    title: "Payment Security",
    paragraphs: [
      "Online payments are processed by Yoco on their hosted checkout. Card numbers, Apple Pay, Google Pay, and Instant EFT details never touch our servers. We only receive a payment confirmation and the order details you entered.",
      "You can also pay by EFT using the banking details shown at checkout. We use your name, email, and phone only to confirm pickup or Pretoria delivery.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "User Protection",
    paragraphs: [
      "Beyond transactions, we are dedicated to providing a safe and serene browsing environment. Our systems undergo regular rigorous security audits and vulnerability assessments to preemptively address potential threats.",
      "Your focus should remain solely on selecting the perfect indulgence; ours is on ensuring you can do so with absolute peace of mind.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="flex w-full flex-col bg-surface">
      <SeoGraph path="/privacy" />
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-surface-container px-6 py-16 pt-36 lg:px-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-dadda-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-tertiary/10 blur-3xl" />
        <div className="z-10 mx-auto max-w-2xl space-y-4 text-center">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-chocolate-text md:text-5xl" data-animate="fade-up">
            Privacy &amp; Security
          </h1>
          <p className="text-lg text-on-surface-variant" data-animate="fade-up">
            Our commitment to safeguarding your experience.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-section-gap lg:px-12">
        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.title} className="space-y-6" data-animate="fade-up">
              <h2 className="flex items-center gap-3 font-display text-[32px] font-semibold text-chocolate-text">
                <section.icon className="h-8 w-8 text-dadda-primary" />
                {section.title}
              </h2>
              <div className="space-y-4 leading-relaxed text-on-surface-variant">
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="mx-auto mb-section-gap mt-8 max-w-4xl rounded-xl bg-surface-container-low px-6 py-12 text-center shadow-sm lg:px-12" data-animate="scale">
        <h3 className="mb-4 font-display text-2xl font-semibold text-chocolate-text">Questions regarding our policies?</h3>
        <p className="mb-6 text-on-surface-variant">
          Our dedicated support team is available to provide any further clarification you may require.
        </p>
        <Link
          href="/contact"
          className="mx-auto inline-flex items-center justify-center gap-2 rounded-full bg-surface-container px-8 py-3 text-sm font-semibold text-dadda-primary hover:bg-surface-container-high"
        >
          <Mail className="h-5 w-5" />
          Contact Support
        </Link>
        <p className="mt-6 text-sm text-on-surface-variant">
          6814 Strawberry Street, Amandasig, Pretoria ·{" "}
          <a href="mailto:info@daddasconfectionery.co.za" className="text-dadda-primary">
            info@daddasconfectionery.co.za
          </a>{" "}
          ·{" "}
          <a href="tel:+27762196675" className="text-dadda-primary">
            +27 76 219 6675
          </a>
        </p>
      </div>
    </div>
  )
}
