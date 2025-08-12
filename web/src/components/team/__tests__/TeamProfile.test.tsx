import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TeamProfile } from '../TeamProfile'
import { firestoreHelpers } from '@/lib/firestore-helpers'

// Mock Next.js useParams
const mockUseParams = jest.fn()
jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  notFound: jest.fn()
}))

// Mock Firebase helpers
jest.mock('@/lib/firestore-helpers', () => ({
  firestoreHelpers: {
    getTeamByTag: jest.fn(),
    getTeamStats: jest.fn(),
    getTeamMatches: jest.fn(),
    getTeamMembers: jest.fn()
  }
}))

const mockFirestoreHelpers = firestoreHelpers as jest.Mocked<typeof firestoreHelpers>

// Mock data
const mockTeamData = {
  id: 'team1',
  name: 'Team Alpha',
  tag: 'ALPHA',
  game: 'Fortnite Ballistic',
  region: 'Brasil',
  description: 'Equipe competitiva de Fortnite Ballistic',
  members: ['player1', 'player2', 'player3'],
  captain: 'player1',
  contactEmail: 'contact@teamalpha.com',
  discordServer: 'https://discord.gg/teamalpha',
  avatar: 'https://example.com/team-avatar.jpg',
  isActive: true,
  foundedDate: '2024-01-15T00:00:00.000Z',
  achievements: ['Campeão Regional 2024', 'Top 3 Nacional']
}

const mockTeamStats = {
  totalMatches: 25,
  wins: 18,
  losses: 7,
  winRate: 72,
  averagePlacement: 2.5,
  totalPrizeWon: 15000,
  currentRank: 3
}

const mockTeamMatches = [
  {
    id: 'match1',
    tournamentName: 'Copa Brasil 2024',
    date: '2024-12-01T00:00:00.000Z',
    opponent: 'Team Beta',
    result: 'win' as const,
    score: '3-1',
    placement: 1
  },
  {
    id: 'match2',
    tournamentName: 'Torneio Regional',
    date: '2024-11-15T00:00:00.000Z',
    opponent: 'Team Gamma',
    result: 'loss' as const,
    score: '1-2',
    placement: 3
  }
]

const mockTeamMembers = [
  {
    id: 'player1',
    username: 'captain_alpha',
    displayName: 'Captain Alpha',
    role: 'Captain' as const,
    position: 'IGL',
    joinDate: '2024-01-15T00:00:00.000Z',
    isActive: true,
    avatar: 'https://example.com/captain-avatar.jpg'
  },
  {
    id: 'player2',
    username: 'player_beta',
    displayName: 'Player Beta',
    role: 'Member' as const,
    position: 'Fragger',
    joinDate: '2024-02-01T00:00:00.000Z',
    isActive: true,
    avatar: 'https://example.com/player-avatar.jpg'
  },
  {
    id: 'player3',
    username: 'player_gamma',
    displayName: 'Player Gamma',
    role: 'Member' as const,
    position: 'Support',
    joinDate: '2024-02-15T00:00:00.000Z',
    isActive: true
  }
]

describe('TeamProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful responses by default
    mockFirestoreHelpers.getTeamByTag.mockResolvedValue({
      docs: [{
        id: 'team1',
        data: () => mockTeamData
      }]
    } as any)

    mockFirestoreHelpers.getTeamStats.mockResolvedValue(mockTeamStats)
    
    mockFirestoreHelpers.getTeamMatches.mockResolvedValue({
      docs: mockTeamMatches.map(match => ({
        id: match.id,
        data: () => match
      }))
    } as any)

    mockFirestoreHelpers.getTeamMembers.mockResolvedValue({
      docs: mockTeamMembers.map(member => ({
        id: member.id,
        data: () => member
      }))
    } as any)

    mockUseParams.mockReturnValue({ teamTag: 'ALPHA' })
  })

  it('should render loading state initially', () => {
    render(<TeamProfile />)
    expect(screen.getByText('Carregando equipe...')).toBeInTheDocument()
  })

  it('should display team information after loading', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('ALPHA')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Brasil')).toBeInTheDocument()
    expect(screen.getByText('Equipe competitiva de Fortnite Ballistic')).toBeInTheDocument()
  })

  it('should display team statistics', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('25')).toBeInTheDocument() // Total matches
    expect(screen.getByText('18')).toBeInTheDocument() // Wins
    expect(screen.getByText('72%')).toBeInTheDocument() // Win rate
    expect(screen.getByText('#3')).toBeInTheDocument() // Ranking
  })

  it('should display team achievements', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('Campeão Regional 2024')).toBeInTheDocument()
    expect(screen.getByText('Top 3 Nacional')).toBeInTheDocument()
  })

  it('should display contact links', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    const discordLink = screen.getByRole('link', { name: /discord/i })
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/teamalpha')

    const emailLink = screen.getByRole('link', { name: /email/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@teamalpha.com')
  })

  it('should display founded date', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText(/Fundada em 15 de janeiro de 2024/)).toBeInTheDocument()
  })

  it('should switch between tabs', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    // Click on Members tab
    fireEvent.click(screen.getByRole('tab', { name: 'Membros' }))
    
    await waitFor(() => {
      expect(screen.getByText('Lista de Membros')).toBeInTheDocument()
    })

    // Click on Matches tab
    fireEvent.click(screen.getByRole('tab', { name: 'Partidas' }))
    
    await waitFor(() => {
      expect(screen.getByText('Histórico de Partidas')).toBeInTheDocument()
    })

    // Click on Statistics tab
    fireEvent.click(screen.getByRole('tab', { name: 'Estatísticas' }))
    
    await waitFor(() => {
      expect(screen.getByText('Desempenho Detalhado')).toBeInTheDocument()
    })
  })

  it('should display team members in table format', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    // Switch to members tab
    fireEvent.click(screen.getByRole('tab', { name: 'Membros' }))

    await waitFor(() => {
      expect(screen.getByText('Captain Alpha')).toBeInTheDocument()
      expect(screen.getByText('@captain_alpha')).toBeInTheDocument()
      expect(screen.getByText('Capitão')).toBeInTheDocument()
      expect(screen.getByText('IGL')).toBeInTheDocument()
      
      expect(screen.getByText('Player Beta')).toBeInTheDocument()
      expect(screen.getByText('@player_beta')).toBeInTheDocument()
      expect(screen.getByText('Fragger')).toBeInTheDocument()

      expect(screen.getByText('Player Gamma')).toBeInTheDocument()
      expect(screen.getByText('@player_gamma')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
    })
  })

  it('should display team matches', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    // Switch to matches tab
    fireEvent.click(screen.getByRole('tab', { name: 'Partidas' }))

    await waitFor(() => {
      expect(screen.getByText('Copa Brasil 2024')).toBeInTheDocument()
      expect(screen.getByText('Team Beta')).toBeInTheDocument()
      expect(screen.getByText('3-1')).toBeInTheDocument()
      expect(screen.getByText('Vitória')).toBeInTheDocument()

      expect(screen.getByText('Torneio Regional')).toBeInTheDocument()
      expect(screen.getByText('Team Gamma')).toBeInTheDocument()
      expect(screen.getByText('1-2')).toBeInTheDocument()
      expect(screen.getByText('Derrota')).toBeInTheDocument()
    })
  })

  it('should display detailed statistics', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    // Switch to statistics tab
    fireEvent.click(screen.getByRole('tab', { name: 'Estatísticas' }))

    await waitFor(() => {
      expect(screen.getByText('Desempenho Detalhado')).toBeInTheDocument()
      
      // Check for detailed stats
      const totalMatches = screen.getAllByText('25')
      expect(totalMatches.length).toBeGreaterThan(0)
      
      const wins = screen.getAllByText('18')
      expect(wins.length).toBeGreaterThan(0)
      
      const losses = screen.getAllByText('7')
      expect(losses.length).toBeGreaterThan(0)
    })
  })

  it('should handle team not found error', async () => {
    mockFirestoreHelpers.getTeamByTag.mockResolvedValue({
      docs: []
    } as any)

    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Equipe não encontrada')).toBeInTheDocument()
      expect(screen.getByText('A equipe solicitada não existe ou foi removida.')).toBeInTheDocument()
    })
  })

  it('should handle loading error', async () => {
    mockFirestoreHelpers.getTeamByTag.mockRejectedValue(new Error('Firebase error'))

    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Equipe não encontrada')).toBeInTheDocument()
    })
  })

  it('should handle empty achievements', async () => {
    const teamWithNoAchievements = {
      ...mockTeamData,
      achievements: []
    }

    mockFirestoreHelpers.getTeamByTag.mockResolvedValue({
      docs: [{
        id: 'team1',
        data: () => teamWithNoAchievements
      }]
    } as any)

    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('Nenhuma conquista registrada')).toBeInTheDocument()
  })

  it('should handle empty matches', async () => {
    mockFirestoreHelpers.getTeamMatches.mockResolvedValue({
      docs: []
    } as any)

    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('Nenhuma partida registrada')).toBeInTheDocument()
    
    // Switch to matches tab to see empty state
    fireEvent.click(screen.getByRole('tab', { name: 'Partidas' }))
    
    await waitFor(() => {
      expect(screen.getByText('Nenhuma partida encontrada')).toBeInTheDocument()
    })
  })

  it('should handle empty members', async () => {
    mockFirestoreHelpers.getTeamMembers.mockResolvedValue({
      docs: []
    } as any)

    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    // Switch to members tab
    fireEvent.click(screen.getByRole('tab', { name: 'Membros' }))
    
    await waitFor(() => {
      expect(screen.getByText('Nenhum membro encontrado')).toBeInTheDocument()
    })
  })

  it('should use prop teamTag when provided', async () => {
    render(<TeamProfile teamTag="BETA" />)

    await waitFor(() => {
      expect(mockFirestoreHelpers.getTeamByTag).toHaveBeenCalledWith('BETA')
    })
  })

  it('should format currency correctly', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument()
  })

  it('should format dates correctly', async () => {
    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    // Switch to members tab to see formatted join dates
    fireEvent.click(screen.getByRole('tab', { name: 'Membros' }))
    
    await waitFor(() => {
      expect(screen.getByText(/15 de janeiro de 2024/)).toBeInTheDocument()
      expect(screen.getByText(/1 de fevereiro de 2024/)).toBeInTheDocument()
    })
  })

  it('should display inactive team correctly', async () => {
    const inactiveTeam = {
      ...mockTeamData,
      isActive: false
    }

    mockFirestoreHelpers.getTeamByTag.mockResolvedValue({
      docs: [{
        id: 'team1',
        data: () => inactiveTeam
      }]
    } as any)

    render(<TeamProfile />)

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    })

    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })
})