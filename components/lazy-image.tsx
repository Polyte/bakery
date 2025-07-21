"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
  sizes,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }, // Trigger when 10% of the image is visible
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current && observer) {
        observer.unobserve(imgRef.current)
        observer.disconnect()
      }
    }
  }, [priority])

  const effectiveSrc = src || `/placeholder.svg?height=${height || 200}&width=${width || 200}&query=image`

  return (
    <div 
      ref={imgRef} 
      className={`relative ${fill ? 'h-full w-full' : ''} ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      {/* Placeholder visible before image loads or if src is invalid */}
      {!isLoaded && isInView && (
        <div
          className={`absolute inset-0 bg-dadda-primary/10 animate-pulse ${fill ? "rounded-lg" : ""}`}
          style={fill ? {} : { width: width, height: height }}
        ></div>
      )}

      {isInView && (
        <Image
          src={effectiveSrc || "/placeholder.svg"}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setIsLoaded(true)
          }}
          priority={priority}
        />
      )}
    </div>
  )
}
