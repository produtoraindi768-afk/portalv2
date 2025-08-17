'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X, Trophy, Calendar, MapPin, SlidersHorizontal } from 'lucide-react'

interface TournamentFiltersProps {
  onFilterChange?: (filters: TournamentFilters) => void
}

export interface TournamentFilters {
  status: 'all' | 'upcoming' | 'ongoing' | 'finished'
  game: string
  format: 'all' | 'online' | 'lan'
  search: string
}

const gameOptions = [
  { value: 'all', label: 'Todos os Jogos' },
  { value: 'cs2', label: 'Counter-Strike 2' },
  { value: 'valorant', label: 'Valorant' },
  { value: 'league-of-legends', label: 'League of Legends' },
  { value: 'fortnite', label: 'Fortnite' },
  { value: 'dota', label: 'Dota 2' }
]

const statusOptions = [
  { 
    value: 'all', 
    label: 'Todos os Status', 
    color: 'bg-muted/50 text-muted-foreground',
    icon: '📋'
  },
  { 
    value: 'upcoming', 
    label: 'Próximos', 
    color: 'bg-chart-2/10 text-chart-2',
    icon: '📅'
  },
  { 
    value: 'ongoing', 
    label: 'Em Andamento', 
    color: 'bg-destructive/10 text-destructive',
    icon: '🔴'
  },
  { 
    value: 'finished', 
    label: 'Finalizados', 
    color: 'bg-muted text-muted-foreground',
    icon: '🏁'
  }
]

const formatOptions = [
  { value: 'all', label: 'Todos os Formatos', icon: '🌐' },
  { value: 'online', label: 'Online', icon: '💻' },
  { value: 'lan', label: 'LAN', icon: '🏢' }
]

export function TournamentFilters({ onFilterChange }: TournamentFiltersProps) {
  const [filters, setFilters] = useState<TournamentFilters>({
    status: 'all',
    game: 'all',
    format: 'all',
    search: ''
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (newFilters: Partial<TournamentFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange?.(updatedFilters)
  }

  const clearFilters = () => {
    const resetFilters = { status: 'all', game: 'all', format: 'all', search: '' } as TournamentFilters
    setFilters(resetFilters)
    onFilterChange?.(resetFilters)
    setIsExpanded(false)
  }

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.game !== 'all' || 
                          filters.format !== 'all' || 
                          filters.search.length > 0

  return (
    <div className="mb-12 space-y-6">
      {/* Header dos filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Filtros</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {[filters.status !== 'all', filters.game !== 'all', filters.format !== 'all', filters.search].filter(Boolean).length} ativo(s)
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground"
        >
          <Filter className="w-4 h-4 mr-2" />
          {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
        </Button>
      </div>

      <Card className={`transition-all duration-300 ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}>
        <CardContent className="p-6 space-y-6">
          {/* Barra de pesquisa principal */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nome do torneio, descrição..."
              className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => handleFilterChange({ search: '' })}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filtros rápidos de status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.status === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange({ status: option.value as any })}
                  className="h-9 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Divisor */}
          {isExpanded && <Separator />}

          {/* Filtros avançados (mostrar quando expandido) */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filtro por jogo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Jogo:</span>
                </div>
                <Select
                  value={filters.game}
                  onValueChange={(value) => handleFilterChange({ game: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione um jogo" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameOptions.map((game) => (
                      <SelectItem key={game.value} value={game.value}>
                        {game.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por formato */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Formato:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formatOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={filters.format === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange({ format: option.value as any })}
                      className="h-9 rounded-full"
                    >
                      <span className="mr-1">{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filtros ativos e ações */}
          {hasActiveFilters && (
            <>
              <Separator />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                  </div>
                  
                  {filters.status !== 'all' && (
                    <Badge variant="secondary" className="text-xs rounded-full">
                      {statusOptions.find(s => s.value === filters.status)?.icon} {statusOptions.find(s => s.value === filters.status)?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleFilterChange({ status: 'all' })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.game !== 'all' && (
                    <Badge variant="secondary" className="text-xs rounded-full">
                      🎮 {gameOptions.find(g => g.value === filters.game)?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleFilterChange({ game: 'all' })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.format !== 'all' && (
                    <Badge variant="secondary" className="text-xs rounded-full">
                      {formatOptions.find(f => f.value === filters.format)?.icon} {formatOptions.find(f => f.value === filters.format)?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleFilterChange({ format: 'all' })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  
                  {filters.search && (
                    <Badge variant="secondary" className="text-xs rounded-full">
                      🔍 "{filters.search}"
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleFilterChange({ search: '' })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 rounded-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Todos
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
