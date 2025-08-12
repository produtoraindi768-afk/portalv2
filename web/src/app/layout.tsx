import "./globals.css"
import { SiteHeader } from "@/components/layout/SiteHeader"
import FooterSection from "@/components/layout/FooterSection"
import { MiniplPlayerProvider } from "@/components/miniplayer/MiniplPlayerProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-svh flex flex-col">
        <MiniplPlayerProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <FooterSection />
        </MiniplPlayerProvider>
      </body>
    </html>
  )
}


