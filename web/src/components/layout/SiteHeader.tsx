"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"

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
    <header className="glass">
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


