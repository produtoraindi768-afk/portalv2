"use client"

import { Separator } from "@/components/ui/separator"
import { SectionWrapper, PageWrapper } from "@/components/layout"
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars"
import AppleHeroSection from "@/components/sections/AppleHeroSection"
import { NewsSection } from "@/components/sections/NewsSection"
import { StreamersSection } from "@/components/sections/StreamersSectionImproved"

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
              <StreamersSection />
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
          <AppleHeroSection />
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
            <NewsSection limit={6} showHeader={false} />
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
