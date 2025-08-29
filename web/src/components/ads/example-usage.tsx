'use client'

// Exemplo de uso dos componentes AdSense
// Este arquivo serve como referência para implementação

import { ResponsiveAd, RectangleAd, BannerAd, SidebarAd } from '@/components/ads'

// Exemplo 1: Página de notícias com anúncios integrados
export function NewsPageWithAds() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Últimas Notícias</h1>
      
      {/* Banner no topo da página */}
      <BannerAd adSlot="1234567890" className="mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
          <article className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Título da Notícia</h2>
            <p className="text-muted-foreground mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
            
            {/* Anúncio responsivo no meio do conteúdo */}
            <ResponsiveAd adSlot="2345678901" className="my-6" />
            
            <p className="text-muted-foreground">
              Continuação do conteúdo da notícia...
            </p>
          </article>
          
          {/* Anúncio retângulo entre artigos */}
          <RectangleAd adSlot="3456789012" className="my-8" />
          
          <article>
            <h2 className="text-2xl font-semibold mb-4">Outra Notícia</h2>
            <p className="text-muted-foreground">
              Mais conteúdo interessante...
            </p>
          </article>
        </div>
        
        {/* Sidebar com anúncios */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Publicidade</h3>
            
            {/* Anúncio vertical na sidebar */}
            <SidebarAd adSlot="4567890123" className="mb-6" />
            
            {/* Outro anúncio retângulo na sidebar */}
            <RectangleAd adSlot="5678901234" />
          </div>
        </aside>
      </div>
    </div>
  )
}

// Exemplo 2: Página de torneios com anúncios estratégicos
export function TournamentsPageWithAds() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Torneios</h1>
      
      {/* Anúncio responsivo no topo */}
      <ResponsiveAd adSlot="6789012345" className="mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards de torneios */}
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Torneio 1</h3>
          <p className="text-muted-foreground">Descrição do torneio...</p>
        </div>
        
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Torneio 2</h3>
          <p className="text-muted-foreground">Descrição do torneio...</p>
        </div>
        
        {/* Anúncio integrado entre os cards */}
        <div className="flex items-center justify-center">
          <RectangleAd adSlot="7890123456" />
        </div>
        
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Torneio 3</h3>
          <p className="text-muted-foreground">Descrição do torneio...</p>
        </div>
      </div>
      
      {/* Banner no final da página */}
      <BannerAd adSlot="8901234567" className="mt-12" />
    </div>
  )
}

// Exemplo 3: Como usar em componentes menores
export function ArticleWithInlineAd({ title, content }: { title: string; content: string }) {
  return (
    <article className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p>{content.slice(0, 200)}...</p>
        
        {/* Anúncio no meio do artigo */}
        <div className="not-prose my-6">
          <ResponsiveAd adSlot="9012345678" />
        </div>
        
        <p>{content.slice(200)}...</p>
      </div>
    </article>
  )
}