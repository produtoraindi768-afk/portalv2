import { Metadata } from 'next'
import { NewsSection } from "@/components/sections/NewsSection"

export const metadata: Metadata = {
  title: 'Notícias',
  description: 'Últimas notícias e atualizações sobre esports, torneios e streamers'
}

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background/95 to-muted/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Notícias
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fique por dentro das últimas novidades do mundo dos esports, 
              torneios e streamers favoritos
            </p>
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <NewsSection 
            limit={undefined} // Mostrar todas as notícias
            showHeader={false} // Header já está na hero section
            excludeFeaturedFromList={false} // Incluir notícia em destaque na lista
          />
        </div>
      </section>
    </div>
  )
}