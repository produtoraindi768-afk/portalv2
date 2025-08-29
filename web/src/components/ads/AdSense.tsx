'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  adLayout?: string
  adLayoutKey?: string
  className?: string
  style?: React.CSSProperties
  responsive?: boolean
}

export function AdSense({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  className,
  style,
  responsive = true,
}: AdSenseProps) {
  useEffect(() => {
    try {
      // Verifica se o AdSense está disponível
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('Erro ao carregar anúncio AdSense:', error)
    }
  }, [])

  return (
    <div className={cn('w-full flex justify-center', className)}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client="ca-pub-4101364659538880"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

// Componente para anúncio responsivo padrão
export function ResponsiveAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      className={cn('my-4', className)}
      responsive
    />
  )
}

// Componente para anúncio em formato retângulo
export function RectangleAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="rectangle"
      className={cn('my-4', className)}
      style={{ width: '300px', height: '250px' }}
      responsive={false}
    />
  )
}

// Componente para banner horizontal
export function BannerAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="horizontal"
      className={cn('my-4', className)}
      style={{ width: '728px', height: '90px' }}
      responsive={false}
    />
  )
}

// Componente para anúncio vertical (sidebar)
export function SidebarAd({ adSlot, className }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="vertical"
      className={cn('my-4', className)}
      style={{ width: '160px', height: '600px' }}
      responsive={false}
    />
  )
}