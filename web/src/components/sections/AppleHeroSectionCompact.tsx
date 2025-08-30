"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { SectionWrapper, PageWrapper, ContentWrapper, Typography } from "@/components/layout"
import { formatNewsTitle } from '@/lib/text-utils'

type NewsDoc = {
  id: string
  title?: string
  excerpt?: string
  featuredImage?: string
  publishDate?: string
  publishedAt?: Timestamp
  status?: "draft" | "published"
  slug?: string
  isFeatured?: boolean
  category?: string
}

export default function AppleHeroSectionCompact() {
  const [featured, setFeatured] = useState<NewsDoc | null>(null)
  const [missingConfig, setMissingConfig] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) {
      setMissingConfig(true)
      return
    }
    ;(async () => {
      try {
        // Busca notícia destacada
        const snapFeatured = await getDocs(
          query(collection(db, "news"), where("isFeatured", "==", true))
        )
        let docs = snapFeatured.docs.map(mapNewsDoc).filter((d) => d.status === "published")

        // Fallback: última publicada
        if (docs.length === 0) {
          const snapAll = await getDocs(query(collection(db, "news"), where("status", "==", "published")))
          docs = snapAll.docs.map(mapNewsDoc)
        }

        // Ordena por publishDate (string) desc
        docs.sort((a, b) => (b.publishDate ?? "").localeCompare(a.publishDate ?? ""))
        setFeatured(docs[0] ?? null)
        setErrorMsg(null)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao carregar destaque"
        setErrorMsg(msg)
      }
    })()
  }, [])

  function mapNewsDoc(d: { id: string; data: () => Record<string, unknown> }): NewsDoc {
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
      publishedAt: ts,
      status: raw.status as NewsDoc["status"],
      slug: typeof raw.slug === "string" ? raw.slug : undefined,
      isFeatured: Boolean(raw.isFeatured),
      category: typeof raw.category === "string" ? raw.category : undefined,
    }
  }

  if (!featured) {
    return (
      <SectionWrapper spacing="none" fullWidth>
        <PageWrapper maxWidth="standard" paddingY="normal">
          <div className="text-center py-8">
            <Typography variant="muted" className="font-light text-sm">
              {missingConfig
                ? "Firebase não configurado."
                : errorMsg
                ? `Erro: ${errorMsg}`
                : "Sem notícia em destaque."}
            </Typography>
          </div>
        </PageWrapper>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper spacing="none" background="transparent" fullWidth>
      <PageWrapper maxWidth="standard" paddingY="compact">
        {/* Compact Hero Container */}
        <div className="relative z-10 py-3 sm:py-4">
          <Link
            href={featured.slug ? `/noticias/${featured.slug}` : `#`}
            className="group block transition-all duration-300 ease-out"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Compact Image */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 ease-out">
                {featured.featuredImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="aspect-[16/9] sm:aspect-[2/1] w-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-105"
                      src={featured.featuredImage}
                      alt={featured.title || "Capa da notícia"}
                    />
                    
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Category Badge - positioned over image */}
                    {featured.category && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <Badge 
                          variant="secondary"
                          className="rounded-full font-light tracking-wide bg-background/90 backdrop-blur-sm text-xs"
                        >
                          {featured.category}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Title overlay - positioned over image bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <Typography 
                        variant="h2" 
                        className="text-white font-light tracking-tight leading-tight text-lg sm:text-xl md:text-2xl line-clamp-2 group-hover:text-primary-foreground transition-colors duration-300"
                        maxWidth="none"
                      >
                        {formatNewsTitle(featured.title, { applyCapitalization: true })}
                      </Typography>
                    </div>
                  </>
                ) : (
                  <div className="aspect-[16/9] sm:aspect-[2/1] rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex flex-col items-center justify-center p-4 sm:p-6">
                    {/* Category Badge for no-image state */}
                    {featured.category && (
                      <div className="mb-3">
                        <Badge 
                          variant="secondary"
                          className="rounded-full font-light tracking-wide text-xs"
                        >
                          {featured.category}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Title for no-image state */}
                    <Typography 
                      variant="h2" 
                      className="text-center font-light tracking-tight leading-tight text-lg sm:text-xl md:text-2xl line-clamp-3 group-hover:text-primary transition-colors duration-300"
                      maxWidth="none"
                    >
                      {formatNewsTitle(featured.title, { applyCapitalization: true })}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      </PageWrapper>
    </SectionWrapper>
  )
}