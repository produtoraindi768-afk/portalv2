import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlayerProfile } from '../PlayerProfile'
import { firestoreHelpers } from '@/lib/firestore-helpers'
import '@testing-library/jest-dom'

// Mock do firestoreHelpers
jest.mock('@/lib/firestore-helpers', () => ({
  firestoreHelpers: {
    getPlayerByUsername: jest.fn(),
    getPlayerMatches: jest.fn(),
    getPlayerTeams: jest.fn(),
    getPlayerStats: jest.fn(),
  }
}))

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useParams: () => ({
    username: 'test-player'
  })
}))

const mockPlayerData = {
  id: 'player-123',
  username: 'test-player',
  displayName: 'Test Player',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Competitive Fortnite player',
  country: 'BR',
  joinDate: '2024-01-15',
  isVerified: true,
  socialLinks: {
    twitch: 'https://twitch.tv/testplayer',
    youtube: 'https://youtube.com/@testplayer',
    twitter: 'https://twitter.com/testplayer'
  }
}

const mockPlayerStats = {
  totalMatches: 150,
  wins: 45,
  winRate: 30,
  killDeathRatio: 1.85,
  averagePlacement: 8.5,
  totalKills: 3420,
  totalDeaths: 1850
}

const mockPlayerMatches = [
  {
    id: 'match-1',
    tournamentName: 'Ballistic Cup #1',
    date: '2024-08-10',
    placement: 3,
    kills: 8,
    result: 'win'
  },
  {
    id: 'match-2',
    tournamentName: 'Pro Series',
    date: '2024-08-08',
    placement: 12,
    kills: 5,
    result: 'loss'
  }
]

const mockPlayerTeams = [
  {
    id: 'team-1',
    name: 'Alpha Esports',
    tag: 'ALPHA',
    role: 'Captain',
    joinDate: '2024-01-20',
    isActive: true
  }
]

describe('PlayerProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (firestoreHelpers.getPlayerByUsername as jest.Mock).mockResolvedValue({ 
      exists: true, 
      data: () => mockPlayerData 
    });
    (firestoreHelpers.getPlayerStats as jest.Mock).mockResolvedValue(mockPlayerStats);
    (firestoreHelpers.getPlayerMatches as jest.Mock).mockResolvedValue({
      docs: mockPlayerMatches.map(match => ({ 
        id: match.id, 
        data: () => match 
      }))
    });
    (firestoreHelpers.getPlayerTeams as jest.Mock).mockResolvedValue({
      docs: mockPlayerTeams.map(team => ({ 
        id: team.id, 
        data: () => team 
      }))
    })
  })

  describe('Profile Header', () => {
    it('deve renderizar header do perfil com Blookie avatar', async () => {
      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument()
        expect(screen.getByText('@test-player')).toBeInTheDocument()
        expect(screen.getByText('Competitive Fortnite player')).toBeInTheDocument()
      })

      // Verificar avatar
      const avatar = screen.getByRole('img', { name: /test player/i })
      expect(avatar).toBeInTheDocument()

      // Verificar badge de verificado
      expect(screen.getByText('Verificado')).toBeInTheDocument()

      // Verificar país
      expect(screen.getByText('BR')).toBeInTheDocument()
    })

    it('deve exibir links sociais', async () => {
      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByLabelText('Twitch')).toBeInTheDocument()
        expect(screen.getByLabelText('YouTube')).toBeInTheDocument()
        expect(screen.getByLabelText('Twitter')).toBeInTheDocument()
      })
    })

    it('deve exibir data de cadastro formatada', async () => {
      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByText(/Membro desde 15 de janeiro de 2024/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Tabs', () => {
    it('deve renderizar todas as abas de navegação', async () => {
      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByText('Visão Geral')).toBeInTheDocument()
        expect(screen.getByText('Estatísticas')).toBeInTheDocument()
        expect(screen.getByText('Partidas')).toBeInTheDocument()
        expect(screen.getByText('Equipes')).toBeInTheDocument()
      })
    })

    it('deve alternar entre abas quando clicadas', async () => {
      render(<PlayerProfile />)

      // Aba inicial deve ser Visão Geral
      await waitFor(() => {
        expect(screen.getByText('Estatísticas Gerais')).toBeInTheDocument()
      })

      // Clicar na aba Estatísticas
      fireEvent.click(screen.getByText('Estatísticas'))
      expect(screen.getByText('Desempenho Detalhado')).toBeInTheDocument()

      // Clicar na aba Partidas
      fireEvent.click(screen.getByText('Partidas'))
      expect(screen.getByText('Histórico de Partidas')).toBeInTheDocument()

      // Clicar na aba Equipes
      fireEvent.click(screen.getByText('Equipes'))
      expect(screen.getByText('Equipes Atuais e Anteriores')).toBeInTheDocument()
    })
  })

  describe('Overview Tab', () => {
    it('deve exibir estatísticas principais', async () => {
      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument() // Total matches
        expect(screen.getByText('45')).toBeInTheDocument()  // Wins
        expect(screen.getByText('30%')).toBeInTheDocument() // Win rate
        expect(screen.getByText('1.85')).toBeInTheDocument() // K/D ratio
      })
    })

    it('deve exibir partidas recentes', async () => {
      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByText('Ballistic Cup #1')).toBeInTheDocument()
        expect(screen.getByText('Pro Series')).toBeInTheDocument()
      })
    })

    it('deve exibir equipe atual', async () => {
      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByText('Alpha Esports')).toBeInTheDocument()
        expect(screen.getByText('ALPHA')).toBeInTheDocument()
        expect(screen.getByText('Captain')).toBeInTheDocument()
      })
    })
  })

  describe('Statistics Tab', () => {
    it('deve exibir estatísticas detalhadas quando aba for selecionada', async () => {
      render(<PlayerProfile />)

      fireEvent.click(screen.getByText('Estatísticas'))

      await waitFor(() => {
        expect(screen.getByText('Total de Partidas')).toBeInTheDocument()
        expect(screen.getByText('Taxa de Vitória')).toBeInTheDocument()
        expect(screen.getByText('K/D Ratio')).toBeInTheDocument()
        expect(screen.getByText('Posição Média')).toBeInTheDocument()
        expect(screen.getByText('Total de Eliminações')).toBeInTheDocument()
      })
    })

    it('deve exibir gráfico de performance', async () => {
      render(<PlayerProfile />)

      fireEvent.click(screen.getByText('Estatísticas'))

      await waitFor(() => {
        expect(screen.getByText('Gráfico de Performance')).toBeInTheDocument()
      })
    })
  })

  describe('Matches Tab', () => {
    it('deve exibir tabela de partidas quando aba for selecionada', async () => {
      render(<PlayerProfile />)

      fireEvent.click(screen.getByText('Partidas'))

      await waitFor(() => {
        expect(screen.getByText('Torneio')).toBeInTheDocument()
        expect(screen.getByText('Data')).toBeInTheDocument()
        expect(screen.getByText('Posição')).toBeInTheDocument()
        expect(screen.getByText('Eliminações')).toBeInTheDocument()
        expect(screen.getByText('Resultado')).toBeInTheDocument()
      })
    })

    it('deve exibir filtros de partidas', async () => {
      render(<PlayerProfile />)

      fireEvent.click(screen.getByText('Partidas'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Filtrar por torneio...')).toBeInTheDocument()
        expect(screen.getByText('Todas')).toBeInTheDocument() // Filter dropdown
      })
    })
  })

  describe('Teams Tab', () => {
    it('deve exibir equipes quando aba for selecionada', async () => {
      render(<PlayerProfile />)

      fireEvent.click(screen.getByText('Equipes'))

      await waitFor(() => {
        expect(screen.getByText('Equipe Atual')).toBeInTheDocument()
        expect(screen.getByText('Histórico de Equipes')).toBeInTheDocument()
      })
    })

    it('deve exibir detalhes da equipe atual', async () => {
      render(<PlayerProfile />)

      fireEvent.click(screen.getByText('Equipes'))

      await waitFor(() => {
        expect(screen.getByText('Alpha Esports')).toBeInTheDocument()
        expect(screen.getByText('ALPHA')).toBeInTheDocument()
        expect(screen.getByText('Captain')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('deve exibir erro quando jogador não for encontrado', async () => {
      (firestoreHelpers.getPlayerByUsername as jest.Mock).mockResolvedValue({ 
        exists: false 
      })

      render(<PlayerProfile />)

      await waitFor(() => {
        expect(screen.getByText('Jogador não encontrado')).toBeInTheDocument()
        expect(screen.getByText('O perfil solicitado não existe ou foi removido.')).toBeInTheDocument()
      })
    })

    it('deve exibir loading state inicial', () => {
      render(<PlayerProfile />)

      expect(screen.getByText('Carregando perfil...')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('deve adaptar layout para mobile', async () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<PlayerProfile />)

      await waitFor(() => {
        // Verificar que componente renderiza sem erros em mobile
        expect(screen.getByText('Test Player')).toBeInTheDocument()
      })
    })
  })
})