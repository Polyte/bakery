import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/order/overview")

export default function OverviewLayout({ children }: { children: ReactNode }) {
  return <SeoLayoutShell path="/order/overview">{children}</SeoLayoutShell>
}
