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
        "group overflow-hidden transition-all duration-200 cursor-pointer border-border/50 bg-card",
        "h-24 grid grid-cols-[120px_1fr] gap-0 p-0",
        className
      )}>
        <div className="relative h-24 overflow-hidden flex-shrink-0 rounded-l-lg -m-px">
          <Skeleton className="w-full h-full" />
        </div>
        
        <div className="p-3 sm:p-4 flex flex-col justify-between min-h-0">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </Card>
    )
  }

  if (variant === 'featured') {
    return (
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 cursor-pointer border-border/50 bg-card",
        "ring-2 ring-primary/20 shadow-lg shadow-primary/10",
        "h-[480px] sm:h-[520px] md:h-[560px] grid grid-rows-[auto_1fr_auto] gap-0 p-0",
        className
      )}>
        <div className="relative h-44 sm:h-48 md:h-52 overflow-hidden flex-shrink-0 rounded-t-lg -m-px">
          <Skeleton className="w-full h-full" />
          
          <div className="absolute top-4 left-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between min-h-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-2" />
              <Skeleton className="h-3 w-16" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-4/5" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 pt-2 flex-shrink-0 min-h-[56px] sm:min-h-[60px]">
          <div className="flex items-center justify-between pt-4 border-t border-border/20">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-200 cursor-pointer border-border/50 bg-card",
      "h-[420px] sm:h-[460px] md:h-[500px] grid grid-rows-[auto_1fr_auto] gap-0 p-0",
      className
    )}>
      <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden flex-shrink-0 rounded-t-lg -m-px">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between min-h-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-14" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 pt-2 flex-shrink-0 min-h-[56px] sm:min-h-[60px]">
        <div className="flex items-center justify-between pt-4 border-t border-border/20">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </Card>
  )
}