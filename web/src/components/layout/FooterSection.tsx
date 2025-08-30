import Link from "next/link"
import Image from "next/image"
import { navItems } from "./nav-items"
import { Github } from 'lucide-react'
export default function FooterSection() {
  return (
    <footer className="py-16 glass">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="sm:col-span-3 lg:col-span-2">
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo sz.svg" alt="SZ" width={85} height={32} />
              </Link>
              <p className="text-muted-foreground mt-6 text-sm/6">
                Hub da comunidade Fortnite: Ballistic — notícias, streamers ao vivo, partidas e torneios em um só lugar.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium tracking-tight">Páginas</h3>
            <div className="mt-6 flex flex-col items-start gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium tracking-tight">Support</h3>
            <div className="mt-6 flex flex-col items-start gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Help center
              </a>
              <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Termos de Serviço
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Legal
              </a>
              <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium tracking-tight">Contact</h3>
            <div className="mt-6 flex flex-col items-start gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                contato@site.com
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                + 46 526 220 0459
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                + 46 526 220 0459
              </a>
            </div>
          </div>
        </div>
        <hr className="mt-12 mb-6" />
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-muted-foreground text-sm">© 2025 Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#">
              <span className="sr-only">Facebook</span>
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            <a href="#">
              <span className="sr-only">X</span>
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z"></path>
              </svg>
            </a>
            <a href="#">
              <span className="sr-only">GitHub</span>
              <Github className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


