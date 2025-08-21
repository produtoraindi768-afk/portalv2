"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { getClientFirestore, isFirebaseConfigured } from "@/lib/safeFirestore"

type TeamInfo = {
  id?: string
  name?: string
  logo?: string | null
  avatar?: string | null
}

type MatchData = {
  id: string
  tournamentName?: string
  scheduledDate?: string
  format?: string
  game?: string
  isFeatured?: boolean
  team1?: TeamInfo
  team2?: TeamInfo
  status?: 'scheduled' | 'ongoing' | 'finished'
  result?: {
    team1Score: number
    team2Score: number
    winner: null | 'team1' | 'team2'
  }
  resultMD3?: {
    team1Score: number
    team2Score: number
    winner: string | null
  }
  resultMD5?: {
    team1Score: number
    team2Score: number
    winner: string | null
  }
}

interface UseMatchesReturn {
  matches: MatchData[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

// Função para mapear status do banco para status da aplicação
function mapStatus(status: string): 'scheduled' | 'ongoing' | 'finished' {
  switch (status?.toLowerCase()) {
    case 'upcoming':
    case 'scheduled':
      return 'scheduled'
    case 'live':
    case 'ongoing':
      return 'ongoing'
    case 'finished':
    case 'completed':
      return 'finished'
    default:
      return 'scheduled'
  }
}

export function useMatches(): UseMatchesReturn {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapMatches = (
    docs: Array<{ id: string; data: () => Record<string, unknown> }>
  ): MatchData[] => {
    return docs.map((d) => {
      const raw = d.data() as Record<string, unknown>
      const team1Raw = (raw.team1 ?? {}) as Record<string, unknown>
      const team2Raw = (raw.team2 ?? {}) as Record<string, unknown>
      
      const team1: TeamInfo = {
        id: (typeof raw.team1Id === "string" ? raw.team1Id : typeof team1Raw.id === "string" ? team1Raw.id : undefined),
        name: typeof team1Raw.name === "string" ? team1Raw.name : "",
        logo: (team1Raw.logo as string | null) ?? (team1Raw.avatar as string | null) ?? null,
        avatar: (team1Raw.avatar as string | null) ?? (team1Raw.logo as string | null) ?? null,
      }
      
      const team2: TeamInfo = {
        id: (typeof raw.team2Id === "string" ? raw.team2Id : typeof team2Raw.id === "string" ? team2Raw.id : undefined),
        name: typeof team2Raw.name === "string" ? team2Raw.name : "",
        logo: (team2Raw.logo as string | null) ?? (team2Raw.avatar as string | null) ?? null,
        avatar: (team2Raw.avatar as string | null) ?? (team2Raw.logo as string | null) ?? null,
      }

      // Mapear resultado
      const resultRaw = (raw.result ?? {}) as Record<string, unknown>
      const result = {
        team1Score: typeof resultRaw.team1Score === "number" ? resultRaw.team1Score : 0,
        team2Score: typeof resultRaw.team2Score === "number" ? resultRaw.team2Score : 0,
        winner: (resultRaw.winner as 'team1' | 'team2' | null) ?? null,
      }

      // Mapear resultMD3
      const resultMD3Raw = (raw.resultMD3 ?? {}) as Record<string, unknown>
      const resultMD3 = {
        team1Score: typeof resultMD3Raw.team1Score === "number" ? resultMD3Raw.team1Score : 0,
        team2Score: typeof resultMD3Raw.team2Score === "number" ? resultMD3Raw.team2Score : 0,
        winner: typeof resultMD3Raw.winner === "string" ? resultMD3Raw.winner : null,
      }

      // Mapear resultMD5
      const resultMD5Raw = (raw.resultMD5 ?? {}) as Record<string, unknown>
      const resultMD5 = {
        team1Score: typeof resultMD5Raw.team1Score === "number" ? resultMD5Raw.team1Score : 0,
        team2Score: typeof resultMD5Raw.team2Score === "number" ? resultMD5Raw.team2Score : 0,
        winner: typeof resultMD5Raw.winner === "string" ? resultMD5Raw.winner : null,
      }


      
      return {
        id: d.id,
        tournamentName: typeof raw.tournamentName === "string" ? raw.tournamentName : undefined,
        scheduledDate: typeof raw.scheduledDate === "string" ? raw.scheduledDate : undefined,
        format: typeof raw.format === "string" ? raw.format : undefined,
        game: typeof raw.game === "string" ? raw.game : undefined,
        isFeatured: Boolean(raw.isFeatured),
        team1,
        team2,
        status: mapStatus(raw.status as string),
        result,
        resultMD3,
        resultMD5,
      }
    })
  }

  const loadMatches = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const db = getClientFirestore()
      
      if (!db) {
        throw new Error("Firebase não configurado")
      }

      // Buscar todas as partidas
      const q = query(
        collection(db, "matches")
      )
      
      const snap = await getDocs(q)
      const data = mapMatches(snap.docs)
      
      // Ordenar por data no cliente para evitar problemas com campos ausentes
      const sortedData = data.sort((a, b) => {
        const dateA = a.scheduledDate || ''
        const dateB = b.scheduledDate || ''
        return dateB.localeCompare(dateA)
      })
      
      setMatches(sortedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar partidas"
      setError(errorMessage)
      console.error("Erro ao carregar partidas:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = () => {
    loadMatches()
  }

  useEffect(() => {
    loadMatches();
  }, []);

  return {
    matches,
    isLoading,
    error,
    refetch,
  }
}

// Hook específico para partidas em destaque
export function useFeaturedMatches(): UseMatchesReturn {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapMatches = (
    docs: Array<{ id: string; data: () => Record<string, unknown> }>
  ): MatchData[] => {
    return docs.map((d) => {
      const raw = d.data() as Record<string, unknown>
      const team1Raw = (raw.team1 ?? {}) as Record<string, unknown>
      const team2Raw = (raw.team2 ?? {}) as Record<string, unknown>
      
      const team1: TeamInfo = {
        id: (typeof raw.team1Id === "string" ? raw.team1Id : typeof team1Raw.id === "string" ? team1Raw.id : undefined),
        name: typeof team1Raw.name === "string" ? team1Raw.name : "",
        logo: (team1Raw.logo as string | null) ?? (team1Raw.avatar as string | null) ?? null,
        avatar: (team1Raw.avatar as string | null) ?? (team1Raw.logo as string | null) ?? null,
      }
      
      const team2: TeamInfo = {
        id: (typeof raw.team2Id === "string" ? raw.team2Id : typeof team2Raw.id === "string" ? team2Raw.id : undefined),
        name: typeof team2Raw.name === "string" ? team2Raw.name : "",
        logo: (team2Raw.logo as string | null) ?? (team2Raw.avatar as string | null) ?? null,
        avatar: (team2Raw.avatar as string | null) ?? (team2Raw.logo as string | null) ?? null,
      }
      
      return {
        id: d.id,
        tournamentName: typeof raw.tournamentName === "string" ? raw.tournamentName : undefined,
        scheduledDate: typeof raw.scheduledDate === "string" ? raw.scheduledDate : undefined,
        format: typeof raw.format === "string" ? raw.format : undefined,
        game: typeof raw.game === "string" ? raw.game : undefined,
        isFeatured: Boolean(raw.isFeatured),
        team1,
        team2,
        status: mapStatus(raw.status as string),
      }
    })
  }

  const loadFeaturedMatches = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const db = getClientFirestore()
      if (!db) {
        throw new Error("Firebase não configurado")
      }

      const nowIso = new Date().toISOString()
      
      try {
        // Tentar buscar partidas futuras em destaque
        const q = query(
          collection(db, "matches"),
          where("isFeatured", "==", true),
          where("scheduledDate", ">=", nowIso),
          orderBy("scheduledDate", "asc")
        )
        const snap = await getDocs(q)
        const data = mapMatches(snap.docs)
        setMatches(data)
      } catch (e) {
        // Fallback: buscar apenas por isFeatured e filtrar no cliente
        const snap = await getDocs(
          query(collection(db, "matches"), where("isFeatured", "==", true))
        )
        const all = mapMatches(snap.docs)
        const future = all
          .filter((m) => (m.scheduledDate ? m.scheduledDate >= nowIso : false))
          .sort((a, b) => (a.scheduledDate ?? "").localeCompare(b.scheduledDate ?? ""))
        setMatches(future)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar partidas em destaque"
      setError(errorMessage)
      console.error("Erro ao carregar partidas em destaque:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = () => {
    loadFeaturedMatches()
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadFeaturedMatches()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  return {
    matches,
    isLoading,
    error,
    refetch,
  }
}