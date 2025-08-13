import "./globals.css"
import { SiteHeader } from "@/components/layout/SiteHeader"
import HeaderFeaturedMatchesTab from "@/components/layout/HeaderFeaturedMatchesTab"
import FooterSection from "@/components/layout/FooterSection"
import { MiniplPlayerProvider } from "@/components/miniplayer/MiniplPlayerProvider"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-inter",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable}`}>
      <body className="min-h-svh flex flex-col">
        <MiniplPlayerProvider>
          <SiteHeader />
          <HeaderFeaturedMatchesTab />
          <main className="flex-1">{children}</main>
          <FooterSection />
        </MiniplPlayerProvider>
      </body>
    </html>
  )
}


