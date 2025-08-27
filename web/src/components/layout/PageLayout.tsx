import { ReactNode } from "react"
import { PageWrapper } from "./PageWrapper"
import { SectionWrapper } from "./SectionWrapper"
import { ContentWrapper } from "./ContentWrapper"
import { Typography } from "@/components/ui/typography"
import { Separator } from "@/components/ui/separator"

interface PageLayoutProps {
  children: ReactNode
  /**
   * Pre-configured page layout patterns
   * - default: Standard page with normal spacing
   * - narrow: Focused content like articles, forms (max-w-4xl)
   * - wide: Dashboards, data-heavy pages (max-w-7xl)
   * - hero: Landing page with hero section
   * - dashboard: Dashboard layout with compact spacing
   * - article: Article/blog post layout optimized for reading
   */
  pattern?: "default" | "narrow" | "wide" | "hero" | "dashboard" | "article"
  
  /**
   * Page title (optional)
   */
  title?: string
  
  /**
   * Page description/subtitle (optional)
   */
  description?: string
  
  /**
   * Custom header content (replaces title/description if provided)
   */
  header?: ReactNode
  
  /**
   * Whether to show header section
   */
  showHeader?: boolean
  
  /**
   * Whether to show a separator after the header section
   */
  showHeaderSeparator?: boolean
  
  className?: string
}

const patternConfigs = {
  default: {
    maxWidth: "standard" as const,
    paddingY: "normal" as const,
    spacing: "normal" as const,
    background: "transparent" as const
  },
  narrow: {
    maxWidth: "narrow" as const, 
    paddingY: "normal" as const,
    spacing: "normal" as const,
    background: "transparent" as const
  },
  wide: {
    maxWidth: "wide" as const,
    paddingY: "normal" as const, 
    spacing: "normal" as const,
    background: "transparent" as const
  },
  hero: {
    maxWidth: "full" as const,
    paddingY: "hero" as const,
    spacing: "hero" as const,
    background: "gradient" as const
  },
  dashboard: {
    maxWidth: "wide" as const,
    paddingY: "compact" as const,
    spacing: "compact" as const, 
    background: "transparent" as const
  },
  article: {
    maxWidth: "narrow" as const,
    paddingY: "spacious" as const,
    spacing: "spacious" as const,
    background: "subtle" as const
  }
}

/**
 * PageLayout - High-level layout component combining all layout patterns
 * 
 * Provides pre-configured layout patterns for common page types.
 * Combines PageWrapper, SectionWrapper, and ContentWrapper with sensible defaults.
 * 
 * Usage Examples:
 * - <PageLayout pattern="default" title="Page Title">content</PageLayout>
 * - <PageLayout pattern="article" title="Article" description="Subtitle">article content</PageLayout>
 * - <PageLayout pattern="dashboard">dashboard content</PageLayout>
 */
export function PageLayout({
  children,
  pattern = "default",
  title,
  description, 
  header,
  showHeader = true,
  showHeaderSeparator = false,
  className
}: PageLayoutProps) {
  const config = patternConfigs[pattern]
  
  const headerContent = header || (title && (
    <ContentWrapper layout="stack" gap="tight">
      <Typography variant="h1">{title}</Typography>
      {description && (
        <Typography variant="lead" maxWidth="wide">
          {description}
        </Typography>
      )}
    </ContentWrapper>
  ))
  
  return (
    <SectionWrapper 
      spacing={config.spacing}
      background={config.background}
      className={className}
    >
      <PageWrapper
        maxWidth={config.maxWidth}
        paddingY={config.paddingY}
      >
        <ContentWrapper layout="stack">
          {showHeader && headerContent && (
            <>
              <div className="mb-8 sm:mb-12">
                {headerContent}
              </div>
              
              {/* Optional separator after header */}
              {showHeaderSeparator && (
                <div className="mb-8 sm:mb-12">
                  <Separator className="bg-border/50" />
                </div>
              )}
            </>
          )}
          {children}
        </ContentWrapper>
      </PageWrapper>
    </SectionWrapper>
  )
}

// Convenience components for specific patterns
export const DefaultPageLayout = ({ children, ...props }: Omit<PageLayoutProps, "pattern">) => (
  <PageLayout pattern="default" {...props}>{children}</PageLayout>
)

export const NarrowPageLayout = ({ children, ...props }: Omit<PageLayoutProps, "pattern">) => (
  <PageLayout pattern="narrow" {...props}>{children}</PageLayout>
)

export const WidePageLayout = ({ children, ...props }: Omit<PageLayoutProps, "pattern">) => (
  <PageLayout pattern="wide" {...props}>{children}</PageLayout>
)

export const DashboardPageLayout = ({ children, ...props }: Omit<PageLayoutProps, "pattern">) => (
  <PageLayout pattern="dashboard" {...props}>{children}</PageLayout>
)

export const ArticlePageLayout = ({ children, ...props }: Omit<PageLayoutProps, "pattern">) => (
  <PageLayout pattern="article" {...props}>{children}</PageLayout>
)