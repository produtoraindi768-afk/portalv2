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
} from "@/components/ui/sheet"

import { navItems } from "./nav-items"

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-[70]">
      <nav className="mx-auto flex h-20 w-full items-center gap-6 px-6 lg:max-w-7xl">
        <Link href="/" className="mr-auto inline-flex items-center gap-2" aria-label="Página inicial">
          <Image src="/logo sz.svg" alt="SZ" width={85} height={32} priority />
        </Link>

        <div className="hidden gap-2 lg:inline-flex">
          {navItems.map((item) => (
            <Button key={item.title} asChild variant="ghost">
              <Link href={item.href}>{item.title}</Link>
            </Button>
          ))}
        </div>

        <div className="hidden justify-end gap-2 lg:inline-flex">
          <Button asChild variant="outline" size="icon" title="Discord Server">
            <Link 
              href="https://discord.com/invite/Z2wSdgWWTQ" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Junte-se ao nosso servidor Discord"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <ExternalLink className="size-3 absolute top-1 right-1" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="#">Sign up</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild className="ml-auto lg:hidden">
            <Button variant="outline" size="icon" aria-label="Open Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-[90%] max-w-sm flex-col px-6 py-6">
            <SheetTitle>
              <Link href="/" className="inline-flex items-center gap-2">
                <Image src="/logo sz.svg" alt="SZ" width={85} height={32} />
              </Link>
            </SheetTitle>

            <nav className="-mx-4 my-6 flex flex-1 flex-col gap-2">
              {navItems.map((item) => (
                <Button key={item.title} asChild className="justify-start text-base" variant="ghost">
                  <Link href={item.href}>{item.title}</Link>
                </Button>
              ))}
            </nav>

            <div className="mt-auto grid gap-2">
              <Button variant="outline" asChild className="justify-start">
                <Link 
                  href="https://discord.com/invite/Z2wSdgWWTQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Discord
                  <ExternalLink className="size-3 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="#">Get Started</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}


