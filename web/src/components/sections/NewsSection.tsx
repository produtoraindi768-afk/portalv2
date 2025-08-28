"use client"

import React, { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { Button } from "@/components/ui/button"
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
    <SectionWrapper spacing="compact" background="transparent">
      <PageWrapper maxWidth="wide">
        <ContentWrapper layout="stack" gap="normal">
          {showHeader && (
            <>
              <ContentWrapper layout="centered" gap="tight">
                <Typography variant="h2" align="center">
                  Últimas notícias
                </Typography>
                <Typography variant="lead" align="center" maxWidth="narrow">
                  Acompanhe as atualizações e novidades da comunidade.
                </Typography>
              </ContentWrapper>
              
              {/* Separator after header when showing articles */}
              {displayItems.length > 0 && (
                <Separator className="bg-border/50 my-4 sm:my-6" />
              )}
            </>
          )}

          {isLoading ? (
            // Skeleton Loading State seguindo o design system
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {Array.from({ length: limit || pageSize || 6 }).map((_, i) => (
                <NewsCardSkeleton key={i} variant="default" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Typography variant="h3" className="text-muted-foreground mb-3 sm:mb-4">
                {missingConfig
                  ? "Firebase não configurado"
                  : errorMsg
                  ? "Erro ao carregar notícias"
                  : "Nenhuma notícia encontrada"}
              </Typography>
              <Typography variant="muted">
                {missingConfig
                  ? "Defina as variáveis .env e adicione documentos em /news."
                  : errorMsg
                  ? `Erro: ${errorMsg}`
                  : "Sem notícias publicadas no momento."}
              </Typography>
            </div>
          ) : (
            <NewsGrid 
              articles={displayItems}
              enablePagination={enablePagination}
              pageSize={pageSize}
              showFilters={false}
            />
          )}
        </ContentWrapper>
      </PageWrapper>
    </SectionWrapper>
  )
}


