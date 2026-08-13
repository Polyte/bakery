"use client"

import { useState } from "react"
import { Instagram } from "lucide-react"

export default function InstagramThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-chocolate-text/10 text-dadda-primary">
        <Instagram className="h-8 w-8" aria-hidden />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
