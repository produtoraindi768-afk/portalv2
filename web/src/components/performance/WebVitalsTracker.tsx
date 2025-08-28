"use client"

/**
 * Web Vitals Performance Tracker
 * Monitors Core Web Vitals and reports performance metrics
 */

import { useEffect } from 'react'

interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  entries?: PerformanceEntry[]
}

// Performance thresholds based on Google's recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

function reportWebVital(metric: WebVitalsMetric) {
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
    console.log(`${emoji} ${metric.name}: ${metric.value} (${metric.rating})`)
  }
  
  // Send to analytics service (replace with your analytics provider)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.id,
      custom_parameter_3: metric.rating,
    })
  }
  
  // Send to Vercel Analytics
  if (typeof window !== 'undefined' && (window as any).va) {
    ;(window as any).va('track', 'Web Vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    })
  }
}

export default function WebVitalsTracker() {
  useEffect(() => {
    // Dynamic import to reduce initial bundle
    const loadWebVitals = async () => {
      try {
        const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals')
        
        // Track Core Web Vitals
        onCLS((metric) => reportWebVital({
          id: metric.id,
          name: 'CLS',
          value: metric.value,
          rating: getRating('CLS', metric.value),
          delta: metric.delta,
          entries: metric.entries as PerformanceEntry[],
        }))
        
        onFID((metric) => reportWebVital({
          id: metric.id,
          name: 'FID',
          value: metric.value,
          rating: getRating('FID', metric.value),
          delta: metric.delta,
          entries: metric.entries as PerformanceEntry[],
        }))
        
        onFCP((metric) => reportWebVital({
          id: metric.id,
          name: 'FCP',
          value: metric.value,
          rating: getRating('FCP', metric.value),
          delta: metric.delta,
          entries: metric.entries as PerformanceEntry[],
        }))
        
        onLCP((metric) => reportWebVital({
          id: metric.id,
          name: 'LCP',
          value: metric.value,
          rating: getRating('LCP', metric.value),
          delta: metric.delta,
          entries: metric.entries as PerformanceEntry[],
        }))
        
        onTTFB((metric) => reportWebVital({
          id: metric.id,
          name: 'TTFB',
          value: metric.value,
          rating: getRating('TTFB', metric.value),
          delta: metric.delta,
          entries: metric.entries as PerformanceEntry[],
        }))
        
      } catch (error) {
        console.warn('Failed to load web-vitals:', error)
      }
    }
    
    // Load web vitals after initial page load
    if (typeof window !== 'undefined') {
      // Wait for page to be fully interactive
      if (document.readyState === 'complete') {
        loadWebVitals()
      } else {
        window.addEventListener('load', loadWebVitals)
        return () => window.removeEventListener('load', loadWebVitals)
      }
    }
  }, [])

  // Monitor custom performance metrics
  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track custom metrics
        if (entry.entryType === 'measure' && entry.name.startsWith('twitch-player')) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🎮 ${entry.name}: ${entry.duration.toFixed(2)}ms`)
          }
        }
        
        // Track resource loading times
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming
          if (resource.duration > 1000) { // Resources taking more than 1s
            if (process.env.NODE_ENV === 'development') {
              console.warn(`🐌 Slow resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`)
            }
          }
        }
      }
    })
    
    try {
      observer.observe({ entryTypes: ['measure', 'resource'] })
    } catch (error) {
      // Some browsers might not support all entry types
      console.warn('Performance observer error:', error)
    }
    
    return () => observer.disconnect()
  }, [])

  return null // This component doesn't render anything
}

// Hook for manual performance tracking
export function usePerformanceTracking() {
  const trackEvent = (name: string, value: number, metadata?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance event: ${name} = ${value}`, metadata)
    }
    
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      ;(window as any).va('track', 'Performance Event', {
        name,
        value,
        ...metadata,
      })
    }
  }
  
  const measureTime = (name: string) => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      trackEvent(name, duration)
      return duration
    }
  }
  
  return { trackEvent, measureTime }
}
