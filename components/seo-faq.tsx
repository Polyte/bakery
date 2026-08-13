import { PAGES } from "@/lib/seo"

export default function SeoFaq({ path }: { path: string }) {
  const faqs = PAGES[path]?.faqs
  if (!faqs?.length) return null

  return (
    <section className="w-full bg-surface py-section-gap" aria-labelledby={`faq-heading-${path.replace(/\W+/g, "-")}`}>
      <div className="mx-auto max-w-[800px] px-margin-mobile lg:px-margin-desktop">
        <h2
          id={`faq-heading-${path.replace(/\W+/g, "-")}`}
          className="mb-8 text-center font-display text-[28px] font-semibold leading-9 text-chocolate-text md:text-[32px] md:leading-10"
        >
          Frequently asked questions
        </h2>
        <div className="divide-y divide-outline-variant border-y border-outline-variant">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer list-none font-display text-lg font-semibold text-chocolate-text marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {faq.question}
                  <span className="mt-1 shrink-0 text-dadda-primary group-open:hidden" aria-hidden>
                    +
                  </span>
                  <span className="mt-1 hidden shrink-0 text-dadda-primary group-open:inline" aria-hidden>
                    −
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-base leading-6 text-on-surface-variant">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
