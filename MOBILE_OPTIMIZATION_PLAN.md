# Plano de Otimização Mobile - Portal SafeZone SZ

## 📱 Visão Geral

Este documento apresenta um plano detalhado de otimização mobile para o Portal SafeZone SZ, focando em melhorar performance, usabilidade e experiência do usuário em dispositivos móveis.

### 🎯 Objetivos Principais

- **Performance**: Atingir Core Web Vitals ideais (LCP <2.5s, FID <100ms, CLS <0.1)
- **Usabilidade**: Melhorar navegação e interações touch
- **Responsividade**: Garantir experiência consistente em todos os dispositivos
- **Acessibilidade**: Cumprir diretrizes WCAG 2.1 AA para mobile

## 🔍 1. Análise da Situação Atual

### 1.1 Problemas Identificados

**Performance:**
- Ausência de configuração Tailwind customizada (usando padrões)
- Imagens não otimizadas (sem lazy loading nativo)
- Bundle size não otimizado
- Falta de code splitting estratégico

**Usabilidade Mobile:**
- Breakpoint mobile fixo em 768px (hook useMobile)
- Miniplayer com configurações mobile básicas
- Falta de gestos touch avançados
- Touch targets podem ser pequenos em alguns componentes

**Responsividade:**
- Layout funcional mas não otimizado para diferentes tamanhos
- Tipografia não escalonada adequadamente
- Espaçamentos não adaptados para mobile

### 1.2 Stack Tecnológico Atual

- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Performance**: Básica (Next.js padrão)
- **Mobile Detection**: Hook customizado simples

## 🛠️ 2. Especificação Técnica Detalhada

### 2.1 Sistema de Breakpoints Customizado

**Configuração Tailwind (tailwind.config.ts):**
```typescript
export default {
  theme: {
    screens: {
      'xs': '320px',   // Mobile pequeno
      'sm': '640px',   // Mobile grande
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop pequeno
      'xl': '1280px',  // Desktop
      '2xl': '1536px', // Desktop grande
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    }
  }
}
```

**Hook useBreakpoint:**
```typescript
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<string>('xs')
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 1536) setBreakpoint('2xl')
      else if (width >= 1280) setBreakpoint('xl')
      else if (width >= 1024) setBreakpoint('lg')
      else if (width >= 768) setBreakpoint('md')
      else if (width >= 640) setBreakpoint('sm')
      else setBreakpoint('xs')
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  return {
    breakpoint,
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint)
  }
}
```

### 2.2 Otimização de Componentes

**StreamersSection Mobile:**
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Touch gestures para navegação entre streams
- Players otimizados para mobile (dimensões menores)
- Lazy loading de previews

**NewsSection Mobile:**
- Cards com aspect ratio otimizado: `aspect-[4/3] sm:aspect-[16/9]`
- Tipografia escalonada: `text-sm sm:text-base lg:text-lg`
- Lazy loading de imagens com placeholder blur
- Infinite scroll para mobile

**HeroSection Mobile:**
- Layout stack em mobile: `flex-col lg:flex-row`
- Imagem hero otimizada: `aspect-[16/9] lg:aspect-[4/3]`
- CTAs com touch targets adequados: `min-h-[44px]`

### 2.3 Miniplayer Mobile Avançado

**Configurações Responsivas:**
```typescript
const MOBILE_CONFIGS = {
  xs: { width: 280, height: 158, margin: 8 },
  sm: { width: 320, height: 180, margin: 12 },
  md: { width: 400, height: 225, margin: 16 }
}
```

**Gestos Touch:**
- Swipe down para fechar
- Pinch para redimensionar
- Double tap para fullscreen
- Long press para menu de opções

### 2.4 Performance Otimizations

**Next.js Config:**
```typescript
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  }
}
```

**Dynamic Imports:**
```typescript
const MiniplPlayer = dynamic(() => import('@/components/miniplayer/FloatingMiniplayer'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-muted rounded-lg h-40" />
})
```

## 📋 3. Breakdown de Tarefas por Prioridade

### 🔥 Prioridade Alta (Impacto Alto, Esforço Baixo-Médio)

1. **Configuração Tailwind Customizada** (2-3 horas)
   - Criar tailwind.config.ts
   - Implementar breakpoints customizados
   - Adicionar safe areas para iOS

2. **Otimização de Imagens** (3-4 horas)
   - Substituir `<img>` por `<Image>` do Next.js
   - Configurar lazy loading e blur placeholder
   - Otimizar dimensões e formatos

3. **Hook useBreakpoint** (2 horas)
   - Implementar detecção de breakpoints
   - Adicionar suporte SSR
   - Integrar com componentes existentes

### ⚡ Prioridade Média (Impacto Médio-Alto, Esforço Médio)

4. **Otimização StreamersSection** (4-5 horas)
   - Grid responsivo
   - Touch gestures básicos
   - Players mobile otimizados

5. **Header Colapsível** (3-4 horas)
   - Implementar hide/show no scroll
   - Otimizar menu mobile
   - Melhorar animações

6. **Miniplayer Gestos** (5-6 horas)
   - Swipe para fechar
   - Drag otimizado
   - Controles touch-friendly

### 🎯 Prioridade Baixa (Impacto Médio, Esforço Alto)

7. **Service Worker** (6-8 horas)
   - Cache estratégico
   - Offline support básico
   - Background sync

8. **Gestos Avançados** (8-10 horas)
   - Pull-to-refresh
   - Swipe navigation
   - Biblioteca de gestos

## 📊 4. Critérios de Aceite e Métricas

### 4.1 Core Web Vitals Targets

| Métrica | Target Mobile | Método de Medição |
|---------|---------------|-------------------|
| LCP | < 2.5s | Lighthouse, PageSpeed Insights |
| FID | < 100ms | Real User Monitoring |
| CLS | < 0.1 | Lighthouse, Web Vitals |
| TTI | < 3.8s | Lighthouse |

### 4.2 Métricas de Usabilidade

- **Touch Target Size**: Mínimo 44px x 44px
- **Scroll Performance**: 60fps consistente
- **Navigation Speed**: < 200ms entre seções
- **Gesture Response**: < 16ms de latência

### 4.3 Testes de Validação

1. **Lighthouse CI**: Score > 90 em Performance e Accessibility
2. **PageSpeed Insights**: Score > 85 mobile
3. **Cross-browser**: Chrome, Safari, Firefox mobile
4. **Device Testing**: iPhone SE, iPhone 14, Samsung Galaxy, iPad

## 🚀 5. Cronograma de Implementação

### Semana 1: Fundação
- [ ] Configuração Tailwind customizada
- [ ] Hook useBreakpoint
- [ ] Otimização básica de imagens

### Semana 2: Componentes Core
- [ ] StreamersSection mobile
- [ ] NewsSection mobile
- [ ] HeroSection mobile

### Semana 3: Navegação e UX
- [ ] Header colapsível
- [ ] Menu mobile otimizado
- [ ] Touch targets

### Semana 4: Performance e Gestos
- [ ] Miniplayer gestos
- [ ] Code splitting
- [ ] Testes e validação

## 📈 6. Monitoramento e Manutenção

### 6.1 Ferramentas de Monitoramento

- **Web Vitals**: Tracking automático
- **Lighthouse CI**: Integração no pipeline
- **Real User Monitoring**: Analytics de performance
- **Error Tracking**: Sentry para erros mobile

### 6.2 Processo de Validação

1. **Pre-commit**: Lighthouse checks
2. **PR Review**: Performance budget validation
3. **Staging**: Cross-device testing
4. **Production**: Continuous monitoring

## 🔧 7. Implementação Técnica Detalhada

### 7.1 Configuração Tailwind Customizada

**Arquivo: `web/tailwind.config.ts`**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '44px', // Minimum touch target
      },
      minWidth: {
        'touch': '44px',
      },
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1rem' }],
        'sm-mobile': ['0.875rem', { lineHeight: '1.25rem' }],
        'base-mobile': ['1rem', { lineHeight: '1.5rem' }],
      }
    },
  },
  plugins: [],
}

export default config
```

### 7.2 Hooks Customizados

**Arquivo: `src/hooks/useBreakpoint.ts`**
```typescript
import { useState, useEffect } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointHook {
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
}

export function useBreakpoint(): BreakpointHook {
  const [state, setState] = useState<BreakpointHook>({
    breakpoint: 'xs',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 0
  })

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      let breakpoint: Breakpoint = 'xs'

      if (width >= 1536) breakpoint = '2xl'
      else if (width >= 1280) breakpoint = 'xl'
      else if (width >= 1024) breakpoint = 'lg'
      else if (width >= 768) breakpoint = 'md'
      else if (width >= 640) breakpoint = 'sm'

      setState({
        breakpoint,
        isMobile: ['xs', 'sm'].includes(breakpoint),
        isTablet: breakpoint === 'md',
        isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
        width
      })
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return state
}
```

### 7.3 Componente de Imagem Otimizada

**Arquivo: `src/components/ui/optimized-image.tsx`**
```typescript
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  aspectRatio?: string
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
  aspectRatio = '16/9'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={cn(
        'bg-muted rounded-lg flex items-center justify-center',
        `aspect-[${aspectRatio}]`,
        className
      )}>
        <span className="text-muted-foreground text-sm">Imagem não disponível</span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}
```

### 7.4 Touch Gesture Hook

**Arquivo: `src/hooks/useTouchGestures.ts`**
```typescript
import { useRef, useEffect, RefObject } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onDoubleTap?: () => void
  threshold?: number
}

export function useTouchGestures<T extends HTMLElement>(
  options: TouchGestureOptions
): RefObject<T> {
  const elementRef = useRef<T>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<number>(0)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const threshold = options.threshold || 50

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Double tap detection
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
        const now = Date.now()
        if (now - lastTapRef.current < 300) {
          options.onDoubleTap?.()
        }
        lastTapRef.current = now
      }

      // Swipe detection
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            options.onSwipeRight?.()
          } else {
            options.onSwipeLeft?.()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            options.onSwipeDown?.()
          } else {
            options.onSwipeUp?.()
          }
        }
      }

      touchStartRef.current = null
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [options])

  return elementRef
}
```

## 🎨 8. Otimizações Específicas por Componente

### 8.1 StreamersSection Mobile

**Problemas Atuais:**
- Grid fixo não otimizado para mobile
- Players com dimensões inadequadas para telas pequenas
- Falta de navegação touch-friendly

**Implementação:**
```typescript
// src/components/sections/StreamersSection.tsx
export function StreamersSection() {
  const { isMobile, breakpoint } = useBreakpoint()
  const touchRef = useTouchGestures<HTMLDivElement>({
    onSwipeLeft: () => scrollToNext(),
    onSwipeRight: () => scrollToPrevious()
  })

  const gridCols = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4
  }[breakpoint]

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container px-4 sm:px-6">
        <div
          ref={touchRef}
          className={`grid gap-4 sm:gap-6 grid-cols-${gridCols}`}
        >
          {streamers.map((streamer) => (
            <StreamerCard
              key={streamer.id}
              streamer={streamer}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 8.2 NewsSection Mobile

**Otimizações:**
- Cards com aspect ratio responsivo
- Lazy loading de imagens
- Infinite scroll para mobile

```typescript
// src/components/sections/NewsSection.tsx
export function NewsSection({ limit, showHeader = true }: NewsProps) {
  const { isMobile } = useBreakpoint()
  const [visibleCount, setVisibleCount] = useState(isMobile ? 6 : limit || 9)

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container px-4 sm:px-6">
        {showHeader && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Últimas Notícias
            </h2>
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, visibleCount).map((item) => (
            <article key={item.id} className="group">
              <OptimizedImage
                src={item.featuredImage || ''}
                alt={item.title || ''}
                className="aspect-[4/3] sm:aspect-[16/9] w-full mb-4"
                priority={false}
              />
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground line-clamp-3">
                  {item.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {isMobile && hasMore && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="min-h-touch min-w-touch"
            >
              Carregar mais
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
```

### 8.3 Header Colapsível

**Implementação:**
```typescript
// src/components/layout/SiteHeader.tsx
export function SiteHeader() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { isMobile } = useBreakpoint()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // Hide on scroll down
      } else {
        setIsVisible(true) // Show on scroll up
      }

      setLastScrollY(currentScrollY)
    }

    if (isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, isMobile])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 glass transition-transform duration-300',
      'pt-safe-top', // iOS safe area
      isVisible ? 'translate-y-0' : '-translate-y-full'
    )}>
      <nav className="mx-auto flex h-16 sm:h-20 w-full items-center gap-6 px-4 sm:px-6 lg:max-w-7xl">
        {/* Header content */}
      </nav>
    </header>
  )
}
```

### 8.4 Miniplayer Mobile Avançado

**Configurações Responsivas:**
```typescript
// src/hooks/use-miniplayer.ts
const RESPONSIVE_CONFIG = {
  xs: {
    defaultSize: { width: 280, height: 158 },
    minimizedSize: { width: 200, height: 36 },
    margin: 8,
    position: 'bottom-center' // Fixo no rodapé
  },
  sm: {
    defaultSize: { width: 320, height: 180 },
    minimizedSize: { width: 240, height: 40 },
    margin: 12,
    position: 'bottom-right'
  },
  md: {
    defaultSize: { width: 400, height: 225 },
    minimizedSize: { width: 300, height: 40 },
    margin: 16,
    position: 'bottom-right'
  }
}

export function useMiniplayer() {
  const { breakpoint, isMobile } = useBreakpoint()
  const config = RESPONSIVE_CONFIG[breakpoint] || RESPONSIVE_CONFIG.md

  // Mobile-specific behavior
  const mobilePosition = isMobile ? {
    bottom: `${config.margin}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    right: 'auto'
  } : {
    bottom: `${config.margin}px`,
    right: `${config.margin}px`,
    left: 'auto',
    transform: 'none'
  }

  return {
    config,
    position: mobilePosition,
    isMobile
  }
}
```

## 🚀 9. Performance Optimizations

### 9.1 Next.js Configuration

**Arquivo: `web/next.config.ts`**
```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
```

### 9.2 Dynamic Imports Strategy

```typescript
// Lazy load heavy components
const FloatingMiniplayer = dynamic(
  () => import('@/components/miniplayer/FloatingMiniplayer'),
  {
    ssr: false,
    loading: () => <MiniplPlayerSkeleton />
  }
)

const StreamersSection = dynamic(
  () => import('@/components/sections/StreamersSection'),
  {
    loading: () => <StreamersSkeleton />,
    ssr: true
  }
)

// Route-based code splitting
const NewsPage = dynamic(() => import('@/app/news/page'), {
  loading: () => <PageSkeleton />
})
```

## 📊 10. Monitoramento e Métricas

### 10.1 Web Vitals Tracking

**Arquivo: `src/lib/web-vitals.ts`**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

### 10.2 Performance Budget

**Arquivo: `.lighthouserc.js`**
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### 10.3 Bundle Analysis

**Scripts no package.json:**
```json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true next build",
    "lighthouse": "lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html",
    "perf:mobile": "lighthouse http://localhost:3000 --preset=perf --form-factor=mobile --throttling-method=devtools"
  }
}
```

## 🎯 11. Roadmap de Implementação

### Fase 1: Fundação (Semana 1)
- [x] **Análise da situação atual** - Identificar problemas específicos
- [ ] **Configuração Tailwind customizada** - Breakpoints e safe areas
- [ ] **Hook useBreakpoint** - Detecção responsiva avançada
- [ ] **Otimização básica de imagens** - Next.js Image component

### Fase 2: Componentes Core (Semana 2)
- [ ] **StreamersSection mobile** - Grid responsivo e touch gestures
- [ ] **NewsSection mobile** - Cards otimizados e lazy loading
- [ ] **HeroSection mobile** - Layout stack e CTAs touch-friendly
- [ ] **FooterSection mobile** - Layout colapsível

### Fase 3: Navegação e UX (Semana 3)
- [ ] **Header colapsível** - Hide/show no scroll
- [ ] **Menu mobile otimizado** - Animações e gestos
- [ ] **Touch targets** - Mínimo 44px para todos os elementos
- [ ] **Miniplayer gestos básicos** - Swipe e drag

### Fase 4: Performance Avançada (Semana 4)
- [ ] **Code splitting estratégico** - Dynamic imports
- [ ] **Service Worker** - Cache e offline support
- [ ] **Gestos avançados** - Pull-to-refresh, swipe navigation
- [ ] **Testes e validação** - Lighthouse CI, cross-device testing

## 🔍 12. Checklist de Validação

### Performance
- [ ] LCP < 2.5s em 3G
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTI < 3.8s
- [ ] Bundle size < 250KB (gzipped)

### Usabilidade Mobile
- [ ] Touch targets ≥ 44px
- [ ] Scroll performance 60fps
- [ ] Gestos funcionais (swipe, pinch, tap)
- [ ] Navegação intuitiva
- [ ] Feedback visual adequado

### Responsividade
- [ ] Layout funcional em 320px-2560px
- [ ] Tipografia escalonada
- [ ] Imagens responsivas
- [ ] Safe areas (iOS)
- [ ] Orientação portrait/landscape

### Acessibilidade
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators visíveis

## 📋 13. Próximos Passos Imediatos

### 1. Setup Inicial (2-3 horas)
```bash
# 1. Criar configuração Tailwind
touch web/tailwind.config.ts

# 2. Implementar hooks
mkdir -p web/src/hooks
touch web/src/hooks/useBreakpoint.ts
touch web/src/hooks/useTouchGestures.ts

# 3. Criar componentes otimizados
mkdir -p web/src/components/ui
touch web/src/components/ui/optimized-image.tsx
```

### 2. Configuração de Monitoramento (1 hora)
```bash
# Instalar dependências
npm install --save-dev @next/bundle-analyzer lighthouse
npm install web-vitals

# Configurar Lighthouse CI
touch .lighthouserc.js
```

### 3. Primeira Implementação (4-5 horas)
1. Implementar configuração Tailwind customizada
2. Criar hook useBreakpoint
3. Substituir imagens por OptimizedImage component
4. Testar em dispositivos móveis

### 4. Validação Inicial (1 hora)
1. Executar Lighthouse audit
2. Testar em Chrome DevTools mobile
3. Verificar Core Web Vitals
4. Documentar baseline metrics

---

**🎯 Meta**: Melhorar score mobile do Lighthouse de ~70 para >90 e reduzir LCP de ~4s para <2.5s em 4 semanas.

**📞 Contato**: Para dúvidas sobre implementação, consultar documentação técnica ou solicitar code review.
