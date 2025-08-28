'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type NewsVariant } from '@/lib/text-utils'

interface NewsCardSkeletonProps {
  variant?: NewsVariant
  className?: string
}

export function NewsCardSkeleton({ 
  variant = 'default',
  className 
}: NewsCardSkeletonProps) {
  
  if (variant === 'compact') {
    return (
      <Card className={cn(
        "overflow-hidden border-border/50 bg-card",
        "h-24 flex gap-0 p-0",
        className
      )}>
        {/* Image skeleton */}
        <div className="w-32 h-full flex-shrink-0">
          <Skeleton className="w-full h-full rounded-l-lg rounded-r-none" />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <span className="text-muted-foreground">•</span>
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </Card>
    )
  }

  if (variant === 'featured') {
    return (
      <Card className={cn(
        "overflow-hidden border-2 border-primary/20 bg-card shadow-lg",
        "h-[520px] flex flex-col p-0",
        className
      )}>
        {/* Image skeleton */}
        <div className="relative h-52 flex-shrink-0">
          <Skeleton className="w-full h-full rounded-t-lg rounded-b-none" />
          
          {/* Featured badge skeleton */}
          <div className="absolute top-4 left-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Category and date */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <span className="text-muted-foreground">•</span>
              <Skeleton className="h-3 w-16" />
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-4/5" />
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border/20">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn(
      "overflow-hidden border-border/50 bg-card",
      "h-[460px] flex flex-col p-0",
      className
    )}>
      {/* Image skeleton */}
      <div className="h-44 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-t-lg rounded-b-none" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Category and date */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <span className="text-muted-foreground">•</span>
            <Skeleton className="h-3 w-14" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/20">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
    </Card>
  )
}