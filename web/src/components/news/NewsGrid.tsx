'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContentWrapper, Typography } from '@/components/layout'
import { NewsCard } from '@/components/news/NewsCard'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NewsVariant } from '@/lib/text-utils'

type NewsDoc = {
  id: string
  title?: string
  excerpt?: string
  featuredImage?: string
  publishDate?: string
  status?: 'draft' | 'published'
  slug?: string
  isFeatured?: boolean
  category?: string
  tags?: string[]
}

interface NewsGridProps {
  articles: NewsDoc[]
  enablePagination?: boolean
  pageSize?: number
  showFilters?: boolean
  onFilterChange?: (filters: NewsFilters) => void
}

export interface NewsFilters {
  search: string
  category: string
  sortBy: 'date' | 'title' | 'featured'
  sortOrder: 'asc' | 'desc'
}

export function NewsGrid({ 
  articles, 
  enablePagination = false, 
  pageSize = 9,
  showFilters = false,
  onFilterChange
}: NewsGridProps) {
  const [visibleCount, setVisibleCount] = useState(enablePagination ? pageSize : articles.length)
  const [filters, setFilters] = useState<NewsFilters>({
    search: '',
    category: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Extract unique categories and tags for filters
  const categories = React.useMemo(() => {
    const cats = new Set<string>()
    articles.forEach(article => {
      if (article.category) cats.add(article.category)
    })
    return Array.from(cats).sort()
  }, [articles])

  const tags = React.useMemo(() => {
    const tagSet = new Set<string>()
    articles.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [articles])

  // Apply filters and sorting
  const filteredAndSortedArticles = React.useMemo(() => {
    let filtered = articles.filter(article => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = article.title?.toLowerCase().includes(searchLower)
        const matchesExcerpt = article.excerpt?.toLowerCase().includes(searchLower)
        const matchesCategory = article.category?.toLowerCase().includes(searchLower)
        const matchesTags = article.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesTitle && !matchesExcerpt && !matchesCategory && !matchesTags) {
          return false
        }
      }

      // Category filter
      if (filters.category !== 'all' && article.category !== filters.category) {
        return false
      }

      return true
    })

    // Sort articles
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
        case 'featured':
          comparison = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
          break
        case 'date':
        default:
          comparison = (b.publishDate || '').localeCompare(a.publishDate || '')
          break
      }

      return filters.sortOrder === 'desc' ? comparison : -comparison
    })

    return filtered
  }, [articles, filters])

  const displayArticles = filteredAndSortedArticles.slice(0, visibleCount)
  const hasMore = enablePagination && displayArticles.length < filteredAndSortedArticles.length

  const handleFilterChange = (newFilters: Partial<NewsFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
    
    // Reset pagination when filters change
    if (enablePagination) {
      setVisibleCount(pageSize)
    }
  }

  const clearFilters = () => {
    const resetFilters = { search: '', category: 'all', sortBy: 'date' as const, sortOrder: 'desc' as const }
    setFilters(resetFilters)
    onFilterChange?.(resetFilters)
    setVisibleCount(enablePagination ? pageSize : articles.length)
  }

  const hasActiveFilters = filters.search !== '' || filters.category !== 'all' || filters.sortBy !== 'date'

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 sm:space-y-4">
          {/* Filter header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Typography variant="h3" className="text-base sm:text-lg">Filtros</Typography>
              {hasActiveFilters && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {Object.values(filters).filter(v => v !== 'all' && v !== '' && v !== 'date' && v !== 'desc').length} ativo{Object.values(filters).filter(v => v !== 'all' && v !== '' && v !== 'date' && v !== 'desc').length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-border text-muted-foreground hover:bg-accent text-xs sm:text-sm"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Limpar
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="border-border text-muted-foreground hover:bg-accent text-xs sm:text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {showFilterPanel ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilterPanel && (
            <div className="p-3 sm:p-4 border border-border rounded-lg bg-card space-y-3 sm:space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, conteúdo, categoria ou tags..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="pl-8 sm:pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Category filter */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Categoria</label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange({ category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort by */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Ordenar por</label>
                  <Select value={filters.sortBy} onValueChange={(value: 'date' | 'title' | 'featured') => handleFilterChange({ sortBy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Data de publicação</SelectItem>
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="featured">Destaques primeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort order */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Ordem</label>
                  <Select value={filters.sortOrder} onValueChange={(value: 'asc' | 'desc') => handleFilterChange({ sortOrder: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Active filters display */}
          {hasActiveFilters && (
            <>
              <Separator className="bg-border/40" />
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary">
                    Busca: \"{filters.search}\"
                    <button
                      onClick={() => handleFilterChange({ search: '' })}
                      className="ml-2 hover:text-primary/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge variant="secondary">
                    Categoria: {filters.category}
                    <button
                      onClick={() => handleFilterChange({ category: 'all' })}
                      className="ml-2 hover:text-secondary-foreground/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Results count */}
      {showFilters && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredAndSortedArticles.length} {filteredAndSortedArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
          </span>
          {filteredAndSortedArticles.length !== articles.length && (
            <span>de {articles.length} total</span>
          )}
        </div>
      )}

      {/* Articles Grid with responsive layout */}
      <div className="space-y-4 md:space-y-0">
        {/* Mobile: Compact cards in single column */}
        <div className="block md:hidden space-y-3">
          {displayArticles.map((article, index) => (
            <NewsCard 
              key={article.id}
              article={article}
              variant="compact"
              priority={index === 0}
            />
          ))}
        </div>
        
        {/* Desktop: Grid layout */}
        <ContentWrapper layout="grid-3" gap="loose" className="hidden md:grid auto-rows-fr md:gap-spacious">
          {displayArticles.map((article, index) => {
            // First article gets featured treatment if marked as featured
            const isFeaturedDisplay = article.isFeatured
            
            return (
              <div 
                key={article.id} 
                className={isFeaturedDisplay ? "col-span-full md:col-span-2" : ""}
              >
                <NewsCard 
                  article={article}
                  variant={isFeaturedDisplay ? "featured" : "default"}
                  priority={index === 0}
                />
              </div>
            )
          })}
        </ContentWrapper>
      </div>

        {filteredAndSortedArticles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Typography variant="muted">
              {hasActiveFilters 
                ? "Nenhum artigo encontrado com os filtros aplicados." 
                : "Nenhum artigo publicado."}
            </Typography>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="mt-4"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}

      {/* Load more */}
      {hasMore && (
        <>
          <Separator className="bg-border/40" />
          <ContentWrapper layout="centered">
            <Button 
              size="lg" 
              onClick={() => setVisibleCount(c => c + pageSize)}
            >
              Carregar mais ({filteredAndSortedArticles.length - displayArticles.length} restantes)
            </Button>
          </ContentWrapper>
        </>
      )}
    </div>
  )
}