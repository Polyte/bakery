import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/order/modify")

export default function ModifyLayout({ children }: { children: ReactNode }) {
  return <SeoLayoutShell path="/order/modify">{children}</SeoLayoutShell>
}
