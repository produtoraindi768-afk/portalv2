"use client"

import { useEffect, useRef } from "react"

type BlookieEmbedProps = {
  src: string
  attributes?: Record<string, string | number | boolean | null | undefined>
  className?: string
}

export function BlookieEmbed({ src, attributes = {}, className }: BlookieEmbedProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const script = document.createElement("script")
    script.async = true
    script.src = src
    el.appendChild(script)
    return () => {
      el.removeChild(script)
    }
  }, [src])

  return (
    <div ref={ref} className={className}>
      <div
        data-blook
        {...Object.fromEntries(
          Object.entries(attributes).map(([key, value]) => [
            `data-${key}`,
            String(value ?? ""),
          ])
        )}
      />
    </div>
  )
}


