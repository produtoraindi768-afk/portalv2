import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface SectionWrapperProps {
  children: ReactNode
  /**
   * HTML tag to render as
   */
  as?: "section" | "div" | "article" | "main" | "aside"
  /**
   * Spacing variant between sections
   * - none: no margin
   * - compact: mb-8 sm:mb-12 - compact spacing
   * - normal: mb-12 sm:mb-16 - standard spacing (default)
   * - spacious: mb-16 sm:mb-20 - extra spacing
   * - hero: mb-20 sm:mb-24 lg:mb-32 - large spacing for hero sections
   */
  spacing?: "none" | "compact" | "normal" | "spacious" | "hero"
  /**
   * Background style variant
   * - transparent: no background (default)
   * - subtle: subtle background with border
   * - card: card-style background with elevation
   * - muted: muted background color
   * - gradient: gradient background
   */
  background?: "transparent" | "subtle" | "card" | "muted" | "gradient"
  /**
   * Whether the section should be full-width (no horizontal constraints)
   */
  fullWidth?: boolean
  className?: string
  id?: string
}

const spacingClasses = {
  none: "",
  compact: "mb-4 sm:mb-6 md:mb-8",        // 16px → 24px → 32px (Apple harmonic)
  normal: "mb-6 sm:mb-8 md:mb-12",        // 24px → 32px → 48px (balanced)
  spacious: "mb-8 sm:mb-12 md:mb-16",     // 32px → 48px → 64px (generous) 
  hero: "mb-12 sm:mb-16 md:mb-20 lg:mb-24" // 48px → 64px → 80px → 96px (dramatic)
}

const backgroundClasses = {
  transparent: "",
  subtle: "bg-card/50 border border-border/50 rounded-xl",
  card: "bg-card border border-border rounded-xl shadow-sm",
  muted: "bg-muted/50",
  gradient: "bg-gradient-to-br from-primary/5 via-background to-accent/5"
}

/**
 * SectionWrapper - Standardized section container component
 * 
 * Provides consistent:
 * - Section spacing and margins
 * - Background styling variants
 * - Semantic HTML structure
 * - Responsive behavior
 * 
 * Usage Examples:
 * - <SectionWrapper>content</SectionWrapper> // Basic section
 * - <SectionWrapper as="article" background="card">article content</SectionWrapper>
 * - <SectionWrapper spacing="hero" background="gradient">hero section</SectionWrapper>
 */
export function SectionWrapper({
  children,
  as: Component = "section",
  spacing = "normal",
  background = "transparent",
  fullWidth = false,
  className,
  id
}: SectionWrapperProps) {
  return (
    <Component
      id={id}
      className={cn(
        "w-full",
        !fullWidth && "relative",
        spacingClasses[spacing],
        backgroundClasses[background],
        className
      )}
    >
      {children}
    </Component>
  )
}