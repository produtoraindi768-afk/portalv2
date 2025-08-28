/**
 * Player Twitch otimizado com pool de conexões e preloading
 * Reduz requests desnecessários e melhora performance
 */

interface TwitchPlayerConfig {
  channel: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  playsinline?: boolean
}

interface PlayerInstance {
  iframe: HTMLIFrameElement
  channel: string
  isActive: boolean
  lastUsed: number
}

class OptimizedTwitchPlayer {
  private playerPool = new Map<string, PlayerInstance>()
  private maxPoolSize = 2 // Reduced pool size
  private parentDomains: string[] = []
  private intersectionObserver?: IntersectionObserver
  private pendingLoads = new Map<string, () => void>()

  constructor() {
    // Configurar domínios parent uma vez
    this.setupParentDomains()
    
    // Setup intersection observer for viewport-based loading
    this.setupIntersectionObserver()
    
    // Cleanup periódico do pool - mais frequente
    setInterval(() => this.cleanupPool(), 3 * 60 * 1000) // 3 minutos
  }

  private setupParentDomains() {
    this.parentDomains = ['localhost']
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname && !this.parentDomains.includes(hostname)) {
        this.parentDomains.push(hostname)
      }
    }
  }

  /**
   * Setup intersection observer for lazy loading players
   */
  private setupIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const channel = entry.target.getAttribute('data-twitch-channel')
            if (channel && this.pendingLoads.has(channel)) {
              // Execute delayed loading
              const loadFn = this.pendingLoads.get(channel)!
              loadFn()
              this.pendingLoads.delete(channel)
              this.intersectionObserver?.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    )
  }

  /**
   * Observe element for lazy loading
   */
  observeForLazyLoad(element: HTMLElement, channel: string, loadFn: () => void) {
    if (!this.intersectionObserver) return

    element.setAttribute('data-twitch-channel', channel)
    this.pendingLoads.set(channel, loadFn)
    this.intersectionObserver.observe(element)
  }

  /**
   * Gera URL otimizada do embed
   */
  private generateEmbedUrl(config: TwitchPlayerConfig): string {
    const params = new URLSearchParams({
      channel: config.channel,
      autoplay: (config.autoplay ?? true).toString(),
      muted: (config.muted ?? true).toString(),
      controls: (config.controls ?? true).toString(),
      playsinline: (config.playsinline ?? true).toString(),
      // Otimizações específicas
      'disable-ads': 'true',
      allowfullscreen: 'true',
      // Reduzir qualidade inicialmente para carregamento mais rápido
      quality: 'auto'
    })

    // Adicionar parents de forma otimizada
    this.parentDomains.forEach(parent => {
      params.append('parent', parent)
    })

    return `https://player.twitch.tv/?${params.toString()}`
  }

  /**
   * Criar iframe otimizado
   */
  private createOptimizedIframe(config: TwitchPlayerConfig): HTMLIFrameElement {
    const iframe = document.createElement('iframe')
    const embedUrl = this.generateEmbedUrl(config)

    // Configurações otimizadas
    iframe.src = embedUrl
    iframe.frameBorder = '0'
    iframe.allowFullscreen = true
    iframe.scrolling = 'no'
    iframe.title = `${config.channel} - Twitch Stream`
    iframe.allow = 'autoplay; fullscreen; encrypted-media'
    
    // Otimizações de performance
    iframe.loading = 'eager' // Carregar imediatamente
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      display: block;
      border: none;
      background: #0d1117;
      transition: opacity 0.3s ease;
    `

    // Otimização: preconnect para domínios Twitch
    this.preconnectTwitchDomains()

    return iframe
  }

  /**
   * Preconnect para domínios críticos do Twitch
   */
  private preconnectTwitchDomains() {
    const domains = [
      'https://player.twitch.tv',
      'https://www.twitch.tv',
      'https://static-cdn.jtvnw.net',
      'https://assets.twitch.tv'
    ]

    domains.forEach(domain => {
      if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link')
        link.rel = 'preconnect'
        link.href = domain
        link.crossOrigin = 'anonymous'
        document.head.appendChild(link)
      }
    })
  }

  /**
   * Obter ou criar player do pool
   */
  async getPlayer(config: TwitchPlayerConfig): Promise<HTMLIFrameElement> {
    const { channel } = config
    
    // Verificar se já existe no pool
    const existing = this.playerPool.get(channel)
    if (existing && existing.iframe.parentNode) {
      existing.lastUsed = Date.now()
      existing.isActive = true
      return existing.iframe
    }

    // Criar novo player
    const iframe = this.createOptimizedIframe(config)
    
    // Adicionar ao pool
    this.playerPool.set(channel, {
      iframe,
      channel,
      isActive: true,
      lastUsed: Date.now()
    })

    // Manter pool dentro do limite
    this.maintainPoolSize()

    return iframe
  }

  /**
   * Preload player para canal específico
   */
  async preloadPlayer(channel: string): Promise<void> {
    if (!this.playerPool.has(channel)) {
      const config: TwitchPlayerConfig = {
        channel,
        autoplay: false, // Não autoplay no preload
        muted: true
      }
      
      const iframe = this.createOptimizedIframe(config)
      
      // Criar elemento oculto para preload
      iframe.style.position = 'absolute'
      iframe.style.left = '-9999px'
      iframe.style.top = '-9999px'
      iframe.style.width = '320px'
      iframe.style.height = '180px'
      iframe.style.pointerEvents = 'none'
      
      document.body.appendChild(iframe)
      
      this.playerPool.set(channel, {
        iframe,
        channel,
        isActive: false,
        lastUsed: Date.now()
      })

      // Aguardar carregamento inicial
      return new Promise((resolve) => {
        iframe.onload = () => {
          setTimeout(resolve, 500) // Aguardar estabilização
        }
      })
    }
  }

  /**
   * Ativar player (mover para posição visível)
   */
  activatePlayer(channel: string, container: HTMLElement): HTMLIFrameElement | null {
    const player = this.playerPool.get(channel)
    if (!player) return null

    const { iframe } = player

    // Remover estilos de preload
    iframe.style.position = 'relative'
    iframe.style.left = 'auto'
    iframe.style.top = 'auto'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.pointerEvents = 'auto'

    // Mover para container
    if (iframe.parentNode !== container) {
      container.appendChild(iframe)
    }

    player.isActive = true
    player.lastUsed = Date.now()

    // Trigger autoplay otimizado
    this.triggerOptimizedAutoplay(iframe)

    return iframe
  }

  /**
   * Trigger de autoplay otimizado
   */
  private triggerOptimizedAutoplay(iframe: HTMLIFrameElement) {
    // Múltiplas estratégias de autoplay com timing otimizado
    const strategies = [
      () => iframe.click(),
      () => {
        try {
          iframe.contentWindow?.postMessage('{"event":"command","func":"play","args":""}', '*')
        } catch (e) {
          // Ignore cross-origin errors
        }
      },
      () => {
        // Simular interação do usuário
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        iframe.dispatchEvent(clickEvent)
      }
    ]

    // Executar estratégias com delays escalonados
    strategies.forEach((strategy, index) => {
      setTimeout(strategy, index * 100 + 100)
      setTimeout(strategy, index * 200 + 500) // Retry
    })
  }

  /**
   * Desativar player (mover para pool oculto)
   */
  deactivatePlayer(channel: string): void {
    const player = this.playerPool.get(channel)
    if (!player) return

    const { iframe } = player
    
    // Mover para posição oculta mas manter ativo
    iframe.style.position = 'absolute'
    iframe.style.left = '-9999px'
    iframe.style.top = '-9999px'
    iframe.style.pointerEvents = 'none'
    
    if (iframe.parentNode) {
      document.body.appendChild(iframe) // Mover para body
    }

    player.isActive = false
    player.lastUsed = Date.now()
  }

  /**
   * Manter pool dentro do tamanho limite
   */
  private maintainPoolSize(): void {
    if (this.playerPool.size <= this.maxPoolSize) return

    // Ordenar por último uso
    const entries = Array.from(this.playerPool.entries())
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed)

    // Remover os mais antigos
    const toRemove = entries.slice(0, entries.length - this.maxPoolSize)
    
    toRemove.forEach(([channel, player]) => {
      if (player.iframe.parentNode) {
        player.iframe.remove()
      }
      this.playerPool.delete(channel)
    })
  }

  /**
   * Cleanup periódico do pool
   */
  private cleanupPool(): void {
    const now = Date.now()
    const maxAge = 10 * 60 * 1000 // 10 minutos

    for (const [channel, player] of this.playerPool) {
      if (!player.isActive && (now - player.lastUsed) > maxAge) {
        if (player.iframe.parentNode) {
          player.iframe.remove()
        }
        this.playerPool.delete(channel)
      }
    }
  }

  /**
   * Obter estatísticas do pool
   */
  getStats() {
    return {
      poolSize: this.playerPool.size,
      maxPoolSize: this.maxPoolSize,
      activePlayers: Array.from(this.playerPool.values()).filter(p => p.isActive).length,
      players: Array.from(this.playerPool.entries()).map(([channel, player]) => ({
        channel,
        isActive: player.isActive,
        lastUsed: new Date(player.lastUsed).toISOString(),
        age: Date.now() - player.lastUsed
      }))
    }
  }

  /**
   * Destruir todos os players
   */
  destroy(): void {
    for (const [channel, player] of this.playerPool) {
      if (player.iframe.parentNode) {
        player.iframe.remove()
      }
    }
    this.playerPool.clear()
  }
}

// Instância singleton
export const optimizedTwitchPlayer = new OptimizedTwitchPlayer()

// Cleanup no unload da página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    optimizedTwitchPlayer.destroy()
  })
}

/**
 * Hook para usar o player otimizado
 */
export function useOptimizedTwitchPlayer() {
  return {
    getPlayer: (config: TwitchPlayerConfig) => optimizedTwitchPlayer.getPlayer(config),
    preloadPlayer: (channel: string) => optimizedTwitchPlayer.preloadPlayer(channel),
    activatePlayer: (channel: string, container: HTMLElement) => 
      optimizedTwitchPlayer.activatePlayer(channel, container),
    deactivatePlayer: (channel: string) => optimizedTwitchPlayer.deactivatePlayer(channel),
    getStats: () => optimizedTwitchPlayer.getStats()
  }
}
