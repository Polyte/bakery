import CakesPage from "@/components/cakes-page"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/cakes")

export default function CakesRoute() {
  return (
    <>
      <SeoGraph path="/cakes" />
      <CakesPage />
      <SeoFaq path="/cakes" />
    </>
  )
}
