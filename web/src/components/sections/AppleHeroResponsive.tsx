"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

/**
 * Versão responsiva do AppleHeroSection que adapta automaticamente o layout:
 * - Telas pequenas (< md): Layout compacto com imagem e título sobrepostos
 * - Telas grandes (>= md): Layout completo com grid de 2 colunas
 */
export default function AppleHeroResponsive() {
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
        <PageWrapper maxWidth="standard" paddingY="hero">
          <div className="text-center py-12 lg:py-16">
            <Typography variant="muted" className="font-light">
              {missingConfig
                ? "Firebase não configurado. Defina as variáveis .env e adicione documentos em /news."
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
      <PageWrapper maxWidth="standard" paddingY="normal">
        {/* Responsive Hero Container */}
        <div className="relative z-10 py-4 sm:py-6 lg:py-8">
          
          {/* Mobile Compact Layout (< md) */}
          <div className="block md:hidden">
            <Link
              href={featured.slug ? `/noticias/${featured.slug}` : `#`}
              className="group block transition-all duration-300 ease-out"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 ease-out">
                {featured.featuredImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="aspect-[16/9] w-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-105"
                      src={featured.featuredImage}
                      alt={featured.title || "Capa da notícia"}
                    />
                    
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    
                    {/* Category Badge - positioned over image */}
                    {featured.category && (
                      <div className="absolute top-3 left-3">
                        <Badge 
                          variant="secondary"
                          className="rounded-full font-light tracking-wide bg-background/90 backdrop-blur-sm text-xs"
                        >
                          {featured.category}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Title overlay - positioned over image bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Typography 
                        variant="h2" 
                        className="text-white font-light tracking-tight leading-tight text-lg line-clamp-2 group-hover:text-primary-foreground transition-colors duration-300"
                        maxWidth="none"
                      >
                        {formatNewsTitle(featured.title, { applyCapitalization: true })}
                      </Typography>
                    </div>
                  </>
                ) : (
                  <div className="aspect-[16/9] rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex flex-col items-center justify-center p-4">
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
                      className="text-center font-light tracking-tight leading-tight text-lg line-clamp-3 group-hover:text-primary transition-colors duration-300"
                      maxWidth="none"
                    >
                      {formatNewsTitle(featured.title, { applyCapitalization: true })}
                    </Typography>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Full Layout (>= md) */}
          <div className="hidden md:block">
            <ContentWrapper layout="grid-2" gap="normal" align="center" className="lg:gap-12">
              {/* Content Column - Apple-inspired typography and spacing */}
              <ContentWrapper layout="stack" gap="normal" className="order-2 sm:order-1 text-left">
                {/* Category Badge - Apple minimal style aligned with theme variables */}
                {featured.category && (
                  <div className="flex justify-start">
                    <Badge 
                      variant="secondary"
                      className="rounded-full font-light tracking-wide"
                    >
                      {featured.category}
                    </Badge>
                  </div>
                )}

                {/* Title - Apple-inspired refined typography */}
                <div className="space-y-4">
                  <Typography 
                    variant="hero" 
                    className="text-balance font-light tracking-tight leading-[1.15] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl"
                    maxWidth="none"
                  >
                    <Link
                      href={featured.slug ? `/noticias/${featured.slug}` : `#`}
                      className="group inline-block transition-all duration-500 ease-out hover:text-primary"
                    >
                      <span className="block transform transition-transform duration-500 ease-out group-hover:translate-y-[-2px]">
                        {formatNewsTitle(featured.title, { applyCapitalization: true })}
                      </span>
                      
                      {/* Apple-style underline animation */}
                      <div className="h-px bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out mt-2" />
                    </Link>
                  </Typography>

                  {/* Excerpt - Apple elegant body text */}
                  <Typography 
                    variant="body-lg" 
                    className="text-balance font-light leading-relaxed text-muted-foreground max-w-xl text-base lg:text-lg line-clamp-3"
                    maxWidth="none"
                  >
                    {featured.excerpt}
                  </Typography>
                </div>
                
                {/* Apple-style minimal separator */}
                <div className="flex justify-start py-2">
                  <Separator className="bg-gradient-to-r from-border/20 via-border/60 to-border/20 max-w-16" />
                </div>
                
                {/* CTA Button - Apple refined style */}
                <div className="flex justify-start">
                  <Button 
                    size="lg" 
                    asChild
                    className="group px-8 py-4 text-base font-medium rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
                  >
                    <Link href={featured.slug ? `/noticias/${featured.slug}` : `#`}>
                      <span className="flex items-center gap-2">
                        Ler notícia
                        <svg 
                          className="size-4 transform transition-transform duration-300 group-hover:translate-x-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </Link>
                  </Button>
                </div>
              </ContentWrapper>
              
              {/* Image Column - Apple-inspired presentation */}
              <div className="order-1 sm:order-2">
                <Link
                  href={featured.slug ? `/noticias/${featured.slug}` : `#`}
                  aria-label={featured.title}
                  className="group block transition-all duration-500 ease-out"
                >
                  {featured.featuredImage ? (
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 ease-out">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="aspect-[4/3] lg:aspect-[5/4] w-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                        src={featured.featuredImage}
                        alt={featured.title || "Capa da notícia"}
                      />
                      
                      {/* Apple-style subtle overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] lg:aspect-[5/4] rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center shadow-lg">
                      <Typography variant="muted" className="font-light">
                        Sem imagem
                      </Typography>
                    </div>
                  )}
                </Link>
              </div>
            </ContentWrapper>
          </div>
        </div>
      </PageWrapper>
    </SectionWrapper>
  )
}