"use client"

import { useState, useEffect } from "react"
import LazyImage from "./lazy-image" // Using LazyImage

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-6 animate-bounce-gentle">
          <LazyImage // Using LazyImage
            src="/images/dadda-logo.png"
            alt="Dadda's Confectionery"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-dadda-red rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-dadda-red rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-dadda-red rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <p className="mt-4 text-dadda-primary font-medium">Loading with <span style={{ color: "red" }}>Love....</span>
        </p>
      </div>
    </div>
  )
}
