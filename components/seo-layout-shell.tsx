import type { ReactNode } from "react"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"

export default function SeoLayoutShell({
  path,
  children,
  faq = false,
}: {
  path: string
  children: ReactNode
  faq?: boolean
}) {
  return (
    <>
      <SeoGraph path={path} />
      {children}
      {faq ? <SeoFaq path={path} /> : null}
    </>
  )
}
