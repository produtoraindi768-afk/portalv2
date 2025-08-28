import React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted/70 animate-pulse rounded-md",
        "relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent",
        "before:animate-shimmer before:-translate-x-full",
        className
      )}
      {...props}
    />
  )
}

// Skeleton para player de vídeo
const SkeletonPlayer = React.memo<{
  aspectRatio?: string
  className?: string
  showControls?: boolean
}>(({ aspectRatio = '16/9', className, showControls = true }) => {
  return (
    <div className={cn("relative bg-muted rounded-lg overflow-hidden", className)}>
      <div
        className="w-full bg-gradient-to-br from-muted to-muted/50 animate-pulse"
        style={{ aspectRatio }}
      >
        {/* Play button skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-background/40 rounded-sm" />
          </div>
        </div>

        {/* Loading text */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Controls skeleton */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
              <Skeleton className="flex-1 h-2 bg-white/20" />
              <Skeleton className="w-12 h-6 bg-white/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

SkeletonPlayer.displayName = 'SkeletonPlayer'

// Skeleton para card de streamer
const SkeletonStreamerCard = React.memo<{
  variant?: 'compact' | 'full'
  className?: string
}>(({ variant = 'full', className }) => {
  const isCompact = variant === 'compact'

  return (
    <div className={cn(
      "border rounded-lg animate-pulse",
      isCompact ? "p-2" : "p-3",
      className
    )}>
      <div className={cn(
        "flex items-center",
        isCompact ? "gap-2" : "gap-3"
      )}>
        {/* Avatar skeleton */}
        <Skeleton className={cn(
          "rounded-full flex-shrink-0",
          isCompact ? "w-8 h-8" : "w-12 h-12"
        )} />

        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {!isCompact && (
            <>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </>
          )}
        </div>
      </div>
    </div>
  )
})

SkeletonStreamerCard.displayName = 'SkeletonStreamerCard'

// Hook para controlar skeleton loading com duração mínima
function useSkeletonLoading(isLoading: boolean, minDuration: number = 500) {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading)
  const startTimeRef = React.useRef<number>(0)

  React.useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now()
      setShowSkeleton(true)
    } else {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, minDuration - elapsed)

      setTimeout(() => {
        setShowSkeleton(false)
      }, remaining)
    }
  }, [isLoading, minDuration])

  return showSkeleton
}

export {
  Skeleton,
  SkeletonPlayer,
  SkeletonStreamerCard,
  useSkeletonLoading
}
