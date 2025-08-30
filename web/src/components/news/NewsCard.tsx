'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Calendar, Clock, Eye, ArrowRight, Bookmark, Share2 } from 'lucide-react'
import { formatDateToBrazilian } from '@/lib/date-utils'
import { formatNewsExcerpt, formatNewsTitle, type NewsVariant } from '@/lib/text-utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { NewsCardSkeleton } from './NewsCardSkeleton'

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
  hideDescription?: boolean // Nova prop para ocultar a descrição
}

export function NewsCard({ 
  article, 
  priority = false, 
  variant = 'default',
  className,
  hideDescription = false
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

  const getCategoryVariant = (category?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!category) return 'secondary'
    
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'esports': 'destructive',
      'streamers': 'default',
      'torneios': 'default',
      'noticias': 'secondary',
      'updates': 'outline',
      'analises': 'secondary'
    }
    
    return variantMap[category.toLowerCase()] || 'default'
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
        title: 'line-clamp-4',     // Allow 4 lines for better title display
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
          "group block p-2 rounded-lg border-b border-border/20 transition-colors duration-200",
          "h-24 flex items-center gap-3",
          isRecent && "bg-gradient-to-r from-primary/5 to-transparent",
          className
        )}
      >
        {article.featuredImage && (
          <div className="relative w-36 flex-shrink-0">
            <AspectRatio ratio={16 / 9}>
              <img
                src={article.featuredImage}
                alt={article.title || 'Imagem da notícia'}
                className="w-full h-full rounded object-cover"
              />
            </AspectRatio>
            {isNew && (
              <div className="absolute top-1 left-1">
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5 h-auto font-medium shadow-sm">
                  Nova
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-sm group-hover:text-primary transition-colors leading-tight"
          )}>
            {formatNewsTitle(article.title, { applyCapitalization: true })}
          </h3>
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
        hideDescription 
          ? "h-[380px] sm:h-[420px] md:h-[460px] grid grid-rows-[auto_1fr_auto] gap-0 p-0"
          : "h-[480px] sm:h-[520px] md:h-[560px] grid grid-rows-[auto_1fr_auto] gap-0 p-0", // Added p-0 to remove all padding
        className
      )}>
        <Link href={article.slug ? `/noticias/${article.slug}` : '#'} className="grid grid-rows-subgrid row-span-3 h-full">
          {/* Featured header with image */}
          <div className="relative overflow-hidden flex-shrink-0 rounded-t-lg -m-px">
            <AspectRatio ratio={16 / 9}>
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
            </AspectRatio>
            
            {/* Featured badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary">
                ⭐ Destaque
              </Badge>
            </div>
            
            {/* Category badge */}
            {article.category && (
              <div className="absolute top-4 right-4">
                <Badge variant={getCategoryVariant(article.category)} className="text-xs">
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
                <span>{article.publishDate ? formatDateToBrazilian(article.publishDate) : 'Data não informada'}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                {(() => {
                  const timeAgo = getTimeAgo()
                  return timeAgo && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{timeAgo}</span>
                    </div>
                  )
                })()}
                {article.excerpt && (
                  <div className="text-xs flex-shrink-0">
                    {Math.max(1, Math.ceil((article.excerpt.length + (article.title?.length || 0)) / 200))} min
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border/30 mb-4" />

            {/* Title with adequate spacing */}
            <h2 className={cn(
              "font-medium text-xl leading-snug text-foreground group-hover:text-primary transition-colors flex-shrink-0",
              hideDescription ? "mb-8" : "mb-4"
            )}>
              {formatNewsTitle(article.title, { applyCapitalization: true })}
            </h2>
            
            {/* Description with natural height - ensure minimum space for footer */}
            {!hideDescription && (
              <div className="flex-1 flex items-start mb-4">
                <p className={cn(
                  "text-muted-foreground leading-relaxed text-base",
                  lineClamps.excerpt
                )}>
                  {formatNewsExcerpt(article.excerpt, { variant })}
                </p>
              </div>
            )}
          </div>
        </Link>
      </Card>
    )
  }

  // Default variant with Material Tailwind structure
  return (
    <div className={cn(
      "relative flex max-w-[24rem] flex-col rounded-md bg-card text-card-foreground shadow-md h-full",
      "group transition-all duration-500 ease-out cursor-pointer",
      "hover:shadow-xl hover:-translate-y-1",
      className
    )}>
      <Link href={article.slug ? `/noticias/${article.slug}` : '#'} className="block h-full flex flex-col">
        {/* Imagem no topo com aspect ratio */}
        <div className="relative m-0 overflow-hidden rounded-t-md">
          <AspectRatio ratio={16 / 9}>
            {article.featuredImage ? (
              <img
                className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                src={article.featuredImage}
                alt={article.title || "Capa da notícia"}
              />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">
                  Sem imagem
                </span>
              </div>
            )}
          </AspectRatio>
        </div>
        
        {/* Conteúdo principal */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Tag da categoria */}
          {article.category && (
            <Badge variant={getCategoryVariant(article.category)} className="mb-3 text-xs">
              {article.category}
            </Badge>
          )}
          
          <h4 className="text-lg font-medium leading-tight text-card-foreground hover:text-primary transition-colors duration-300 mb-3 min-h-[4.5rem]">
            {formatNewsTitle(article.title, { applyCapitalization: true })}
          </h4>
          {!hideDescription && article.excerpt && (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {formatNewsExcerpt(article.excerpt, { variant })}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}