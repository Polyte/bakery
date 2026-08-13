import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/checkout")

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <SeoLayoutShell path="/checkout">{children}</SeoLayoutShell>
}
