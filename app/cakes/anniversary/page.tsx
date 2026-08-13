import CakesCategoryView from "@/components/cakes-category-view"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/cakes/anniversary")

export default function AnniversaryCakesPage() {
  return (
    <>
      <SeoGraph path="/cakes/anniversary" />
      <CakesCategoryView categoryId="anniversary" />
      <SeoFaq path="/cakes/anniversary" />
    </>
  )
}
