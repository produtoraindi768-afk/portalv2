import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  /**
   * Maximum width variant for the page content
   * - narrow: max-w-4xl (768px) - for focused content like articles, forms
   * - standard: max-w-6xl (1152px) - default for most pages 
   * - wide: max-w-7xl (1280px) - for dashboards, data tables
   * - full: no max-width constraint - for hero sections, full-width layouts
   */
  maxWidth?: "narrow" | "standard" | "wide" | "full"
  /**
   * Vertical padding variant
   * - none: no padding
   * - compact: py-4 sm:py-6 - minimal vertical space
   * - normal: py-6 sm:py-8 - standard vertical space (default)
   * - spacious: py-8 sm:py-12 - extra vertical space
   * - hero: py-12 sm:py-16 lg:py-20 - for hero sections
   */
  paddingY?: "none" | "compact" | "normal" | "spacious" | "hero"
  /**
   * Horizontal padding variant
   * - none: no horizontal padding
   * - normal: px-4 sm:px-6 - standard horizontal padding (default)
   * - wide: px-6 sm:px-8 - extra horizontal padding
   */
  paddingX?: "none" | "normal" | "wide"
  className?: string
  /**
   * Whether to center the content horizontally
   */
  centered?: boolean
}

const maxWidthClasses = {
  narrow: "max-w-4xl",
  standard: "max-w-6xl", 
  wide: "max-w-7xl",
  full: ""
}

const paddingYClasses = {
  none: "",
  compact: "py-3 sm:py-4 md:py-6",
  normal: "py-4 sm:py-6 md:py-8",
  spacious: "py-6 sm:py-8 md:py-12",
  hero: "py-8 sm:py-12 md:py-16 lg:py-20"
}

const paddingXClasses = {
  none: "",
  normal: "px-3 sm:px-4 md:px-6",
  wide: "px-4 sm:px-6 md:px-8"
}

/**
 * PageWrapper - Standardized page-level layout component
 * 
 * Provides consistent:
 * - Maximum content width with responsive behavior
 * - Horizontal centering and padding
 * - Vertical spacing that adapts to screen size
 * - Mobile-first responsive design
 * 
 * Usage Examples:
 * - <PageWrapper>content</PageWrapper> // Standard layout
 * - <PageWrapper maxWidth="narrow" paddingY="compact">form content</PageWrapper>
 * - <PageWrapper maxWidth="full" paddingY="hero">hero section</PageWrapper>
 */
export function PageWrapper({
  children,
  maxWidth = "standard",
  paddingY = "normal", 
  paddingX = "normal",
  centered = true,
  className
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        "w-full",
        centered && "mx-auto",
        maxWidthClasses[maxWidth],
        paddingYClasses[paddingY],
        paddingXClasses[paddingX],
        className
      )}
    >
      {children}
    </div>
  )
}