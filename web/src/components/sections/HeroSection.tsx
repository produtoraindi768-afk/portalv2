"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
      <div className="pt-24 pb-8 lg:pt-32 lg:pb-16">
        <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
          <div className="text-muted-foreground">
            {missingConfig
              ? "Firebase não configurado. Defina as variáveis .env e adicione documentos em /news."
              : errorMsg
              ? `Erro: ${errorMsg}`
              : "Sem notícia em destaque."}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-8 lg:pt-32 lg:pb-16">
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-2">
            <div className="ml-auto text-center lg:max-w-lg lg:text-left">
              {featured.category ? (
                <div className="mb-3 flex justify-center lg:justify-start">
                  <Badge variant="secondary" className="rounded-full">
                    {featured.category}
                  </Badge>
                </div>
              ) : null}
              <h1 className="text-3xl/tight font-bold tracking-tight text-balance sm:text-4xl/tight lg:text-5xl/tight">
                {featured.title}
              </h1>
              <p className="text-muted-foreground mt-4 text-base/7 text-balance sm:text-lg/8">
                {featured.excerpt}
              </p>
              <div className="mt-8 grid gap-3 sm:flex sm:justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link href={featured.slug ? `/noticias/${featured.slug}` : `#`}>
                    Ler notícia
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-1">
            <Link
              href={featured.slug ? `/noticias/${featured.slug}` : `#`}
              aria-label={featured.title}
              className="block transition-transform hover:scale-[1.02] duration-200"
            >
              {featured.featuredImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="aspect-[16/9] rounded-xl object-cover object-center shadow-sm lg:aspect-[4/3]"
                  src={featured.featuredImage}
                  alt={featured.title || "Capa"}
                />
              ) : (
                <div className="aspect-[16/9] rounded-xl border bg-card lg:aspect-[4/3]" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


