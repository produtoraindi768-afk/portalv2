import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TypographyProps {
  children: ReactNode
  /**
   * Typography variant following a consistent scale
   * - h1: 3xl/tight font-bold - Main page titles (balanced hierarchy)
   * - h2: 2xl/tight font-bold - Section headings
   * - h3: xl/tight font-semibold - Subsection headings
   * - h4: lg font-semibold - Component headings
   * - h5: base font-medium - Small headings
   * - h6: sm font-medium - Smallest headings
   * - hero: 4xl/tight font-bold - Special hero titles (larger impact)
   * - body-lg: lg - Large body text
   * - body: base - Standard body text (default)
   * - body-sm: sm - Small body text
   * - caption: xs - Caption/helper text
   * - lead: lg text-muted-foreground - Lead paragraphs
   * - muted: base text-muted-foreground - Muted text
   */
  variant?: 
    | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "hero"
    | "body-lg" | "body" | "body-sm" | "caption" 
    | "lead" | "muted"
  /**
   * HTML tag to render as (auto-detected from variant by default)
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"
  /**
   * Text alignment
   */
  align?: "left" | "center" | "right"
  /**
   * Maximum width for long text readability
   */
  maxWidth?: "none" | "prose" | "narrow" | "wide"
  className?: string
}

const variantStyles = {
  h1: "text-2xl/tight font-bold tracking-tight sm:text-3xl/tight md:text-4xl/tight",
  h2: "text-xl/tight font-bold tracking-tight sm:text-2xl/tight md:text-3xl/tight", 
  h3: "text-lg/tight font-semibold tracking-tight sm:text-xl/tight md:text-2xl/tight",
  h4: "text-base font-semibold tracking-tight sm:text-lg md:text-xl",
  h5: "text-sm font-medium tracking-tight sm:text-base md:text-lg",
  h6: "text-xs font-medium tracking-tight sm:text-sm md:text-base",
  hero: "text-3xl/tight font-bold tracking-tight sm:text-4xl/tight md:text-5xl/tight",
  "body-lg": "text-base leading-relaxed sm:text-lg",
  body: "text-sm leading-relaxed sm:text-base",
  "body-sm": "text-xs leading-relaxed sm:text-sm", 
  caption: "text-xs leading-normal text-muted-foreground",
  lead: "text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl/relaxed",
  muted: "text-sm leading-relaxed text-muted-foreground sm:text-base"
}

const defaultTags = {
  h1: "h1",
  h2: "h2", 
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  hero: "h1",
  "body-lg": "p",
  body: "p",
  "body-sm": "p",
  caption: "span",
  lead: "p", 
  muted: "p"
} as const

const alignClasses = {
  left: "text-left",
  center: "text-center", 
  right: "text-right"
}

const maxWidthClasses = {
  none: "",
  prose: "max-w-prose",
  narrow: "max-w-2xl",
  wide: "max-w-4xl"
}

/**
 * Typography - Standardized typography component
 * 
 * Provides consistent:
 * - Font sizes and weights following design system scale
 * - Line heights optimized for readability
 * - Responsive typography that scales appropriately
 * - Semantic HTML tags
 * - Text alignment and max-width for readability
 * 
 * Usage Examples:
 * - <Typography variant="h1">Page Title</Typography>
 * - <Typography variant="body" maxWidth="prose">Long article text</Typography>
 * - <Typography variant="muted" as="span">Helper text</Typography>
 */
export function Typography({
  children,
  variant = "body",
  as,
  align = "left",
  maxWidth = "none", 
  className
}: TypographyProps) {
  const Component = as || defaultTags[variant] as any
  
  return (
    <Component
      className={cn(
        variantStyles[variant],
        alignClasses[align],
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </Component>
  )
}

// Convenience components for common usage
export const Heading1 = ({ children, className, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="h1" className={className} {...props}>{children}</Typography>
)

export const Heading2 = ({ children, className, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="h2" className={className} {...props}>{children}</Typography>
)

export const Heading3 = ({ children, className, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="h3" className={className} {...props}>{children}</Typography>
)

export const BodyText = ({ children, className, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="body" className={className} {...props}>{children}</Typography>
)

export const LeadText = ({ children, className, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="lead" className={className} {...props}>{children}</Typography>
)

export const MutedText = ({ children, className, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="muted" className={className} {...props}>{children}</Typography>
)