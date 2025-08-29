"use client"

import React, { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SectionWrapper, PageWrapper, ContentWrapper, Typography } from "@/components/layout"
import { NewsGrid } from "@/components/news/NewsGrid"
import { NewsCardSkeleton } from "@/components/news/NewsCardSkeleton"

type NewsDoc = {
  id: string
  title?: string
  excerpt?: string
  featuredImage?: string
  publishDate?: string
  status?: "draft" | "published"
  slug?: string
  isFeatured?: boolean
  category?: string
  tags?: string[]
}

export function NewsSection({
  limit,
  showHeader = true,
  excludeFeaturedFromList = true,
  category,
  tag,
  enablePagination = false,
  pageSize = 9,
  onMeta,
}: {
  limit?: number
  showHeader?: boolean
  excludeFeaturedFromList?: boolean
  category?: string
  tag?: string
  enablePagination?: boolean
  pageSize?: number
  onMeta?: (meta: { categories: string[]; tags: string[] }) => void
}) {
  const [items, setItems] = useState<NewsDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [missingConfig, setMissingConfig] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(enablePagination ? pageSize : Number.POSITIVE_INFINITY)

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) {
      setMissingConfig(true)
      setIsLoading(false)
      return
    }
    ;(async () => {
      try {
        setIsLoading(true)
        // Consulta compatível com regras sem exigir índice composto
        const snap = await getDocs(
          query(collection(db, "news"), where("status", "==", "published"))
        )
        let docs = snap.docs.map(mapNewsDoc)
        if (docs.length === 0) {
          // Fallback extra: buscar todos e filtrar no cliente
          const snapAll = await getDocs(collection(db, "news"))
          docs = snapAll.docs.map(mapNewsDoc).filter((n) => n.status === "published")
        }
        // Ordena no cliente por publishDate (string) ou publishedAt (Timestamp convertido)
        docs.sort((a, b) => {
          const ad = a.publishDate ?? ""
          const bd = b.publishDate ?? ""
          return bd.localeCompare(ad)
        })
        // Emitir meta (categorias e tags) para filtros
        if (onMeta) {
          const categorySet = new Set<string>()
          const tagSet = new Set<string>()
          for (const d of docs) {
            if (d.category) categorySet.add(d.category)
            if (Array.isArray(d.tags)) {
              for (const t of d.tags) if (typeof t === "string" && t.trim()) tagSet.add(t)
            }
          }
          onMeta({ categories: Array.from(categorySet).sort(), tags: Array.from(tagSet).sort() })
        }
        // Opcionalmente remove a notícia de destaque da lista (usado na Home, não no índice)
        if (excludeFeaturedFromList) {
          const featuredInHero = docs.filter((d) => d.isFeatured)[0] ?? docs[0]
          const filtered = featuredInHero ? docs.filter((d) => d.id !== featuredInHero.id) : docs
          setItems(filtered)
        } else {
          setItems(docs)
        }
        setErrorMsg(null)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao carregar notícias"
        setErrorMsg(msg)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  function mapNewsDoc(d: { id: string; data: () => Record<string, unknown> }) {
    const raw = d.data() as Record<string, unknown>
    const excerpt =
      typeof raw.excerpt === "string"
        ? raw.excerpt
        : typeof raw.content === "string"
        ? String(raw.content).slice(0, 160)
        : ""
    const ts = raw.publishedAt as Timestamp | undefined
    return {
      id: d.id,
      title: typeof raw.title === "string" ? raw.title : "",
      excerpt,
      featuredImage: typeof raw.featuredImage === "string" ? raw.featuredImage : "",
      publishDate:
        typeof raw.publishDate === "string"
          ? raw.publishDate
          : ts
          ? ts.toDate().toISOString().slice(0, 10)
          : undefined,
      status: raw.status as NewsDoc["status"],
      slug: typeof raw.slug === "string" ? raw.slug : undefined,
      isFeatured: Boolean(raw.isFeatured),
      category: typeof raw.category === "string" ? raw.category : undefined,
      tags: Array.isArray(raw.tags)
        ? (raw.tags as unknown[]).filter((t) => typeof t === "string" && t.trim()) as string[]
        : undefined,
    } satisfies NewsDoc
  }

  // Filtragem por categoria e tag
  const filteredItems = items.filter((n) => {
    const categoryOk = category ? n.category === category : true
    const tagOk = tag ? (Array.isArray(n.tags) ? n.tags.includes(tag) : false) : true
    return categoryOk && tagOk
  })

  // Paginação e limite
  const effectiveLimit = !enablePagination && typeof limit === "number" ? limit : Number.POSITIVE_INFINITY
  const sliceCount = enablePagination ? visibleCount : effectiveLimit
  const displayItems = filteredItems.slice(0, sliceCount)
  const hasMore = enablePagination && displayItems.length < filteredItems.length
  const gridTopMargin = showHeader ? "mt-12" : "mt-6"

  // Resetar paginação quando filtros mudarem
  React.useEffect(() => {
    if (enablePagination) {
      setVisibleCount(pageSize)
    }
  }, [category, tag, enablePagination, pageSize])

  return (
    <div className="space-y-8">
      {isLoading ? (
        // Skeleton Loading State Apple-style
        <div className="grid gap-8 sm:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {Array.from({ length: limit || pageSize || 6 }).map((_, i) => (
            <div key={i} className="group">
              <div className="space-y-4">
                {/* Image skeleton */}
                <div className="aspect-[16/10] rounded-2xl bg-muted/50 animate-pulse" />
                
                {/* Content skeleton */}
                <div className="space-y-3">
                  <div className="h-4 bg-muted/50 rounded-lg w-20 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-6 bg-muted/50 rounded-lg animate-pulse" />
                    <div className="h-6 bg-muted/50 rounded-lg w-4/5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 lg:py-24">
          <Typography variant="h3" className="text-muted-foreground mb-4 font-light">
            {missingConfig
              ? "Firebase não configurado"
              : errorMsg
              ? "Erro ao carregar notícias"
              : "Nenhuma notícia encontrada"}
          </Typography>
          <Typography variant="muted" className="font-light">
            {missingConfig
              ? "Defina as variáveis .env e adicione documentos em /news."
              : errorMsg
              ? `Erro: ${errorMsg}`
              : "Sem notícias publicadas no momento."}
          </Typography>
        </div>
      ) : (
        // Use NewsGrid component for consistent responsive behavior
        <NewsGrid 
          articles={displayItems}
          showFilters={false}
          showSearch={false}
          showSorting={false}
        />
      )}

      {/* Load More Button Apple-style */}
      {hasMore && enablePagination && (
        <div className="flex justify-center pt-8 lg:pt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisibleCount(prev => prev + pageSize)}
            className="group px-8 py-4 text-base font-light rounded-2xl border-border/30 hover:border-primary/50 hover:bg-muted/10 transition-all duration-300 hover:scale-[1.02]"
          >
            <span className="flex items-center gap-2">
              Carregar mais notícias
              <svg 
                className="size-4 transform transition-transform duration-300 group-hover:translate-y-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}


