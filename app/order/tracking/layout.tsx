import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/order/tracking")

export default function TrackingLayout({ children }: { children: ReactNode }) {
  return <SeoLayoutShell path="/order/tracking">{children}</SeoLayoutShell>
}
