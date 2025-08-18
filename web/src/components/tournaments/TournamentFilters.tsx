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
    color: 'bg-muted/50 text-muted-foreground border-muted',
    icon: '📋'
  },
  { 
    value: 'upcoming', 
    label: 'Próximos', 
    color: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    icon: '📅'
  },
  { 
    value: 'ongoing', 
    label: 'Em Andamento', 
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: '🔴'
  },
  { 
    value: 'finished', 
    label: 'Finalizados', 
    color: 'bg-muted text-muted-foreground border-muted',
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
          <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {Object.values(filters).filter(v => v !== 'all' && v !== '').length} ativo{Object.values(filters).filter(v => v !== 'all' && v !== '').length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Filter className="w-4 h-4 mr-2" />
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-6">
            {/* Barra de pesquisa */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Buscar torneios</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome do torneio, jogo ou descrição..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Filtros de status */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Status do torneio</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.status === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange({ status: option.value as any })}
                    className={`${
                      filters.status === option.value 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros de jogo */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Jogo</label>
              <Select value={filters.game} onValueChange={(value) => handleFilterChange({ game: value })}>
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Selecione um jogo" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  {gameOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-foreground">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de formato */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Formato</label>
              <div className="flex flex-wrap gap-2">
                {formatOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.format === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange({ format: option.value as any })}
                    className={`${
                      filters.format === option.value 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros ativos (chips) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge 
              variant="outline" 
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange({ status: 'all' })}
                className="ml-2 hover:text-primary/80"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.game !== 'all' && (
            <Badge 
              variant="outline" 
              className="bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20"
            >
              Jogo: {gameOptions.find(g => g.value === filters.game)?.label}
              <button
                onClick={() => handleFilterChange({ game: 'all' })}
                className="ml-2 hover:text-chart-2/80"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.format !== 'all' && (
            <Badge 
              variant="outline" 
              className="bg-chart-3/10 text-chart-3 border-chart-3/20 hover:bg-chart-3/20"
            >
              Formato: {formatOptions.find(f => f.value === filters.format)?.label}
              <button
                onClick={() => handleFilterChange({ format: 'all' })}
                className="ml-2 hover:text-chart-3/80"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.search && (
            <Badge 
              variant="outline" 
              className="bg-chart-4/10 text-chart-4 border-chart-4/20 hover:bg-chart-4/20"
            >
              Busca: "{filters.search}"
              <button
                onClick={() => handleFilterChange({ search: '' })}
                className="ml-2 hover:text-chart-4/80"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
