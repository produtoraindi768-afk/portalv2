import "./globals.css"
import "@/lib/console-filter"
import { SiteHeader } from "@/components/layout/SiteHeader"
import HeaderFeaturedMatchesTab from "@/components/layout/HeaderFeaturedMatchesTab"
import FooterSection from "@/components/layout/FooterSection"
import { MiniplPlayerProvider } from "@/components/miniplayer/MiniplPlayerProvider"
import { PermissionsProvider } from "@/components/providers/PermissionsProvider"
import { HeaderHeightProvider } from "@/contexts/HeaderHeightContext"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import ClientProviders from "@/components/providers/ClientProviders"
import type { Metadata } from "next"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap", // Prevent layout shift during font loading
  variable: "--font-inter",
  preload: true, // Preload the font
  fallback: ['system-ui', 'arial'], // Ensure fallback fonts
})

export const metadata: Metadata = {
  title: "SZ - Fortnite Ballistic",
  description: "Portal da comunidade SafeZone - Fortnite Ballistic. Notícias, torneios, times e lives dos melhores streamers.",
  keywords: ["SafeZone", "SZ", "Fortnite", "Ballistic", "esports", "torneios", "streamers", "gaming"],
  authors: [{ name: "SafeZone" }],
  creator: "SafeZone",
  publisher: "SafeZone",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/faviconsz.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/faviconsz.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: "/faviconsz.png",
    apple: [
      {
        url: "/faviconsz.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/faviconsz.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/faviconsz.png" />
        <link rel="shortcut icon" href="/faviconsz.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/faviconsz.png" />
      </head>
      <body className="min-h-svh flex flex-col">
        <PermissionsProvider suppressWarnings={true}>
          <HeaderHeightProvider>
            <MiniplPlayerProvider>
              <SiteHeader />
              <HeaderFeaturedMatchesTab />
              <main className="flex-1">{children}</main>
              <FooterSection />
            </MiniplPlayerProvider>
          </HeaderHeightProvider>
        </PermissionsProvider>
        <Toaster />
        <ClientProviders />
      </body>
    </html>
  )
}


