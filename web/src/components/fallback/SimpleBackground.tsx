import React from 'react'
import { cn } from '@/lib/utils'

interface SimpleBackgroundProps {
  children: React.ReactNode
  className?: string
  starColor?: string
}

/**
 * Simple background component without motion hooks
 * Used as fallback when motion library has issues
 */
export default function SimpleBackground({ 
  children, 
  className,
  starColor = '#ffffff' 
}: SimpleBackgroundProps) {
  return (
    <div 
      className={cn(
        'relative size-full overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#262626_0%,_#000_100%)]',
        className
      )}
      style={{
        backgroundImage: `
          radial-gradient(2px 2px at 20px 30px, ${starColor}, transparent),
          radial-gradient(2px 2px at 40px 70px, ${starColor}, transparent),
          radial-gradient(1px 1px at 90px 40px, ${starColor}, transparent),
          radial-gradient(1px 1px at 130px 80px, ${starColor}, transparent),
          radial-gradient(2px 2px at 160px 30px, ${starColor}, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
      }}
    >
      {children}
    </div>
  )
}
