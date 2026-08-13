export default function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data]
  if (!payload.length) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(/</g, "\\u003c"),
      }}
    />
  )
}
