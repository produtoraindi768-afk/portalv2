import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FloatingMiniplayer } from '../FloatingMiniplayer'

// Mock do hook useMiniplayer
const mockUseMiniplayer: any = {
  state: {
    isVisible: true,
    position: { x: 100, y: 100 },
    size: { width: 480, height: 270 },
    isDragging: false,
    isMinimized: false,
    isHovering: false,
    currentStreamIndex: 0,
    isMuted: true,
    volume: 50
  },
  streamers: [
    {
      id: '1',
      name: 'Test Streamer',
      platform: 'twitch',
      streamUrl: 'https://twitch.tv/teststreamer',
      avatarUrl: 'https://example.com/avatar.jpg',
      category: 'Gaming',
      isOnline: true,
      isFeatured: true,
      twitchChannel: 'teststreamer',
      createdAt: '2023-01-01',
      lastStatusUpdate: '2023-01-01'
    }
  ],
  loading: false,
  setPosition: jest.fn(),
  setDragging: jest.fn(),
  setMinimized: jest.fn(),
  setHovering: jest.fn(),
  setVisible: jest.fn(),
  setCurrentStream: jest.fn(),
  setMuted: jest.fn(),
  setVolume: jest.fn(),
  getCurrentStreamer: jest.fn((): any => mockUseMiniplayer.streamers[0]),
  getTwitchEmbedUrl: jest.fn(() => 'https://player.twitch.tv/?channel=teststreamer&autoplay=true&muted=true&controls=false&parent=localhost'),
  canPlayStream: jest.fn(() => true)
}

jest.mock('@/hooks/use-miniplayer', () => ({
  useMiniplayer: () => mockUseMiniplayer
}))

// Mock do contexto do Provider
jest.mock('@/components/miniplayer/MiniplPlayerProvider', () => ({
  useMiniplPlayerContext: () => ({
    isVisible: mockUseMiniplayer.state.isVisible,
    showMiniplayer: jest.fn(),
    hideMiniplayer: jest.fn(),
    toggleMiniplayer: jest.fn(),
    streamers: mockUseMiniplayer.streamers,
    selectedStreamer: mockUseMiniplayer.streamers[0],
    switchStreamer: jest.fn(),
    loading: false
  })
}))

// Mock do hook mobile
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}))

// Mock do createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (element: React.ReactNode) => element
}))

describe('FloatingMiniplayer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock do document.body
    document.body.innerHTML = ''
    
    // Mock do window para drag & drop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    })
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080
    })
  })

  it('deve renderizar quando visível', () => {
    render(<FloatingMiniplayer />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/Miniplayer: Test Streamer/)).toBeInTheDocument()
  })

  it('não deve renderizar quando invisível', () => {
    mockUseMiniplayer.state.isVisible = false
    
    render(<FloatingMiniplayer />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('deve renderizar iframe do Twitch para streams online', () => {
    render(<FloatingMiniplayer />)

    const iframe = screen.getByTitle('Test Streamer - Twitch Stream')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', expect.stringContaining('player.twitch.tv'))
  })

  it('deve chamar onClose quando botão fechar for clicado', async () => {
    const onClose = jest.fn()
    render(<FloatingMiniplayer onClose={onClose} />)

    // Simular hover para mostrar controles
    const dialog = screen.getByRole('dialog')
    fireEvent.mouseEnter(dialog)

    // Encontrar e clicar no botão de fechar (pode estar no dropdown)
    const closeButton = screen.getByRole('button', { name: /mais opções/i })
    fireEvent.click(closeButton)

    // Aguardar o dropdown aparecer e clicar em fechar
    await waitFor(() => {
      const closeMenuItem = screen.getByText(/fechar miniplayer/i)
      fireEvent.click(closeMenuItem)
    })

    expect(mockUseMiniplayer.setVisible).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalled()
  })

  it('deve permitir arrastar o miniplayer', () => {
    render(<FloatingMiniplayer />)

    const header = screen.getByRole('dialog').querySelector('[data-slot="card-header"]')
    expect(header).toBeInTheDocument()

    if (header) {
      fireEvent.mouseDown(header, { clientX: 100, clientY: 100 })
      expect(mockUseMiniplayer.setDragging).toHaveBeenCalledWith(true)
    }
  })

  it('deve alternar estado de minimizado', async () => {
    render(<FloatingMiniplayer />)

    // Simular hover para mostrar controles
    const dialog = screen.getByRole('dialog')
    fireEvent.mouseEnter(dialog)

    // Clicar no menu de opções
    const moreButton = screen.getByRole('button', { name: /mais opções/i })
    fireEvent.click(moreButton)

    // Clicar em minimizar
    await waitFor(() => {
      const minimizeButton = screen.getByText(/minimizar/i)
      fireEvent.click(minimizeButton)
    })

    expect(mockUseMiniplayer.setMinimized).toHaveBeenCalledWith(true)
  })

  it('deve controlar mudo/desmudo', async () => {
    render(<FloatingMiniplayer />)

    // Simular hover para mostrar controles
    const dialog = screen.getByRole('dialog')
    fireEvent.mouseEnter(dialog)

    // Clicar no botão de volume
    const volumeButton = screen.getByRole('button', { name: /ativar som|silenciar/i })
    fireEvent.click(volumeButton)

    expect(mockUseMiniplayer.setMuted).toHaveBeenCalledWith(false)
  })

  it('deve abrir Twitch em nova aba', async () => {
    const onOpenTwitch = jest.fn()
    
    // Mock do window.open
    const mockOpen = jest.fn()
    window.open = mockOpen

    render(<FloatingMiniplayer onOpenTwitch={onOpenTwitch} />)

    // Simular hover
    const dialog = screen.getByRole('dialog')
    fireEvent.mouseEnter(dialog)

    // Clicar no menu de opções
    const moreButton = screen.getByRole('button', { name: /mais opções/i })
    fireEvent.click(moreButton)

    // Clicar em abrir no Twitch
    await waitFor(() => {
      const twitchButton = screen.getByText(/abrir no twitch/i)
      fireEvent.click(twitchButton)
    })

    expect(mockOpen).toHaveBeenCalledWith(
      'https://www.twitch.tv/teststreamer',
      '_blank',
      'noopener,noreferrer'
    )
    expect(onOpenTwitch).toHaveBeenCalledWith('https://twitch.tv/teststreamer')
  })

  it('deve mostrar placeholder quando stream está offline', () => {
    // Alterar estado para offline
    mockUseMiniplayer.streamers[0].isOnline = false
    mockUseMiniplayer.getTwitchEmbedUrl.mockReturnValue(null)
    mockUseMiniplayer.canPlayStream.mockReturnValue(false)

    render(<FloatingMiniplayer />)

    expect(screen.getAllByText('Test Streamer').length).toBeGreaterThan(0)
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('deve fechar com tecla Escape', () => {
    const onClose = jest.fn()
    render(<FloatingMiniplayer onClose={onClose} />)

    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(mockUseMiniplayer.setVisible).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalled()
  })

  it('deve atualizar estado de hover', () => {
    render(<FloatingMiniplayer />)

    const dialog = screen.getByRole('dialog')
    
    fireEvent.mouseEnter(dialog)
    expect(mockUseMiniplayer.setHovering).toHaveBeenCalledWith(true)

    fireEvent.mouseLeave(dialog)
    expect(mockUseMiniplayer.setHovering).toHaveBeenCalledWith(false)
  })

  it('deve ter atributos de acessibilidade corretos', () => {
    render(<FloatingMiniplayer />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Miniplayer: Test Streamer')
    expect(dialog).toHaveAttribute('aria-modal', 'false')
    expect(dialog).toHaveAttribute('tabIndex', '-1')
  })
})

// Mock adicional para resetar estado entre testes
afterEach(() => {
  mockUseMiniplayer.state.isVisible = true
  mockUseMiniplayer.streamers[0].isOnline = true
  mockUseMiniplayer.getTwitchEmbedUrl.mockReturnValue(
    'https://player.twitch.tv/?channel=teststreamer&autoplay=true&muted=true&controls=false&parent=localhost'
  )
  mockUseMiniplayer.canPlayStream.mockReturnValue(true)
})