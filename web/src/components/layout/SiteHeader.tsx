"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { cn } from "@/lib/utils"

import { navItems } from "./nav-items"

export function SiteHeader() {
  const { scrollDirection, isAtTop } = useScrollDirection()
  
  return (
    <header className={cn(
      "glass-header sticky top-0 z-[100] transition-all duration-500 ease-out",
      scrollDirection === 'down' && !isAtTop && "-translate-y-full",
      scrollDirection === 'up' && "translate-y-0",
      isAtTop && "translate-y-0"
    )}>
      <nav className="mx-auto flex h-20 lg:h-24 w-full items-center gap-8 px-6 lg:px-8 lg:max-w-7xl">
        <Link href="/" className="mr-auto inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105" aria-label="Página inicial">
          <Image 
            src="/logo sz.svg" 
            alt="SZ" 
            width={85} 
            height={32} 
            priority
            className="w-16 h-auto sm:w-[85px] opacity-90 transition-opacity duration-300 hover:opacity-100" 
          />
        </Link>

        {/* Navegação Apple-inspired para desktop */}
        <div className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => (
            <Link 
              key={item.title} 
              href={item.href}
              className="group relative py-2 text-base font-light tracking-wide text-foreground/80 hover:text-primary transition-all duration-300 ease-out"
            >
              <span className="relative z-10">{item.title}</span>
              <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            </Link>
          ))}
        </div>

        {/* Botões de ação Apple-inspired */}
        <div className="hidden lg:flex items-center gap-4">
          <Link 
            href="https://discord.com/invite/Z2wSdgWWTQ" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Junte-se ao nosso servidor Discord"
            className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-border/30 hover:border-primary/40 transition-all duration-300 text-sm font-medium hover:bg-muted/10"
          >
            <svg
              className="size-4 group-hover:scale-110 transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="hidden xl:inline">Discord</span>
          </Link>
          
          <Link 
            href="#" 
            className="px-5 py-2 text-sm font-medium border border-border/30 rounded-xl hover:border-primary/50 transition-all duration-300 hover:bg-muted/10"
          >
            Entrar
          </Link>
          
          <Link 
            href="#" 
            className="px-5 py-2 text-sm font-medium bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all duration-300 hover:scale-[1.02]"
          >
            Começar
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild className="ml-auto lg:hidden">
            <Button variant="outline" size="sm" className="h-9 w-9" aria-label="Open Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full h-full flex-col bg-background/95 backdrop-blur-xl border-0">
            <div className="flex flex-col h-full">
              {/* Header ultra minimalista */}
              <div className="flex justify-between items-center px-8 py-8">
                <SheetTitle className="">
                  <Link href="/" className="inline-flex items-center">
                    <Image
                      src="/logo sz.svg"
                      alt="SZ"
                      width={85}
                      height={32}
                      priority
                      className="w-16 h-auto sm:w-[85px] opacity-80"
                    />
                  </Link>
                </SheetTitle>
              </div>

              {/* Navegação principal - Apple Style com tipografia grande */}
              <div className="flex-1 flex flex-col justify-center px-8">
                <nav className="space-y-12">
                  {navItems.map((item, index) => (
                    <div key={item.title} className="overflow-hidden">
                      <SheetClose asChild>
                        <Link 
                          href={item.href} 
                          className="group block transform transition-all duration-700 ease-out hover:translate-x-2"
                        >
                          <div className="text-4xl md:text-5xl font-light tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                            {item.title}
                          </div>
                          <div className="h-px bg-gradient-to-r from-border/30 to-transparent mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </Link>
                      </SheetClose>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer minimalista - estilo Apple */}
              <div className="px-8 pb-8 space-y-8">
                {/* Botão Discord com design minimalista */}
                <div className="flex justify-center">
                  <Link 
                    href="https://discord.com/invite/Z2wSdgWWTQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-8 py-4 rounded-2xl border border-border/20 hover:border-primary/40 transition-all duration-300 hover:bg-muted/20"
                  >
                    <svg className="size-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span className="text-sm font-medium">Discord</span>
                  </Link>
                </div>

                {/* Botões de autenticação minimalistas */}
                <div className="flex gap-4 max-w-sm mx-auto">
                  <SheetClose asChild>
                    <Link 
                      href="#" 
                      className="flex-1 text-center py-4 px-6 rounded-2xl border border-border/30 hover:border-primary/50 transition-all duration-300 text-sm font-medium hover:bg-muted/10"
                    >
                      Entrar
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link 
                      href="#" 
                      className="flex-1 text-center py-4 px-6 rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 text-sm font-medium hover:scale-[1.02]"
                    >
                      Começar
                    </Link>
                  </SheetClose>
                </div>

                {/* Copyright ultra minimalista */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/50 font-light tracking-wide">
                    © 2024 SafeZone
                  </p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}


