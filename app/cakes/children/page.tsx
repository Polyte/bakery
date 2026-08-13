import CakesCategoryView from "@/components/cakes-category-view"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/cakes/children")

export default function ChildrensCakesPage() {
  return (
    <>
      <SeoGraph path="/cakes/children" />
      <CakesCategoryView categoryId="children" />
      <SeoFaq path="/cakes/children" />
    </>
  )
}
