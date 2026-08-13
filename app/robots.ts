import type { MetadataRoute } from "next"
import { SITE } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/checkout",
          "/order/filling",
          "/order/overview",
          "/order/confirmed",
          "/order/tracking",
          "/order/modify",
          "/order/calendar",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
