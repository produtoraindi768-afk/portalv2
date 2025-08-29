"use client"

import { Analytics } from "@vercel/analytics/react"
import WebVitalsTracker from "@/components/performance/WebVitalsTracker"

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
