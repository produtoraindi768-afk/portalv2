import { Metadata } from "next"
import HeroSection from "@/components/sections/HeroSection"
import { NewsSection } from "@/components/sections/NewsSection"
import { StreamersSection } from "@/components/sections/StreamersSection"
// import { TournamentsSection } from "@/components/sections/TournamentsSection"
import { FeaturedMatchesSection } from "@/components/sections/FeaturedMatchesSection"
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars"
import { Separator } from "@/components/ui/separator"
import { SectionWrapper, PageWrapper } from "@/components/layout"

export const metadata: Metadata = {
  title: "Home | SZ - Fortnite Ballistic",
}

export default function Home() {
  return (
    <StarsBackground 
      className="relative min-h-screen" 
      starColor="#ffffff" 
      speed={60}
      factor={0.03}
    >
      <SectionWrapper spacing="compact" background="transparent">
        <PageWrapper maxWidth="wide" paddingY="compact">
          <StreamersSection />
          
          {/* Separador dentro da seção de streamers */}
          <div className="mt-6 sm:mt-8">
            <Separator className="bg-border/60" />
          </div>
        </PageWrapper>
      </SectionWrapper>
      
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* Separator between Hero and News */}
      <SectionWrapper spacing="compact" background="transparent">
        <PageWrapper maxWidth="wide" paddingY="compact">
          <Separator className="bg-border/60" />
        </PageWrapper>
      </SectionWrapper>
      
      <section id="news">
        <NewsSection limit={3} showHeader={false} />
      </section>
{/*       <section id="matches">
        <FeaturedMatchesSection />
      </section> */}
{/*       <section id="tournaments">
        <TournamentsSection />
      </section> */}
    </StarsBackground>
  )
}
