import { Instagram, Layers, Play } from "lucide-react"
import InstagramThumb from "@/components/instagram-thumb"
import {
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_USERNAME,
  getInstagramPosts,
  instagramMediaProxyUrl,
} from "@/lib/instagram"

export function InstagramFeedFallback() {
  return (
    <section className="w-full bg-cream-surface py-section-gap" aria-hidden>
      <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div className="mb-12 h-20 max-w-xl animate-pulse rounded-xl bg-surface-container" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-2xl bg-surface-container" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function InstagramFeed() {
  const posts = await getInstagramPosts(6)

  return (
    <section className="w-full bg-cream-surface py-section-gap" aria-labelledby="instagram-heading">
      <div className="mx-auto max-w-container-max px-margin-mobile lg:px-margin-desktop">
        <div className="mb-12 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div data-animate="fade-up">
            <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-dadda-primary">
              <Instagram className="h-4 w-4" aria-hidden />
              @{INSTAGRAM_USERNAME}
            </span>
            <h2 id="instagram-heading" className="section-title mb-2">
              Fresh from Instagram
            </h2>
            <p className="max-w-xl text-base text-on-surface-variant">
              Recent cakes, cupcakes, and deliveries from the Dadda&apos;s kitchen in Pretoria.
            </p>
          </div>
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
            data-animate="fade-up"
          >
            Follow us
            <Instagram className="h-4 w-4" aria-hidden />
          </a>
        </div>

        {posts.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5" data-stagger>
            {posts.map((post) => (
              <li key={post.id} data-stagger-item>
                <a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-2xl bg-surface-container shadow-sm hover:shadow-pastry"
                >
                  <InstagramThumb src={instagramMediaProxyUrl(post.imageUrl)} alt={post.alt} />
                  <span className="pointer-events-none absolute inset-0 bg-chocolate-text/0 transition-colors duration-300 group-hover:bg-chocolate-text/35" />
                  {(post.isVideo || post.isCarousel) && (
                    <span className="absolute right-3 top-3 text-white drop-shadow" aria-hidden>
                      {post.isVideo ? <Play className="h-5 w-5 fill-white" /> : <Layers className="h-5 w-5" />}
                    </span>
                  )}
                  <span className="sr-only">View this post on Instagram</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-base text-on-surface-variant">
            See the latest bakes on{" "}
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-dadda-primary hover:text-primary-container"
            >
              Instagram @{INSTAGRAM_USERNAME}
            </a>
            .
          </p>
        )}
      </div>
    </section>
  )
}
