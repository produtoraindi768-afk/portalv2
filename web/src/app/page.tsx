"use client"

import { Suspense, lazy } from "react"
import { Separator } from "@/components/ui/separator"
import { SectionWrapper, PageWrapper } from "@/components/layout"
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars"

// Lazy-loaded components for better performance
const AppleHeroSection = lazy(() => import("@/components/sections/AppleHeroSection"))
const NewsSection = lazy(() => import("@/components/sections/NewsSection").then(module => ({ default: module.NewsSection })))
const StreamersSection = lazy(() => import("@/components/sections/StreamersSectionImproved").then(module => ({ default: module.StreamersSection })))

// Loading components
const StreamersLoading = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex justify-center mb-8">
      <div className="h-8 bg-muted rounded w-48"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-64"></div>
      ))}
    </div>
  </div>
)

const HeroLoading = () => (
  <div className="animate-pulse">
    <div className="h-96 bg-muted rounded-lg mx-4"></div>
  </div>
)

const NewsLoading = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-48"></div>
      ))}
    </div>
  </div>
)

export default function Home() {
  return (
    <StarsBackground 
      className="relative min-h-screen" 
      starColor="#ffffff" 
      speed={60}
      factor={0.03}
    >
        {/* Streamers Section - PRIMEIRA SEÇÃO - espaçamento mínimo do header */}
        <section id="streams" className="pt-3 sm:pt-4 md:pt-6">
          <SectionWrapper spacing="normal" background="transparent">
            <PageWrapper maxWidth="wide" paddingY="normal">
              <Suspense fallback={<StreamersLoading />}>
                <StreamersSection />
              </Suspense>
            </PageWrapper>
          </SectionWrapper>
        </section>
        
        {/* Separator Apple-style - espaçamento sutil */}
        <div className="py-3 sm:py-4">
          <PageWrapper maxWidth="wide" paddingY="none">
            <div className="flex justify-center">
              <Separator className="bg-gradient-to-r from-transparent via-border/20 to-transparent max-w-xs" />
            </div>
          </PageWrapper>
        </div>
        
        {/* Hero Section - SEGUNDA SEÇÃO - agora são as notícias em destaque */}
        <section id="hero">
          <Suspense fallback={<HeroLoading />}>
            <AppleHeroSection />
          </Suspense>
        </section>
        
        {/* Separator entre Hero e News - mais sutil */}
        <div className="py-2 sm:py-3">
          <PageWrapper maxWidth="wide" paddingY="none">
            <div className="flex justify-center">
              <Separator className="bg-gradient-to-r from-transparent via-border/15 to-transparent max-w-sm" />
            </div>
          </PageWrapper>
        </div>
        
        {/* News Section - TERCEIRA SEÇÃO - espaçamento compacto */}
        <SectionWrapper spacing="compact" background="transparent">
          <PageWrapper maxWidth="wide" paddingY="normal">
            <Suspense fallback={<NewsLoading />}>
              <NewsSection limit={3} showHeader={false} />
            </Suspense>
          </PageWrapper>
        </SectionWrapper>
        
{/*       <section id="matches">
          <FeaturedMatchesSection />
        </section> */}
{/*       <section id="tournaments">
          <TournamentsSection />
        </section> */}
    </StarsBackground>
  )
}
