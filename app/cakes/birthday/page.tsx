import CakesCategoryView from "@/components/cakes-category-view"
import SeoGraph from "@/components/seo-graph"
import SeoFaq from "@/components/seo-faq"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata("/cakes/birthday")

export default function BirthdayCakesPage() {
  return (
    <>
      <SeoGraph path="/cakes/birthday" />
      <CakesCategoryView categoryId="birthday" />
      <SeoFaq path="/cakes/birthday" />
    </>
  )
}
