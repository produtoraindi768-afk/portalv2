"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { SectionWrapper, PageWrapper, ContentWrapper } from "@/components/layout"
import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
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

export default function AppleHeroSection() {
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
            <Typography variant="muted" className="font-medium">
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
      <PageWrapper maxWidth="standard" paddingY="compact">
        {/* Hero Container com layout responsivo */}
        <div className="relative z-10 py-2 sm:py-3 lg:py-4">
          {/* Layout Mobile: Card único unificado (< md) */}
          <div className="block md:hidden">
            <div className="relative flex max-w-sm mx-auto flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-500 ease-out">
              {/* Imagem no topo do card */}
              <div className="relative m-0 overflow-hidden text-foreground bg-transparent rounded-none shadow-none bg-clip-border">
                <Link
                  href={featured.slug ? `/noticias/${featured.slug}` : `#`}
                  aria-label={featured.title}
                  className="group block"
                >
                  <AspectRatio ratio={16 / 9}>
                    {featured.featuredImage ? (
                      <img
                        className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                        src={featured.featuredImage}
                        alt={featured.title || "Capa da notícia"}
                      />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center">
                        <Typography variant="muted" className="font-medium">
                          Sem imagem
                        </Typography>
                      </div>
                    )}
                  </AspectRatio>
                </Link>
              </div>
              
              {/* Conteúdo do card */}
              <div className="p-4">
                {/* Category Badge */}
                {featured.category && (
                  <div className="flex justify-start mb-2">
                    <Badge 
                      variant="secondary"
                      className="rounded-full font-medium tracking-wide text-xs"
                    >
                      {featured.category}
                    </Badge>
                  </div>
                )}
                
                {/* Title */}
                <Typography 
                  variant="h4" 
                  className="block font-sans text-base antialiased font-medium leading-snug tracking-normal text-foreground mb-2"
                  maxWidth="none"
                >
                  <Link
                    href={featured.slug ? `/noticias/${featured.slug}` : `#`}
                    className="hover:text-primary transition-colors duration-300"
                  >
                    {formatNewsTitle(featured.title, { applyCapitalization: true })}
                  </Link>
                </Typography>
                
              </div>
            </div>
          </div>

          {/* Layout Desktop: Grid 2 colunas (≥ md) */}
          <div className="hidden md:block">
            <ContentWrapper layout="grid-2" gap="normal" align="center" className="lg:gap-8">
              {/* Content Column - Apple-inspired typography and spacing */}
              <ContentWrapper layout="stack" gap="compact" className="order-2 md:order-1 text-left">
                {/* Category Badge - Apple minimal style aligned with theme variables */}
                {featured.category && (
                  <div className="flex justify-start">
                    <Badge 
                      variant="secondary"
                      className="rounded-full font-medium tracking-wide"
                    >
                      {featured.category}
                    </Badge>
                  </div>
                )}

                {/* Title - Apple-inspired refined typography */}
                <div className="space-y-2 mt-1">
                  <Typography 
                    variant="hero" 
                    className="text-balance font-medium tracking-tight leading-[1.2] text-xl md:text-2xl lg:text-3xl xl:text-4xl"
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
                </div>

                {/* Description/Excerpt - Added for desktop version */}
                {featured.excerpt && (
                  <div className="mt-0 space-y-3">
                    <Typography 
                      variant="body" 
                      className="text-sm sm:text-base text-balance text-muted-foreground leading-relaxed max-w-md line-clamp-4"
                      maxWidth="none"
                    >
                      {featured.excerpt}
                    </Typography>
                    
                    {/* Read More Button */}
                    <Button 
                      variant="link" 
                      size="sm"
                      className="h-auto p-0 pl-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors justify-start"
                      asChild
                    >
                      <Link href={featured.slug ? `/noticias/${featured.slug}` : `#`} className="flex items-center">
                        Leia Mais
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}

              </ContentWrapper>
              
              {/* Image Column - Apple-inspired presentation */}
              <div className="order-1 md:order-2 w-full">
                <Link
                  href={featured.slug ? `/noticias/${featured.slug}` : `#`}
                  aria-label={featured.title}
                  className="group block transition-all duration-500 ease-out"
                >
                  {featured.featuredImage ? (
                    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 ease-out">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <div className="aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[5/3]">
                        <img
                          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
                          src={featured.featuredImage}
                          alt={featured.title || "Capa da notícia"}
                        />
                      </div>
                      
                      {/* Apple-style subtle overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[5/3]">
                      <div className="w-full h-full rounded-2xl md:rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center shadow-lg">
                        <Typography variant="muted" className="font-medium">
                          Sem imagem
                        </Typography>
                      </div>
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