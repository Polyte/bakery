import CakesCategoryView from "@/components/cakes-category-view"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/cakes/wedding")

export default function WeddingCakesPage() {
  return (
    <>
      <SeoGraph path="/cakes/wedding" />
      <CakesCategoryView categoryId="wedding" />
      <SeoFaq path="/cakes/wedding" />
    </>
  )
}
