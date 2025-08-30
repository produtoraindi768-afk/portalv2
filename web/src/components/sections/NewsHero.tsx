"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowRight, Share2 } from "lucide-react"
import { formatNewsTitle } from '@/lib/text-utils'

export interface NewsHeroProps {
  title: string
  excerpt?: string
  coverImageUrl?: string
  tags?: string[]
  isNew?: boolean
  primaryHref?: string
  secondaryHref?: string
}

export default function NewsHero({
  title,
  excerpt,
  coverImageUrl,
  tags = [],
  isNew,
  primaryHref = "#conteudo",
  secondaryHref = "#",
}: NewsHeroProps) {
  return (
    <section>
      <div className="pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-40 lg:pb-24">
        <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
              {isNew ? <Badge>Nova</Badge> : null}
              {tags?.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
            <h1 className="mt-4 text-2xl/tight font-bold tracking-tight text-balance sm:text-3xl/tight lg:text-4xl/tight">
              {formatNewsTitle(title, { applyCapitalization: true })}
            </h1>
            {excerpt ? (
              <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-base/7 text-balance sm:text-lg/8">
                {excerpt}
              </p>
            ) : null}
            <div className="mt-8 grid gap-3 sm:flex sm:justify-center">
              <Button size="lg" asChild>
                <Link href={primaryHref}>Ler notícia</Link>
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" variant="outline">
                    <Share2 className="mr-1" /> Compartilhar
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Compartilhar</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 text-sm text-muted-foreground">
                    <p className="mb-3">Copie o link para compartilhar esta notícia:</p>
                    <div className="rounded-md border bg-background p-3 break-all">
                      {typeof window !== "undefined" ? window.location.href : ""}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-5xl">
            {coverImageUrl ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl shadow-sm">
                <Image
                  src={coverImageUrl}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  priority
                  className="object-cover object-center"
                />
              </div>
            ) : (
              <div className="aspect-[16/9] w-full rounded-xl border bg-card" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
