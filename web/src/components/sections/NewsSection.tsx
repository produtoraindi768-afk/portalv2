"use client"

import React, { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
  const [missingConfig, setMissingConfig] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(enablePagination ? pageSize : Number.POSITIVE_INFINITY)

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) {
      setMissingConfig(true)
      return
    }
    ;(async () => {
      try {
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
    <section className="pt-6 pb-16 lg:pt-10 lg:pb-24">
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        {showHeader && (
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl/tight font-semibold tracking-tight sm:text-4xl/tight">
              Últimas notícias
            </h2>
            <p className="text-muted-foreground mt-4 text-base/7 sm:text-lg/8">
              Acompanhe as atualizações e novidades da comunidade.
            </p>
          </div>
        )}

        <div className={`${gridTopMargin} grid gap-8 lg:grid-cols-3 lg:gap-12`}>
          {displayItems.map((n) => (
            <div key={n.id} className="flex flex-col items-start">
              <Link
                href={n.slug ? `/noticias/${n.slug}` : `#`}
                aria-label={n.title}
                className="block w-full transition-transform hover:scale-[1.02] duration-200"
              >
                {n.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.featuredImage}
                    alt={n.title || "Capa"}
                    className="aspect-[16/9] w-full rounded-xl object-cover object-center"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full rounded-xl border bg-card" />
                )}
              </Link>
              <div className="mt-6 flex-1">
                <div className="text-muted-foreground text-xs font-medium flex items-center gap-2">
                  <span>{n.publishDate ?? ""}</span>
                  {n.category ? (
                    <Badge variant="secondary" className="rounded-full">
                      {n.category}
                    </Badge>
                  ) : null}
                </div>
                <Link
                  href={n.slug ? `/noticias/${n.slug}` : `#`}
                  className="block"
                >
                  <h3 className="mt-2 text-lg font-semibold tracking-tight line-clamp-2 hover:text-primary transition-colors">
                    {n.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm/6">
                  {n.excerpt}
                </p>
              </div>
              <Link
                href={n.slug ? `/noticias/${n.slug}` : `#`}
                aria-label={n.title}
                className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-85"
              >
                Leia mais <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-muted-foreground">
              {missingConfig
                ? "Firebase não configurado. Defina as variáveis .env e adicione documentos em /news."
                : errorMsg
                ? `Erro: ${errorMsg}`
                : "Sem notícias publicadas."}
            </div>
          )}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Button onClick={() => setVisibleCount((c) => c + pageSize)}>Carregar mais</Button>
          </div>
        )}
      </div>
    </section>
  )
}


