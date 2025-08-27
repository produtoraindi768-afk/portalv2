import { Metadata } from 'next'
import { NewsSection } from "@/components/sections/NewsSection"

export const metadata: Metadata = {
  title: 'Notícias | SZ - Fortnite Ballistic',
  description: 'Acompanhe as últimas notícias e novidades do mundo dos esports, torneios e streamers'
}

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background/95 to-muted/20 py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Últimas atualizações
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Notícias
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fique por dentro das últimas novidades do mundo dos esports, 
              torneios, streamers e muito mais
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced News List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <NewsSection 
            limit={undefined} // Mostrar todas as notícias
            showHeader={false} // Header já está na hero section
            excludeFeaturedFromList={false} // Incluir notícia em destaque na lista
            enablePagination={true} // Habilitar paginação
            pageSize={12} // Mais artigos por página
          />
        </div>
      </section>
    </div>
  )
}