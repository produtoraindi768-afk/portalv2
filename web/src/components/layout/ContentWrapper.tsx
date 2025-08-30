import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ContentWrapperProps {
  children: ReactNode
  /**
   * Layout pattern for the content
   * - stack: vertical stacking with consistent spacing (default)
   * - grid-2: 2-column responsive grid
   * - grid-3: 3-column responsive grid  
   * - grid-4: 4-column responsive grid
   * - flex: horizontal flexbox layout
   * - centered: centered content with max-width
   */
  layout?: "stack" | "grid-2" | "grid-3" | "grid-4" | "flex" | "centered"
  /**
   * Gap between elements
   * - tight: gap-4 - minimal spacing
   * - normal: gap-6 - standard spacing (default)
   * - loose: gap-8 - extra spacing
   * - spacious: gap-12 - maximum spacing
   */
  gap?: "tight" | "normal" | "compact" | "loose" | "spacious"
  /**
   * Alignment for flex and grid layouts
   */
  align?: "start" | "center" | "end" | "stretch"
  /**
   * Justify content for flex layouts
   */
  justify?: "start" | "center" | "end" | "between" | "around"
  className?: string
}

const layoutClasses = {
  stack: "flex flex-col",
  "grid-2": "grid grid-cols-1 sm:grid-cols-2",
  "grid-3": "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  "grid-4": "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  flex: "flex flex-col sm:flex-row",
  centered: "flex flex-col items-center max-w-2xl mx-auto text-center"
}

const gapClasses = {
  tight: "gap-3 sm:gap-4",
  normal: "gap-4 sm:gap-6",
  compact: "gap-3 sm:gap-4",
  loose: "gap-6 sm:gap-8", 
  spacious: "gap-8 sm:gap-12"
}

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch"
}

const justifyClasses = {
  start: "justify-start",
  center: "justify-center", 
  end: "justify-end",
  between: "justify-between",
  around: "justify-around"
}

/**
 * ContentWrapper - Standardized content container component
 * 
 * Provides consistent:
 * - Layout patterns (stack, grid, flex)
 * - Spacing between elements
 * - Alignment and justification
 * - Responsive behavior
 * 
 * Usage Examples:
 * - <ContentWrapper>items</ContentWrapper> // Vertical stack
 * - <ContentWrapper layout="grid-3" gap="loose">grid items</ContentWrapper>
 * - <ContentWrapper layout="flex" justify="between">flex items</ContentWrapper>
 */
export function ContentWrapper({
  children,
  layout = "stack",
  gap = "normal",
  align = "stretch",
  justify = "start", 
  className
}: ContentWrapperProps) {
  return (
    <div
      className={cn(
        layoutClasses[layout],
        gapClasses[gap],
        (layout === "flex" || layout.startsWith("grid")) && alignClasses[align],
        layout === "flex" && justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  )
}