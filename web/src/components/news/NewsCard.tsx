'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, Eye, ArrowRight, Bookmark, Share2 } from 'lucide-react'
import { formatDateToBrazilian } from '@/lib/date-utils'
import { formatNewsTitle, formatNewsExcerpt, type NewsVariant } from '@/lib/text-utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export interface NewsCardProps {
  article: {
    id: string
    title?: string
    excerpt?: string
    featuredImage?: string
    publishDate?: string
    status?: 'draft' | 'published'
    slug?: string
    isFeatured?: boolean
    category?: string
    // tags removed from display but kept for backwards compatibility
    tags?: string[]
  }
  priority?: boolean
  variant?: NewsVariant
  className?: string
}

export function NewsCard({ 
  article, 
  priority = false, 
  variant = 'default',
  className 
}: NewsCardProps) {
  const publishDate = article.publishDate ? new Date(article.publishDate) : null
  const isRecent = publishDate && (Date.now() - publishDate.getTime()) < 24 * 60 * 60 * 1000 // 24 hours
  const isNew = publishDate && (Date.now() - publishDate.getTime()) < 3 * 24 * 60 * 60 * 1000 // 3 days
  
  const getTimeAgo = () => {
    if (!publishDate) return null
    try {
      return formatDistanceToNow(publishDate, { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return null
    }
  }

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-muted/50 text-muted-foreground'
    
    const colorMap: Record<string, string> = {
      'esports': 'bg-red-500/10 text-red-600 border-red-500/20',
      'streamers': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'torneios': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'noticias': 'bg-green-500/10 text-green-600 border-green-500/20',
      'updates': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'analises': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    }
    
    return colorMap[category.toLowerCase()] || 'bg-primary/10 text-primary border-primary/20'
  }

  // More generous line clamps for better content display
  const getLineClampClasses = () => {
    // More generous line clamps that work with text limits
    if (variant === 'featured') {
      return {
        title: 'line-clamp-3',     // Allow more title space
        excerpt: 'line-clamp-5'    // Allow more content in featured
      }
    }
    
    if (variant === 'compact') {
      return {
        title: 'line-clamp-2',     // Keep compact minimal
        excerpt: 'line-clamp-2'    // Keep compact minimal
      }
    }
    
    // Default variant - generous for good reading experience
    return {
      title: 'line-clamp-2',       // Standard title space
      excerpt: 'line-clamp-4'      // More generous excerpt space
    }
  }

  const lineClamps = getLineClampClasses()

  if (variant === 'compact') {
    return (
      <Link
        href={article.slug ? `/noticias/${article.slug}` : '#'}
        className={cn(
          "group block p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-md",
          "h-20 sm:h-24 flex items-center", // Fixed height for compact cards
          isRecent && "bg-gradient-to-r from-primary/5 to-transparent",
          className
        )}
      >
        <div className="flex gap-4">
          {article.featuredImage && (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              <img
                src={article.featuredImage}
                alt={article.title || 'News image'}
                className="w-full h-full rounded-lg object-cover"
              />
              {isNew && (
                <div className="absolute -top-1 -right-1">
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    Nova
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {publishDate ? formatDateToBrazilian(article.publishDate) : 'Data não informada'}
              </span>
              {article.category && (
                <Badge variant="outline" className={cn("text-xs", getCategoryColor(article.category))}>
                  {article.category}
                </Badge>
              )}
            </div>
            
            <h3 className={cn(
              "font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors mb-1 leading-tight",
              lineClamps.title
            )}>
              {formatNewsTitle(article.title, variant)}
            </h3>
            
            <p className={cn(
              "text-xs sm:text-xs text-muted-foreground leading-relaxed",
              lineClamps.excerpt
            )}>
              {formatNewsExcerpt(article.excerpt, variant)}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 cursor-pointer border-border/50 bg-card",
        "hover:shadow-xl hover:border-primary/20 hover:-translate-y-1",
        "ring-2 ring-primary/20 shadow-lg shadow-primary/10",
        "h-[480px] sm:h-[520px] md:h-[560px] grid grid-rows-[auto_1fr_auto] gap-0 p-0", // Added p-0 to remove all padding
        className
      )}>
        <Link href={article.slug ? `/noticias/${article.slug}` : '#'} className="grid grid-rows-subgrid row-span-3 h-full">
          {/* Featured header with image */}
          <div className="relative h-44 sm:h-48 md:h-52 overflow-hidden flex-shrink-0 rounded-t-lg -m-px">
            {article.featuredImage ? (
              <>
                <img 
                  src={article.featuredImage} 
                  alt={article.title || 'Featured news'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/80 via-primary/60 to-purple-600/80" />
            )}
            
            {/* Featured badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-yellow-500 text-yellow-900 border-yellow-400">
                ⭐ Destaque
              </Badge>
            </div>
            
            {/* Category badge */}
            {article.category && (
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className={cn("text-xs bg-white/90 backdrop-blur", getCategoryColor(article.category))}>
                  {article.category}
                </Badge>
              </div>
            )}
          </div>

          {/* Content area with adequate spacing */}
          <div className="p-4 sm:p-5 md:p-6 flex flex-col min-h-[200px] sm:min-h-[220px]">
            {/* Metadata */}
            <div className="flex items-center justify-between text-sm mb-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{publishDate ? formatDateToBrazilian(article.publishDate) : 'Data não informada'}</span>
              </div>
              {getTimeAgo() && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{getTimeAgo()}</span>
                </div>
              )}
            </div>

            <Separator className="bg-border/30 mb-4" />

            {/* Title with adequate spacing */}
            <h2 className={cn(
              "font-bold text-xl leading-snug text-foreground group-hover:text-primary transition-colors mb-4 flex-shrink-0",
              lineClamps.title
            )}>
              {formatNewsTitle(article.title, variant)}
            </h2>
            
            {/* Description with natural height - ensure minimum space for footer */}
            <div className="flex-1 flex items-start mb-4">
              <p className={cn(
                "text-muted-foreground leading-relaxed text-base",
                lineClamps.excerpt
              )}>
                {formatNewsExcerpt(article.excerpt, variant)}
              </p>
            </div>
          </div>

          {/* Footer - guaranteed space at bottom */}
          <div className="p-4 sm:p-5 md:p-6 pt-2 flex-shrink-0 min-h-[56px] sm:min-h-[60px]">
            <div className="flex items-center justify-between pt-4 border-t border-border/20">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-200">
                Ler notícia completa <ArrowRight className="w-4 h-4" />
              </div>
              
              {/* Reading time estimate */}
              {article.excerpt && (
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {Math.max(1, Math.ceil((article.excerpt.length + (article.title?.length || 0)) / 200))} min
                </div>
              )}
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  // Default variant with responsive grid layout
  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-200 cursor-pointer border-border/50 bg-card",
      "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
      "h-[420px] sm:h-[460px] md:h-[500px] grid grid-rows-[auto_1fr_auto] gap-0 p-0", // Added p-0 to remove all padding
      isRecent && "ring-1 ring-primary/20",
      className
    )}>
      <Link href={article.slug ? `/noticias/${article.slug}` : '#'} className="grid grid-rows-subgrid row-span-3 h-full">
        {/* Image with optimized height for more text space */}
        <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden flex-shrink-0 rounded-t-lg -m-px">
          {article.featuredImage ? (
            <img 
              src={article.featuredImage} 
              alt={article.title || 'News image'}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
              <div className="text-muted-foreground text-center p-4">
                <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-muted flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-sm">Sem imagem</span>
              </div>
            </div>
          )}
          
          {/* New badge */}
          {isNew && (
            <div className="absolute top-3 left-3">
              <Badge variant="destructive" className="text-xs">
                Nova
              </Badge>
            </div>
          )}
          
          {/* Category badge */}
          {article.category && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={cn("text-xs backdrop-blur bg-white/90", getCategoryColor(article.category))}>
                {article.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content area with adequate spacing */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col min-h-[160px] sm:min-h-[180px]">
          {/* Metadata */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{publishDate ? formatDateToBrazilian(article.publishDate) : 'Data não informada'}</span>
            </div>
            {getTimeAgo() && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{getTimeAgo()}</span>
              </div>
            )}
          </div>

          <Separator className="bg-border/30 mb-3" />

          {/* Title with adequate spacing */}
          <h3 className={cn(
            "font-bold text-sm sm:text-base md:text-lg leading-snug text-foreground group-hover:text-primary transition-colors mb-3 flex-shrink-0",
            lineClamps.title
          )}>
            {formatNewsTitle(article.title, variant)}
          </h3>
          
          {/* Description with natural height - ensure minimum space for footer */}
          <div className="flex-1 flex items-start mb-3">
            <p className={cn(
              "text-sm text-muted-foreground leading-relaxed",
              lineClamps.excerpt
            )}>
              {formatNewsExcerpt(article.excerpt, variant)}
            </p>
          </div>
        </div>

        {/* Footer - guaranteed space at bottom */}
        <div className="p-3 sm:p-4 md:p-5 pt-2 flex-shrink-0 min-h-[46px] sm:min-h-[50px]">
          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-200">
              Leia mais <ArrowRight className="w-4 h-4" />
            </div>
            
            {/* Reading time estimate */}
            {article.excerpt && (
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {Math.max(1, Math.ceil((article.excerpt.length + (article.title?.length || 0)) / 200))} min
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}