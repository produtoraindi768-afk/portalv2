import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { collection, query, where, getDocs } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import NewsHero from "@/components/sections/NewsHero"

type NewsDoc = {
  id: string
  title: string
  content: string
  summary?: string
  slug: string
  coverImage?: string
  publishDate?: string
  publishedAt?: any
  tags?: string[]
  author?: string
  status: "draft" | "published"
  isFeatured?: boolean
}

interface PageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

async function getNewsItem(slug: string): Promise<NewsDoc | null> {
  try {
    const db = getClientFirestore()
    if (!db) return null

    const q = query(
      collection(db, "news"),
      where("slug", "==", slug),
      where("status", "==", "published")
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      title: data.title || '',
      content: data.contentHtml || data.content || '',
      summary: data.summary || data.excerpt || '',
      slug: data.slug || '',
      coverImage: data.coverImage || data.featuredImage || '',
      publishDate: data.publishDate || '',
      publishedAt: data.publishedAt,
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || '',
      status: data.status || 'draft',
      isFeatured: Boolean(data.isFeatured)
    } as NewsDoc
  } catch (error) {
    console.error('Error fetching news item:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const newsItem = await getNewsItem(slug)
  
  if (!newsItem) {
    return {
      title: 'Notícia não encontrada',
      description: 'A notícia solicitada não foi encontrada'
    }
  }

  return {
    title: newsItem.title,
    description: newsItem.summary || newsItem.content.substring(0, 160),
    openGraph: {
      title: newsItem.title,
      description: newsItem.summary || newsItem.content.substring(0, 160),
      images: newsItem.coverImage ? [newsItem.coverImage] : undefined,
      type: 'article',
      publishedTime: newsItem.publishDate,
      authors: newsItem.author ? [newsItem.author] : undefined,
      tags: newsItem.tags
    }
  }
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const newsItem = await getNewsItem(slug)
  
  if (!newsItem) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* News Hero */}
      <NewsHero
        title={newsItem.title}
        excerpt={newsItem.summary || ''}
        coverImageUrl={newsItem.coverImage || ''}
        tags={newsItem.tags || []}
        isNew={false}
        primaryHref="#conteudo"
        secondaryHref="/noticias"
      />

      {/* Article Content */}
      <section id="conteudo" className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: newsItem.content }}
                className="text-foreground"
              />
            </article>
          </div>
        </div>
      </section>
    </div>
  )
} 