"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getClientFirestore } from "@/lib/safeFirestore"
import { collection, getDocs, limit, query, where } from "firebase/firestore"
import { FirebaseError } from "firebase/app"
import NewsHero from "@/components/sections/NewsHero"
// removed unused Image import

type NewsDetail = {
  id: string
  title: string
  contentHtml: string
  featuredImage?: string
  publishDate?: string
  author?: string
  tags?: string[]
  isNew?: boolean
  excerpt?: string
}

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>()
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const slug = params?.slug
    if (!slug) return
    const db = getClientFirestore()
    if (!db) return
    ;(async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        // Consulta preferida: slug + status
        const q = query(
          collection(db, "news"),
          where("slug", "==", String(slug)),
          where("status", "==", "published"),
          limit(1)
        )
        const snap = await getDocs(q)
        if (!snap.empty) {
          const d = snap.docs[0]
          const data = d.data() as Record<string, unknown>
          setNews({
            id: d.id,
            title: typeof data.title === "string" ? data.title : "",
            contentHtml: typeof data.contentHtml === "string" ? data.contentHtml : "",
            featuredImage:
              typeof data.featuredImage === "string" ? data.featuredImage : undefined,
            publishDate: typeof data.publishDate === "string" ? data.publishDate : undefined,
            author: typeof data.author === "string" ? data.author : undefined,
            tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
            isNew: Boolean(data.isNew),
            excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
          })
          setLoading(false)
          return
        }
        // Fallback: consultar apenas pelo slug e filtrar status no cliente (evita índice composto)
        const q2 = query(collection(db, "news"), where("slug", "==", String(slug)), limit(1))
        const snap2 = await getDocs(q2)
        if (snap2.empty) {
          setNews(null)
        } else {
          const d = snap2.docs[0]
          const data = d.data() as Record<string, unknown>
          const statusValue = data["status"]
          const isPublished = typeof statusValue === "string" && statusValue === "published"
          if (isPublished) {
            const titleValue = data["title"]
            const contentHtmlValue = data["contentHtml"]
            const featuredImageValue = data["featuredImage"]
            const publishDateValue = data["publishDate"]
            const authorValue = data["author"]
            const tagsValue = data["tags"]
            const isNewValue = data["isNew"]
            const excerptValue = data["excerpt"]

            setNews({
              id: d.id,
              title: typeof titleValue === "string" ? titleValue : "",
              contentHtml: typeof contentHtmlValue === "string" ? contentHtmlValue : "",
              featuredImage: typeof featuredImageValue === "string" ? featuredImageValue : undefined,
              publishDate: typeof publishDateValue === "string" ? publishDateValue : undefined,
              author: typeof authorValue === "string" ? authorValue : undefined,
              tags: Array.isArray(tagsValue)
                ? (tagsValue as unknown[]).filter((t): t is string => typeof t === "string")
                : [],
              isNew: typeof isNewValue === "boolean" ? isNewValue : Boolean(isNewValue),
              excerpt: typeof excerptValue === "string" ? excerptValue : undefined,
            })
          } else {
            setNews(null)
          }
        }
      } catch (e) {
        if (e instanceof FirebaseError) {
          setErrorMsg(e.message)
        } else {
          setErrorMsg("Erro ao carregar a notícia")
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [params])

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl px-6 py-8">
        <div className="text-muted-foreground">Carregando notícia...</div>
      </main>
    )
  }

  if (!news) {
    return (
      <main className="container mx-auto max-w-3xl px-6 py-8">
        <div className="text-muted-foreground">Notícia não encontrada.</div>
      </main>
    )
  }

  return (
    <div className="min-h-svh flex flex-col">
      <NewsHero
        title={news.title}
        excerpt={news.excerpt}
        coverImageUrl={news.featuredImage}
        tags={news.tags}
        isNew={news.isNew}
        primaryHref="#conteudo"
        secondaryHref="#compartilhar"
      />
      <main id="conteudo" className="container mx-auto max-w-3xl px-6 py-8">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="sr-only">{news.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: news.contentHtml ?? "" }} />
          <hr className="my-8" />
          <div className="text-muted-foreground text-sm">
            {news.publishDate ? new Date(news.publishDate).toLocaleDateString() : null}
            {news.author ? ` • ${news.author}` : null}
          </div>
          <div id="compartilhar" className="mt-8" />
        </article>
      </main>
    </div>
  )
}


