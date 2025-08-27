import { Metadata } from 'next'
import { NewsSection } from "@/components/sections/NewsSection"
import { PageLayout } from "@/components/layout"

export const metadata: Metadata = {
  title: 'Notícias | SZ - Fortnite Ballistic',
}

export default function NoticiasPage() {
  return (
    <PageLayout
      pattern="wide"
      title="Notícias"
      description="Fique por dentro das últimas novidades do mundo dos esports, torneios e streamers favoritos"
    >
      <NewsSection 
        limit={undefined} // Mostrar todas as notícias
        showHeader={false} // Header já está no PageLayout
        excludeFeaturedFromList={false} // Incluir notícia em destaque na lista
      />
    </PageLayout>
  )
}