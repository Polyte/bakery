import type { ReactNode } from "react"
import SeoLayoutShell from "@/components/seo-layout-shell"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/order/calendar")

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return <SeoLayoutShell path="/order/calendar">{children}</SeoLayoutShell>
}
