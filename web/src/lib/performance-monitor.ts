/**
 * Monitor de performance para detectar gargalos em tempo real
 */

interface PerformanceEntry {
  name: string
  duration: number
  timestamp: number
  type: 'request' | 'render' | 'twitch-player' | 'cache'
}

interface NetworkRequest {
  url: string
  method: string
  duration: number
  status?: number
  cached: boolean
}

class PerformanceMonitor {
  private entries: PerformanceEntry[] = []
  private networkRequests: NetworkRequest[] = []
  private isMonitoring = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupPerformanceObserver()
      this.setupNetworkMonitoring()
    }
  }

  private setupPerformanceObserver() {
    try {
      // Observer para métricas de navegação e recursos
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordEntry({
            name: entry.name,
            duration: entry.duration,
            timestamp: entry.startTime,
            type: this.categorizeEntry(entry.name)
          })
        })
      })

      observer.observe({ entryTypes: ['resource', 'navigation', 'measure'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  private setupNetworkMonitoring() {
    // Interceptar fetch para monitorar requests
    const originalFetch = window.fetch
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url
      const method = init?.method || 'GET'
      const startTime = performance.now()

      try {
        const response = await originalFetch(input, init)
        const duration = performance.now() - startTime
        
        this.recordNetworkRequest({
          url,
          method,
          duration,
          status: response.status,
          cached: response.headers.get('cache-control')?.includes('max-age') || false
        })

        return response
      } catch (error) {
        const duration = performance.now() - startTime
        this.recordNetworkRequest({
          url,
          method,
          duration,
          cached: false
        })
        throw error
      }
    }
  }

  private categorizeEntry(name: string): PerformanceEntry['type'] {
    if (name.includes('twitch') || name.includes('player')) {
      return 'twitch-player'
    }
    if (name.includes('api/') || name.includes('firestore')) {
      return 'request'
    }
    if (name.includes('cache')) {
      return 'cache'
    }
    return 'render'
  }

  recordEntry(entry: PerformanceEntry) {
    this.entries.push(entry)
    
    // Manter apenas os últimos 100 entries
    if (this.entries.length > 100) {
      this.entries = this.entries.slice(-100)
    }

    // Log automático para requests lentos
    if (entry.duration > 500 && entry.type === 'request') {
      console.warn(`🐌 Slow request detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`)
    }
  }

  recordNetworkRequest(request: NetworkRequest) {
    this.networkRequests.push(request)
    
    // Manter apenas os últimos 50 requests
    if (this.networkRequests.length > 50) {
      this.networkRequests = this.networkRequests.slice(-50)
    }
  }

  /**
   * Análise de performance atual
   */
  getPerformanceReport() {
    const now = performance.now()
    const last5Minutes = now - 5 * 60 * 1000

    const recentEntries = this.entries.filter(e => e.timestamp > last5Minutes)
    const recentRequests = this.networkRequests.filter(r => 
      (now - r.duration) > last5Minutes
    )

    // Calcular métricas
    const byType = recentEntries.reduce((acc, entry) => {
      if (!acc[entry.type]) {
        acc[entry.type] = { count: 0, totalDuration: 0, maxDuration: 0 }
      }
      acc[entry.type].count++
      acc[entry.type].totalDuration += entry.duration
      acc[entry.type].maxDuration = Math.max(acc[entry.type].maxDuration, entry.duration)
      return acc
    }, {} as Record<string, { count: number; totalDuration: number; maxDuration: number }>)

    const slowRequests = recentRequests
      .filter(r => r.duration > 300)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    const cachedRequestsCount = recentRequests.filter(r => r.cached).length
    const cacheHitRate = recentRequests.length > 0 
      ? (cachedRequestsCount / recentRequests.length) * 100 
      : 0

    return {
      timeframe: '5 minutes',
      summary: {
        totalEntries: recentEntries.length,
        totalRequests: recentRequests.length,
        cacheHitRate: Math.round(cacheHitRate),
        slowRequestsCount: slowRequests.length
      },
      byType,
      slowRequests,
      recommendations: this.generateRecommendations(byType, slowRequests, cacheHitRate)
    }
  }

  private generateRecommendations(
    byType: Record<string, any>, 
    slowRequests: NetworkRequest[], 
    cacheHitRate: number
  ): string[] {
    const recommendations: string[] = []

    // Recomendações baseadas em cache
    if (cacheHitRate < 50) {
      recommendations.push('📦 Cache hit rate baixo. Considere implementar cache mais agressivo.')
    }

    // Recomendações baseadas em requests lentos
    if (slowRequests.length > 5) {
      recommendations.push('🐌 Muitos requests lentos detectados. Considere otimização de API ou pré-loading.')
    }

    // Recomendações específicas para Twitch
    const twitchIssues = slowRequests.filter(r => 
      r.url.includes('twitch') || r.url.includes('player')
    )
    if (twitchIssues.length > 0) {
      recommendations.push('📺 Players Twitch lentos. Use pooling de conexões e preload.')
    }

    // Recomendações de render
    if (byType.render?.maxDuration > 100) {
      recommendations.push('🎨 Renders lentos detectados. Considere lazy loading ou virtualization.')
    }

    return recommendations
  }

  /**
   * Marca específica para Twitch players
   */
  markTwitchPlayerStart(channel: string) {
    performance.mark(`twitch-player-start-${channel}`)
  }

  markTwitchPlayerEnd(channel: string) {
    performance.mark(`twitch-player-end-${channel}`)
    performance.measure(
      `twitch-player-${channel}`, 
      `twitch-player-start-${channel}`, 
      `twitch-player-end-${channel}`
    )
  }

  /**
   * Monitoramento de Core Web Vitals
   */
  getWebVitals() {
    if (typeof window === 'undefined') return null

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      return {
        // Largest Contentful Paint
        LCP: this.getLCP(),
        // First Input Delay seria medido via PerformanceObserver
        FID: 'N/A (requires user interaction)',
        // Cumulative Layout Shift
        CLS: this.getCLS(),
        // Time to First Byte
        TTFB: navigation?.responseStart - navigation?.requestStart || 0,
        // Total page load time
        loadTime: navigation?.loadEventEnd - navigation?.navigationStart || 0
      }
    } catch (error) {
      console.warn('Error getting Web Vitals:', error)
      return null
    }
  }

  private getLCP(): number {
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0
    } catch {
      return 0
    }
  }

  private getCLS(): number {
    try {
      const clsEntries = performance.getEntriesByType('layout-shift')
      return clsEntries.reduce((sum, entry: any) => {
        if (!entry.hadRecentInput) {
          return sum + entry.value
        }
        return sum
      }, 0)
    } catch {
      return 0
    }
  }

  /**
   * Monitor automático - reporta problemas a cada minuto
   */
  startAutoMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    setInterval(() => {
      const report = this.getPerformanceReport()
      
      if (report.recommendations.length > 0) {
        console.group('🚀 Performance Monitor Report')
        console.log('Summary:', report.summary)
        console.log('Recommendations:', report.recommendations)
        console.groupEnd()
      }
    }, 60000) // 1 minuto
  }

  stopAutoMonitoring() {
    this.isMonitoring = false
  }
}

// Instância global
export const performanceMonitor = new PerformanceMonitor()

// Auto-start monitoring em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  performanceMonitor.startAutoMonitoring()
}

// Utilitários para debugging
export const perf = {
  mark: (name: string) => performance.mark(name),
  measure: (name: string, start: string, end?: string) => performance.measure(name, start, end),
  getReport: () => performanceMonitor.getPerformanceReport(),
  getWebVitals: () => performanceMonitor.getWebVitals(),
  markTwitchStart: (channel: string) => performanceMonitor.markTwitchPlayerStart(channel),
  markTwitchEnd: (channel: string) => performanceMonitor.markTwitchPlayerEnd(channel)
}

// Logging global para debugging fácil
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).perf = perf
}
