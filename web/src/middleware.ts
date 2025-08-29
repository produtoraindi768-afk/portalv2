import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Headers básicos de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP básico para Twitch embeds
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

  // Cache básico apenas para assets estáticos
  if (pathname.startsWith('/_next/static/') || 
      pathname.startsWith('/favicon') || 
      pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
