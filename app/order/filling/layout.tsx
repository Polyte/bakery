import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/order/filling")

export default function FillingLayout({ children }: { children: ReactNode }) {
  return <SeoLayoutShell path="/order/filling">{children}</SeoLayoutShell>
}
