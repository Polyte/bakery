import { cacheGetJson, cacheSetJson } from "@/lib/cache"
import { SITE } from "@/lib/seo"

export const INSTAGRAM_USERNAME = "daddasconfectionery"
export const INSTAGRAM_PROFILE_URL = SITE.social.instagram

const IG_APP_ID = "936619743392459"
const IG_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

export type InstagramPost = {
  id: string
  shortcode: string
  href: string
  imageUrl: string
  alt: string
  caption: string
  isVideo: boolean
  isCarousel: boolean
}

type TimelineNode = {
  id?: string
  shortcode?: string
  __typename?: string
  is_video?: boolean
  display_url?: string
  thumbnail_src?: string
  accessibility_caption?: string | null
  thumbnail_resources?: { src: string; config_width: number }[]
  edge_sidecar_to_children?: { edges?: unknown[] }
  edge_media_to_caption?: { edges?: { node?: { text?: string } }[] }
}

type ProfilePayload = {
  data?: {
    user?: {
      edge_owner_to_timeline_media?: {
        edges?: { node?: TimelineNode }[]
      }
    }
  }
}

function captionFrom(node: TimelineNode) {
  return node.edge_media_to_caption?.edges?.[0]?.node?.text?.trim() ?? ""
}

function pickThumbnail(node: TimelineNode) {
  const sized = [...(node.thumbnail_resources ?? [])]
    .filter((item) => item.src && item.config_width >= 320)
    .sort((a, b) => a.config_width - b.config_width)
  return sized.find((item) => item.config_width >= 640)?.src || sized[0]?.src || node.thumbnail_src || node.display_url || ""
}

function toPost(node: TimelineNode): InstagramPost | null {
  const shortcode = node.shortcode
  const imageUrl = pickThumbnail(node)
  if (!shortcode || !imageUrl) return null

  const caption = captionFrom(node)
  const alt = node.accessibility_caption?.trim() || caption.split("\n")[0]?.slice(0, 140) || `Recent Instagram post from ${SITE.name}`

  return {
    id: node.id || shortcode,
    shortcode,
    href: `https://www.instagram.com/p/${shortcode}/`,
    imageUrl,
    alt,
    caption,
    isVideo: Boolean(node.is_video),
    isCarousel: node.__typename === "GraphSidecar" || Boolean(node.edge_sidecar_to_children?.edges?.length),
  }
}

const INSTAGRAM_TTL_SECONDS = 3600

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const cacheKey = `instagram:posts:v1:${limit}`
  const cached = await cacheGetJson<InstagramPost[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${INSTAGRAM_USERNAME}&hl=en`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": IG_USER_AGENT,
          "X-IG-App-ID": IG_APP_ID,
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
        },
        next: { revalidate: 3600 },
      },
    )

    if (!response.ok) return []

    const payload = (await response.json()) as ProfilePayload
    const edges = payload.data?.user?.edge_owner_to_timeline_media?.edges ?? []

    const posts = edges
      .map((edge) => (edge.node ? toPost(edge.node) : null))
      .filter((post): post is InstagramPost => Boolean(post))
      .slice(0, limit)

    if (posts.length) await cacheSetJson(cacheKey, posts, INSTAGRAM_TTL_SECONDS)
    return posts
  } catch {
    return []
  }
}

export function instagramMediaProxyUrl(imageUrl: string) {
  return `/api/instagram/media?u=${encodeURIComponent(imageUrl)}`
}
