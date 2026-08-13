import type { MetadataRoute } from "next"
import { absoluteUrl, indexablePages } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return indexablePages().map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.changeFrequency ?? "monthly",
    priority: page.priority ?? 0.5,
  }))
}
