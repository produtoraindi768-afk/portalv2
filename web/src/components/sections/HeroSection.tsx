"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SectionWrapper, PageWrapper, ContentWrapper, Typography } from "@/components/layout"
import { formatNewsTitle } from "@/lib/text-utils"

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

export default function HeroSection() {
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
      <SectionWrapper spacing="normal" fullWidth>
        <PageWrapper maxWidth="wide" paddingY="normal">
          <Typography variant="muted">
            {missingConfig
              ? "Firebase não configurado. Defina as variáveis .env e adicione documentos em /news."
              : errorMsg
              ? `Erro: ${errorMsg}`
              : "Sem notícia em destaque."}
          </Typography>
        </PageWrapper>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper spacing="normal" background="transparent" fullWidth>
      <PageWrapper maxWidth="wide" paddingY="compact">
        <ContentWrapper layout="grid-2" gap="normal" align="center" className="md:gap-spacious">
          {/* Content Column - Text on left, image on right for desktop */}
          <ContentWrapper layout="stack" gap="normal" className="order-2 md:order-1 md:max-w-lg">
            {featured.category && (
              <div className="flex justify-center md:justify-start">
                <Badge variant="secondary" className="rounded-full">
                  {featured.category}
                </Badge>
              </div>
            )}
            <Typography 
              variant="hero" 
              className="text-balance text-center md:text-left"
              maxWidth="none"
            >
              <Link
                href={featured.slug ? `/noticias/${featured.slug}` : `#`}
                className="hover:text-primary transition-colors duration-200"
              >
                {formatNewsTitle(featured.title, 'featured')}
              </Link>
            </Typography>
            <Typography 
              variant="body-lg" 
              className="text-balance text-center md:text-left text-muted-foreground"
              maxWidth="none"
            >
              {featured.excerpt}
            </Typography>
            
            {/* Subtle separator before action button */}
            <Separator className="bg-border/20 max-w-24 mx-auto md:mx-0" />
            
            <div className="flex justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link href={featured.slug ? `/noticias/${featured.slug}` : `#`}>
                  Ler notícia
                </Link>
              </Button>
            </div>
          </ContentWrapper>
          
          {/* Image Column */}
          <div className="order-1 md:order-2">
            <Link
              href={featured.slug ? `/noticias/${featured.slug}` : `#`}
              aria-label={featured.title}
              className="block group transition-transform hover:scale-[1.02] duration-200"
            >
              {featured.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="aspect-[16/9] sm:aspect-[4/3] md:aspect-[4/3] rounded-xl object-cover object-center shadow-lg group-hover:shadow-xl transition-shadow duration-200"
                  src={featured.featuredImage}
                  alt={featured.title || "Capa da notícia"}
                />
              ) : (
                <div className="aspect-[16/9] sm:aspect-[4/3] md:aspect-[4/3] rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center">
                  <Typography variant="muted">Sem imagem</Typography>
                </div>
              )}
            </Link>
          </div>
        </ContentWrapper>
      </PageWrapper>
    </SectionWrapper>
  )
}


