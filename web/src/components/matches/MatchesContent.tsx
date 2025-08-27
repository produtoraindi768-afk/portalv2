"use client"

import { useMemo, useState } from "react"
import { useCombinedMatches } from '@/hooks/useCombinedMatches'
import { MatchCard } from "@/components/matches/MatchCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, RefreshCw, Calendar, Trophy, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterStatus = 'all' | 'ongoing' | 'scheduled' | 'finished'

export function MatchesContent() {
  const { matches, isLoading, error, refetch } = useCombinedMatches()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [gameFilter, setGameFilter] = useState('all')

  // Filtrar e organizar partidas
  const filteredMatches = useMemo(() => {
    let filtered = matches

    // Filtro para excluir partidas Bye
    filtered = filtered.filter(match => !match.isBye)

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(match => 
        match.tournamentName?.toLowerCase().includes(term) ||
        match.team1?.name?.toLowerCase().includes(term) ||
        match.team2?.name?.toLowerCase().includes(term) ||
        match.game?.toLowerCase().includes(term)
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(match => match.status === statusFilter as 'scheduled' | 'ongoing' | 'finished')
    }

    // Filtro por jogo
    if (gameFilter !== 'all') {
      filtered = filtered.filter(match => 
        match.game?.toLowerCase().includes(gameFilter.toLowerCase())
      )
    }

    return filtered
  }, [matches, searchTerm, statusFilter, gameFilter])

  // Organizar partidas por status
  const organizedMatches = useMemo(() => {
    const now = new Date().toISOString()
    
    const ongoing = filteredMatches.filter(match => match.status === 'ongoing')
    const scheduled = filteredMatches.filter(match => 
      match.status === 'scheduled' && (match.scheduledDate ? match.scheduledDate >= now : true)
    )
    const finished = filteredMatches.filter(match => match.status === 'finished')

    return { ongoing, scheduled, finished };
  }, [filteredMatches])

  // Obter jogos únicos para o filtro
  const availableGames = useMemo(() => {
    const games = matches
      .map(match => match.game)
      .filter((game): game is string => Boolean(game))
    return Array.from(new Set(games))
  }, [matches])

  const statusOptions: Array<{ value: FilterStatus; label: string; icon: any; color: string }> = [
    { value: 'all', label: 'Todas', icon: Calendar, color: 'bg-muted text-muted-foreground' },
    { value: 'ongoing', label: 'Ao Vivo', icon: Clock, color: 'bg-red-500 text-white' },
    { value: 'scheduled', label: 'Ao Vivo', icon: Clock, color: 'bg-red-500 text-white' },
    { value: 'finished', label: 'Finalizadas', icon: Trophy, color: 'bg-green-500 text-white' },
  ]

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/50">
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-4">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-lg font-semibold">Erro ao carregar partidas</h3>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <Button onClick={refetch} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partidas</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe todas as partidas dos torneios em tempo real
            </p>
          </div>
          <Button 
            onClick={refetch} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por torneio, time ou jogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por Status */}
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    "gap-2",
                    statusFilter === option.value && option.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </Button>
              )
            })}
          </div>

          {/* Filtro por Jogo */}
          {availableGames.length > 0 && (
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os jogos</option>
              {availableGames.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>



      {/* Seções de Partidas */}
      {statusFilter === 'all' ? (
        <>
          {/* Partidas Ao Vivo */}
          {organizedMatches.ongoing.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="bg-red-500 text-white animate-pulse">
                  • AO VIVO
                </Badge>
                <h2 className="text-xl font-semibold">Partidas em Andamento</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizedMatches.ongoing.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* Próximas Partidas */}
          {organizedMatches.scheduled.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="bg-red-500 text-white">
                  🔴 AO VIVO
                </Badge>
                <h2 className="text-xl font-semibold">Partidas Ao Vivo</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizedMatches.scheduled.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          {/* Partidas Finalizadas */}
          {organizedMatches.finished.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                  🏁 FINALIZADAS
                </Badge>
                <h2 className="text-xl font-semibold">Partidas Finalizadas</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizedMatches.finished.slice(0, 12).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
              {organizedMatches.finished.length > 12 && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => setStatusFilter('finished')}>
                    Ver todas as partidas finalizadas ({organizedMatches.finished.length})
                  </Button>
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        /* Visualização filtrada */
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {statusFilter === 'ongoing' && 'Partidas Ao Vivo'}
              {statusFilter === 'scheduled' && 'Partidas Ao Vivo'}
              {statusFilter === 'finished' && 'Partidas Finalizadas'}
            </h2>
            <Badge variant="outline">
              {filteredMatches.length} {filteredMatches.length === 1 ? 'partida' : 'partidas'}
            </Badge>
          </div>
          
          {filteredMatches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma partida encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `Não encontramos partidas para "${searchTerm}"`
                    : 'Não há partidas disponíveis com os filtros selecionados'
                  }
                </p>
                {(searchTerm || (statusFilter as FilterStatus) !== 'all' || gameFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setGameFilter('all')
                    }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Estado de loading */}
      {isLoading && matches.length === 0 && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando partidas...</p>
        </div>
      )}
    </div>
  )
}