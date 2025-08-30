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
/**
 * Formats news excerpt with intelligent text processing
 * @param excerpt - The excerpt text
 * @param options - Formatting options
 * @returns Formatted excerpt
 */
export function formatNewsExcerpt(
  excerpt: string | undefined, 
  options: {
    variant?: NewsVariant
    maxLength?: number
    applyCapitalization?: boolean
  } = {}
): string {
  if (!excerpt) return 'Sem descrição disponível'
  
  const {
    variant = 'default',
    maxLength,
    applyCapitalization = false // Usually excerpts should preserve original formatting
  } = options
  
  let processed = excerpt.trim()
  
  // Apply intelligent formatting if enabled
  if (applyCapitalization) {
    processed = formatTextContent(processed, {
      applyCapitalization: true,
      normalizeSpacing: true
    })
  } else {
    // Just normalize spacing
    processed = normalizeSpacing(processed)
  }
  
  // Use provided maxLength or variant-based limit
  const lengthLimit = maxLength || TEXT_LIMITS.news[variant]
  
  return truncateText(processed, lengthLimit, {
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
/**
 * Detects if text contains emojis
 * @param text - Text to check
 * @returns True if text contains emojis
 */
function hasEmojis(text: string): boolean {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
  return emojiRegex.test(text)
}

/**
 * Detects if text is mostly uppercase (more than 70% uppercase letters)
 * @param text - Text to check
 * @returns True if text is mostly uppercase
 */
function isMostlyUppercase(text: string): boolean {
  const letters = text.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (letters.length === 0) return false
  
  const uppercaseCount = (text.match(/[A-ZÀ-Ÿ]/g) || []).length
  return uppercaseCount / letters.length > 0.7
}

/**
 * Normalizes excessive spacing and punctuation
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeSpacing(text: string): string {
  return text
    // Remove excessive spaces
    .replace(/\s+/g, ' ')
    // Remove excessive punctuation
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    .replace(/[.]{3,}/g, '...')
    // Normalize quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
}

/**
 * Applies intelligent capitalization to text
 * Handles uppercase text, emojis, and proper capitalization rules
 * @param text - Text to capitalize
 * @returns Text with intelligent capitalization
 */
function applyIntelligentCapitalization(text: string): string {
  // First normalize spacing and punctuation
  let normalizedText = normalizeSpacing(text)
  
  // If text has emojis, preserve them and be more careful with capitalization
  const containsEmojis = hasEmojis(normalizedText)
  
  // If text is mostly uppercase, convert to proper case
  const isUppercase = isMostlyUppercase(normalizedText)
  
  // Words that should remain lowercase (except when first word)
  const lowercaseWords = new Set([
    // Articles
    'a', 'an', 'the', 'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
    // Prepositions
    'at', 'by', 'for', 'in', 'of', 'on', 'to', 'up', 'and', 'as', 'but', 'or', 'nor',
    'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem',
    // Conjunctions
    'e', 'ou', 'mas', 'que', 'se', 'como', 'quando', 'onde', 'porque', 'porquê',
    // Common gaming terms that should stay lowercase
    'vs', 'x', 'vs.'
  ])

  // Very small words that should remain lowercase when isolated or in the middle
  const verySmallWords = new Set([
    'é', 'à', 'ao', 'ou', 'e', 'o', 'a', 'os', 'as', 'do', 'da', 'de', 'em', 'no', 'na', 'se', 'me', 'te', 'lhe', 'nos', 'vos', 'lhes'
  ])
  
  // Gaming and tech terms that should maintain specific capitalization
  const specialTerms = new Map([
    ['fortnite', 'Fortnite'],
    ['epic games', 'Epic Games'],
    ['battle royale', 'Battle Royale'],
    ['fps', 'FPS'],
    ['moba', 'MOBA'],
    ['mmorpg', 'MMORPG'],
    ['rpg', 'RPG'],
    ['rts', 'RTS'],
    ['pc', 'PC'],
    ['ps4', 'PS4'],
    ['ps5', 'PS5'],
    ['xbox', 'Xbox'],
    ['nintendo', 'Nintendo'],
    ['steam', 'Steam'],
    ['twitch', 'Twitch'],
    ['youtube', 'YouTube'],
    ['discord', 'Discord']
  ])

  // If text is mostly uppercase, convert to lowercase first
  if (isUppercase) {
    normalizedText = normalizedText.toLowerCase()
  }

  const words = normalizedText.split(' ')
  
  // If it's just one very small word, keep it lowercase
  if (words.length === 1) {
    const cleanWord = words[0].replace(/[^a-záàâãéêíóôõúç]/gi, '').toLowerCase()
    if (verySmallWords.has(cleanWord)) {
      return normalizedText
    }
  }

  return words
    .map((word, index) => {
      // Preserve emojis
      if (containsEmojis && hasEmojis(word)) {
        return word
      }
      
      const lowerWord = word.toLowerCase()
      
      // Check for special gaming/tech terms
      for (const [term, proper] of specialTerms) {
        if (lowerWord.includes(term)) {
          return word.replace(new RegExp(term, 'gi'), proper)
        }
      }
      
      const cleanWord = word.replace(/[^a-záàâãéêíóôõúç]/gi, '').toLowerCase()
      
      // First word handling - ALWAYS capitalize the first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      
      // Check if word should remain lowercase
      if (lowercaseWords.has(cleanWord) || verySmallWords.has(cleanWord)) {
        return word.toLowerCase()
      }
      
      // Capitalize other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Formats news title with intelligent text processing
 * Handles uppercase text, emojis, and applies proper capitalization
 * @param title - The title text
 * @param options - Formatting options
 * @returns Formatted title
 */
export function formatNewsTitle(
  title: string | undefined, 
  options: {
    variant?: NewsVariant
    preserveEmojis?: boolean
    maxLength?: number
    applyCapitalization?: boolean
  } = {}
): string {
  if (!title) return 'Sem título'
  
  const {
    variant = 'default',
    preserveEmojis = true,
    maxLength,
    applyCapitalization = true
  } = options
  
  let cleaned = title.trim()
  
  // Apply intelligent capitalization if enabled
  if (applyCapitalization) {
    cleaned = applyIntelligentCapitalization(cleaned)
  }
  
  // Use provided maxLength or variant-based limit
  const lengthLimit = maxLength || TEXT_LIMITS.titles[variant]
  
  // Don't truncate if no length limit specified
  if (!maxLength && variant) {
    return cleaned
  }
  
  if (lengthLimit && cleaned.length > lengthLimit) {
    return truncateText(cleaned, lengthLimit, {
      preferSentenceEnd: false,
      preserveWords: true
    })
  }
  
  return cleaned
}

/**
 * Formats any text content with intelligent processing
 * @param text - Text to format
 * @param options - Formatting options
 * @returns Formatted text
 */
export function formatTextContent(
  text: string | undefined,
  options: {
    maxLength?: number
    applyCapitalization?: boolean
    preserveEmojis?: boolean
    normalizeSpacing?: boolean
  } = {}
): string {
  if (!text) return ''
  
  const {
    maxLength,
    applyCapitalization = true,
    preserveEmojis = true,
    normalizeSpacing = true
  } = options
  
  let processed = text.trim()
  
  // Normalize spacing if enabled
  if (normalizeSpacing) {
    processed = normalizeSpacing(processed)
  }
  
  // Apply intelligent capitalization if enabled
  if (applyCapitalization) {
    processed = applyIntelligentCapitalization(processed)
  }
  
  // Truncate if maxLength specified
  if (maxLength && processed.length > maxLength) {
    return truncateText(processed, maxLength, {
      preferSentenceEnd: true,
      preserveWords: true
    })
  }
  
  return processed
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