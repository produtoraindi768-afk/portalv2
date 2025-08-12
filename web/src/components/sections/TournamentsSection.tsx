"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { getClientFirestore } from "@/lib/safeFirestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BlookieEmbed } from "@/components/blookie/BlookieEmbed"

type TournamentDoc = {
  id: string
  name?: string
  startDate?: string
  description?: string
  prizePool?: number
}

export function TournamentsSection() {
  const [items, setItems] = useState<TournamentDoc[]>([])

  useEffect(() => {
    const db = getClientFirestore()
    if (!db) return
    ;(async () => {
      const q = query(collection(db, "tournaments"), orderBy("startDate", "asc"))
      const snap = await getDocs(q)
      const data: TournamentDoc[] = snap.docs.map((d) => {
        const raw = d.data()
        return {
          id: d.id,
          name: typeof raw.name === "string" ? raw.name : "",
          startDate: typeof raw.startDate === "string" ? raw.startDate : undefined,
          description: typeof raw.description === "string" ? raw.description : "",
          prizePool: typeof raw.prizePool === "number" ? raw.prizePool : undefined,
        }
      })
      setItems(data)
    })()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Torneios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <BlookieEmbed
              key={t.id}
              src={process.env.NEXT_PUBLIC_BLOOKIE_SCRIPT_URL ?? ""}
              attributes={{
                type: "event-card",
                name: t.name,
                date: t.startDate ?? "",
                prize: typeof t.prizePool === "number" ? `R$ ${t.prizePool}` : "",
              }}
            />
          ))}
          {items.length === 0 && (
            <div className="text-muted-foreground">Sem torneios no momento.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


