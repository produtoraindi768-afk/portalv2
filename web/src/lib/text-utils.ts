/**
 * Text utilities for consistent content formatting and truncation
 * across the application to prevent layout breaking
 */

// Centralized configuration for maximum text lengths
export const TEXT_LIMITS = {
  // News card excerpt limits - balanced for good UX
  news: {
    featured: 380,   // Featured news cards (more space for rich content)
    default: 240,    // Default news cards (good balance)
    compact: 80      // Compact news cards
  },
  // News card title limits
  titles: {
    featured: 95,    // Featured news titles
    default: 80,     // Default news titles
    compact: 60      // Compact news titles
  },
  // Other content limits (can be extended)
  general: {
    metaDescription: 160,
    shortDescription: 120,
    cardTitle: 80,
    buttonText: 20
  }
} as const

export type NewsVariant = 'featured' | 'default' | 'compact'

/**
 * Truncates text with smart word-boundary and sentence-boundary detection
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 * @param options - Truncation options
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(
  text: string, 
  maxLength: number, 
  options: {
    preferSentenceEnd?: boolean
    preserveWords?: boolean
    ellipsis?: string
  } = {}
): string {
  const {
    preferSentenceEnd = true,
    preserveWords = true,
    ellipsis = '...'
  } = options

  if (!text || text.length <= maxLength) {
    return text
  }

  const truncated = text.substring(0, maxLength)

  // Try to find end of sentence first (if enabled)
  if (preferSentenceEnd) {
    const lastSentence = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    )
    
    // Use sentence ending if it's within reasonable range (80% of limit)
    if (lastSentence > maxLength * 0.8) {
      return truncated.substring(0, lastSentence + 1)
    }
  }

  // Try to preserve word boundaries (if enabled)
  if (preserveWords) {
    const lastSpace = truncated.lastIndexOf(' ')
    // Use word boundary if it's within reasonable range (85% of limit)
    if (lastSpace > maxLength * 0.85) {
      return truncated.substring(0, lastSpace) + ellipsis
    }
  }

  // Hard truncation at exact limit
  return truncated + ellipsis
}

/**
 * Formats news excerpt with variant-specific limits
 * @param excerpt - The excerpt text
 * @param variant - News card variant
 * @returns Formatted excerpt
 */
export function formatNewsExcerpt(excerpt: string | undefined, variant: NewsVariant): string {
  if (!excerpt) return 'Sem descrição disponível'
  
  const cleaned = excerpt.trim()
  const maxLength = TEXT_LIMITS.news[variant]
  
  return truncateText(cleaned, maxLength, {
    preferSentenceEnd: true,
    preserveWords: true
  })
}

/**
 * Formats news title with variant-specific limits and capitalization
 * @param title - The title text
 * @param variant - News card variant
 * @returns Formatted title
 */
export function formatNewsTitle(title: string | undefined, variant: NewsVariant): string {
  if (!title) return 'Sem título'
  
  const cleaned = title.trim()
  const maxLength = TEXT_LIMITS.titles[variant]
  
  const truncated = truncateText(cleaned, maxLength, {
    preferSentenceEnd: false,
    preserveWords: true
  })
  
  // Capitalize first letter of each sentence
  return truncated.replace(/\b\w/g, char => char.toUpperCase())
}

/**
 * Validates if text exceeds recommended limits
 * @param text - Text to validate
 * @param maxLength - Maximum allowed length
 * @returns Validation result with warnings
 */
export function validateTextLength(text: string, maxLength: number) {
  const length = text.length
  
  return {
    isValid: length <= maxLength,
    length,
    maxLength,
    exceeded: Math.max(0, length - maxLength),
    warningLevel: length > maxLength * 0.9 ? 'high' : length > maxLength * 0.7 ? 'medium' : 'low'
  }
}