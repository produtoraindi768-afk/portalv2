"use client"

import dynamic from "next/dynamic"

// Lazy load Analytics to reduce initial bundle size
const Analytics = dynamic(() => 
  import("@vercel/analytics/react").then(mod => ({ default: mod.Analytics })),
  { ssr: false }
)

// Lazy load WebVitals tracker
const WebVitalsTracker = dynamic(() => 
  import("@/components/performance/WebVitalsTracker"),
  { ssr: false }
)

/**
 * Client-side providers that need to be loaded dynamically
 * This component handles all client-only functionality
 */
export default function ClientProviders() {
  return (
    <>
      <WebVitalsTracker />
      <Analytics />
    </>
  )
}
