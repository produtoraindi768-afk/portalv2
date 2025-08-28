"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const AvatarWithSkeleton = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    src?: string
    alt?: string
    fallback?: string
    isLoading?: boolean
  }
>(({ className, src, alt, fallback, isLoading, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  // Reset states when src changes
  React.useEffect(() => {
    if (src) {
      setImageLoaded(false)
      setImageError(false)
    }
  }, [src])

  if (isLoading) {
    return (
      <div 
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        <Skeleton className="h-full w-full rounded-full" />
      </div>
    )
  }

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className={cn(
            "aspect-square h-full w-full transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : null}
      
      <AvatarPrimitive.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted transition-opacity duration-300",
          imageLoaded ? "opacity-0" : "opacity-100"
        )}
      >
        {imageError || !src ? (
          <span className="text-sm font-medium">
            {fallback?.charAt(0).toUpperCase() || "A"}
          </span>
        ) : (
          <Skeleton className="h-full w-full rounded-full" />
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
})

AvatarWithSkeleton.displayName = "AvatarWithSkeleton"

export { AvatarWithSkeleton }