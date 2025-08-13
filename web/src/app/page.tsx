import HeroSection from "@/components/sections/HeroSection"
import { NewsSection } from "@/components/sections/NewsSection"
import { StreamersSection } from "@/components/sections/StreamersSection"
import { TournamentsSection } from "@/components/sections/TournamentsSection"
import { FeaturedMatchesSection } from "@/components/sections/FeaturedMatchesSection"

export default function Home() {
  return (
    <>
      <section id="hero">
        <HeroSection />
      </section>
      <section id="news">
        <NewsSection limit={3} />
      </section>
      <section id="matches">
        <FeaturedMatchesSection />
      </section>
      <section id="streamers">
        <StreamersSection />
      </section>
      <section id="tournaments">
        <TournamentsSection />
      </section>
    </>
  )
}
