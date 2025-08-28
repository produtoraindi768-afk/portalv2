import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de performance para todos os requests
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  
  // Otimizações específicas por tipo de conteúdo
  const { pathname } = request.nextUrl

  // API Routes - Cache otimizado
  if (pathname.startsWith('/api/')) {
    // Cache mais agressivo para dados de streamers
    if (pathname.includes('/streamers') || pathname.includes('/featured')) {
      response.headers.set(
        'Cache-Control', 
        'public, s-maxage=120, stale-while-revalidate=300'
      )
    }
    
    // Cache para AI chat (resposta rápida)
    if (pathname.includes('/ai/')) {
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
      )
    }

    // CORS otimizado para APIs
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  }

  // Assets estáticos - Cache longo
  if (pathname.startsWith('/_next/static/') || 
      pathname.startsWith('/favicon') || 
      pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // Páginas - Cache com revalidation
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
  }

  // Preload hints para recursos críticos
  if (pathname === '/') {
    // Preload recursos críticos para a homepage
    response.headers.set('Link', [
      '</api/streamers>; rel=prefetch',
      '<https://player.twitch.tv>; rel=preconnect',
      '<https://static-cdn.jtvnw.net>; rel=preconnect',
      '<https://fonts.googleapis.com>; rel=preconnect',
    ].join(', '))
  }

  // Security headers otimizados
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP otimizado para Twitch embeds
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' player.twitch.tv *.twitch.tv; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "media-src 'self' https: blob:; " +
    "connect-src 'self' https: wss: ws:; " +
    "frame-src 'self' player.twitch.tv *.twitch.tv; " +
    "worker-src 'self' blob:; " +
    "font-src 'self' https:"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
