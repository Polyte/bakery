import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/contact")

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <SeoLayoutShell path="/contact" faq>
      {children}
    </SeoLayoutShell>
  )
}
