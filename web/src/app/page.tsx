import { Metadata } from "next"
import HeroSection from "@/components/sections/HeroSection"
import { NewsSection } from "@/components/sections/NewsSection"
import { StreamersSection } from "@/components/sections/StreamersSection"
// import { TournamentsSection } from "@/components/sections/TournamentsSection"
import { FeaturedMatchesSection } from "@/components/sections/FeaturedMatchesSection"

export const metadata: Metadata = {
  title: "Home | SZ - Fortnite Ballistic",
}

export default function Home() {
  return (
    <>
      <section id="streamers">
        <StreamersSection />
      </section>
      <section id="hero">
        <HeroSection />
      </section>
      <section id="news">
        <NewsSection limit={3} showHeader={false} />
      </section>
{/*       <section id="matches">
        <FeaturedMatchesSection />
      </section> */}
{/*       <section id="tournaments">
        <TournamentsSection />
      </section> */}
    </>
  )
}
