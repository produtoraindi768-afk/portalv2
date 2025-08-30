"use client"

import { Separator } from "@/components/ui/separator"
import { SectionWrapper, PageWrapper } from "@/components/layout"
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars"
import AppleHeroSection from "@/components/sections/AppleHeroSection"
import { NewsSection } from "@/components/sections/NewsSection"
import { UnifiedStreamWidget } from "@/components/streamers/UnifiedStreamWidget"

export default function Home() {
  return (
    <StarsBackground 
      className="relative min-h-screen" 
      starColor="#ffffff" 
      speed={60}
      factor={0.03}
    >
        {/* Hero Section - PRIMEIRA SEÇÃO - notícias em destaque */}
        <section id="hero" className="pt-3 sm:pt-4 md:pt-6">
          <AppleHeroSection />
        </section>
        
        {/* Separator Apple-style - espaçamento sutil */}
        <div className="py-3 sm:py-4">
          <PageWrapper maxWidth="wide" paddingY="none">
            <div className="flex justify-center">
              <Separator className="bg-gradient-to-r from-transparent via-border/20 to-transparent max-w-xs" />
            </div>
          </PageWrapper>
        </div>
        
        {/* Unified Stream Widget - SEGUNDA SEÇÃO - streams em destaque */}
        <section id="streams">
          <SectionWrapper spacing="normal" background="transparent">
            <PageWrapper maxWidth="wide" paddingY="compact" paddingX="none" className="px-2 sm:px-3 md:px-4 lg:px-6">
              <UnifiedStreamWidget />
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
        
        {/* News Section - TERCEIRA SEÇÃO - espaçamento compacto */}
        <SectionWrapper spacing="compact" background="transparent">
          <PageWrapper maxWidth="wide" paddingY="normal" paddingX="none" className="px-2 sm:px-3 md:px-4 lg:px-6">
            <NewsSection limit={6} showHeader={false} hideDescriptions={true} />
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
