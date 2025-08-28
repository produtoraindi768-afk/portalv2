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

export { Skeleton }
