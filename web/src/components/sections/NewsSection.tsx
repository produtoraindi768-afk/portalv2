"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

type NewsDoc = {
  id: string
  title?: string
  excerpt?: string
  featuredImage?: string
  publishDate?: string
  status?: "draft" | "published"
  slug?: string
}

export function NewsSection({ limit }: { limit?: number }) {
  const [items, setItems] = useState<NewsDoc[]>([])
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
        setItems(docs)
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
    } satisfies NewsDoc
  }

  const displayItems = limit ? items.slice(0, limit) : items

  return (
    <section className="py-16 lg:py-32">
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl/tight font-semibold tracking-tight sm:text-4xl/tight">
            Últimas notícias
          </h2>
          <p className="text-muted-foreground mt-4 text-base/7 sm:text-lg/8">
            Acompanhe as atualizações e novidades da comunidade.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-12">
          {displayItems.map((n) => (
            <div key={n.id} className="flex flex-col items-start">
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
              <div className="mt-6 flex-1">
                <div className="text-muted-foreground text-xs font-medium">
                  {n.publishDate ?? ""}
                </div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight line-clamp-2">
                  {n.title}
                </h3>
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

          {items.length === 0 && (
            <div className="text-muted-foreground">
              {missingConfig
                ? "Firebase não configurado. Defina as variáveis .env e adicione documentos em /news."
                : errorMsg
                ? `Erro: ${errorMsg}`
                : "Sem notícias publicadas."}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


