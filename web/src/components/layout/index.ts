// Core layout building blocks
export { PageWrapper } from "./PageWrapper"
export { SectionWrapper } from "./SectionWrapper" 
export { ContentWrapper } from "./ContentWrapper"

// High-level layout patterns
export { 
  PageLayout,
  DefaultPageLayout,
  NarrowPageLayout, 
  WidePageLayout,
  DashboardPageLayout,
  ArticlePageLayout
} from "./PageLayout"

// Typography system
export { 
  Typography,
  Heading1,
  Heading2, 
  Heading3,
  BodyText,
  LeadText,
  MutedText
} from "../ui/typography"

/**
 * Layout System Usage Guide:
 * 
 * 1. For simple pages, use PageLayout with patterns:
 *    <PageLayout pattern="default" title="Page Title">content</PageLayout>
 * 
 * 2. For custom layouts, combine building blocks:
 *    <PageWrapper maxWidth="standard">
 *      <SectionWrapper background="card">
 *        <ContentWrapper layout="grid-3">
 *          ...content
 *        </ContentWrapper>
 *      </SectionWrapper>
 *    </PageWrapper>
 * 
 * 3. Use Typography for consistent text styling:
 *    <Typography variant="h2">Heading</Typography>
 *    <Typography variant="body" maxWidth="prose">Long text content</Typography>
 * 
 * Layout Patterns Available:
 * - default: Standard pages (max-w-6xl, normal spacing)
 * - narrow: Articles, forms (max-w-4xl, focused content)
 * - wide: Dashboards, tables (max-w-7xl, data-heavy)
 * - hero: Landing pages (full-width, large spacing)
 * - dashboard: Admin pages (wide, compact spacing)
 * - article: Blog posts (narrow, spacious, card background)
 */