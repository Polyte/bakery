import JsonLd from "@/components/json-ld"
import { pageGraph } from "@/lib/seo"

export default function SeoGraph({ path }: { path: string }) {
  return <JsonLd data={pageGraph(path)} />
}
