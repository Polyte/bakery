import CakesCategoryView from "@/components/cakes-category-view"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/cakes/corporate")

export default function CorporateCakesPage() {
  return (
    <>
      <SeoGraph path="/cakes/corporate" />
      <CakesCategoryView categoryId="corporate" />
      <SeoFaq path="/cakes/corporate" />
    </>
  )
}
