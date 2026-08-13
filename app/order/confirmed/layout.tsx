import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/order/confirmed")

export default function ConfirmedLayout({ children }: { children: ReactNode }) {
  return <SeoLayoutShell path="/order/confirmed">{children}</SeoLayoutShell>
}
