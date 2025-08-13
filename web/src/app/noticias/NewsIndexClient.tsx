"use client"

import { useState } from "react"
import { NewsSection } from "@/components/sections/NewsSection"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function NewsIndexClient() {
  const [filters, setFilters] = useState<{ category?: string; tag?: string }>({})
  const [meta, setMeta] = useState<{ categories: string[]; tags: string[] }>({ categories: [], tags: [] })

  return (
    <>
      <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-7xl">
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Select
            value={filters.category ?? "all"}
            onValueChange={(v) => setFilters((f) => ({ ...f, category: v === "all" ? undefined : v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {meta.categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.tag ?? "all"} onValueChange={(v) => setFilters((f) => ({ ...f, tag: v === "all" ? undefined : v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {meta.tags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filters.category || filters.tag) && (
            <div className="flex items-center gap-2">
              {filters.category && <Badge variant="secondary">Categoria: {filters.category}</Badge>}
              {filters.tag && <Badge variant="outline">Tag: {filters.tag}</Badge>}
              <button
                className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                onClick={() => setFilters({})}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <NewsSection
        showHeader={false}
        excludeFeaturedFromList={false}
        category={filters.category}
        tag={filters.tag}
        enablePagination
        pageSize={9}
        onMeta={setMeta}
      />
    </>
  )
}


