import { renderHook, act } from '@testing-library/react'
import { useMiniplayer } from '../use-miniplayer'

// Mock do hook mobile
jest.mock('../use-mobile', () => ({
  useIsMobile: () => false
}))

// Mock do Firestore
jest.mock('@/lib/safeFirestore', () => ({
  getClientFirestore: () => null
}))

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock do window
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

describe('useMiniplayer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useMiniplayer())

    expect(result.current.state.isVisible).toBe(false)
    expect(result.current.state.isMinimized).toBe(false)
    expect(result.current.state.isDragging).toBe(false)
    expect(result.current.state.isMuted).toBe(true)
    expect(result.current.state.volume).toBe(50)
    expect(result.current.state.currentStreamIndex).toBe(0)
  })

  it('deve alterar posição corretamente', () => {
    const { result } = renderHook(() => useMiniplayer())
    const newPosition = { x: 100, y: 200 }

    act(() => {
      result.current.setPosition(newPosition)
    })

    expect(result.current.state.position).toEqual(newPosition)
  })

  it('deve alternar estado de minimizado', () => {
    const { result } = renderHook(() => useMiniplayer())

    act(() => {
      result.current.setMinimized(true)
    })

    expect(result.current.state.isMinimized).toBe(true)
    expect(result.current.state.size.width).toBe(320) // tamanho minimizado

    act(() => {
      result.current.setMinimized(false)
    })

    expect(result.current.state.isMinimized).toBe(false)
    expect(result.current.state.size.width).toBe(480) // tamanho padrão
  })

  it('deve controlar estado de arrastar', () => {
    const { result } = renderHook(() => useMiniplayer())

    act(() => {
      result.current.setDragging(true)
    })

    expect(result.current.state.isDragging).toBe(true)

    act(() => {
      result.current.setDragging(false)
    })

    expect(result.current.state.isDragging).toBe(false)
  })

  it('deve controlar estado de hover', () => {
    const { result } = renderHook(() => useMiniplayer())

    act(() => {
      result.current.setHovering(true)
    })

    expect(result.current.state.isHovering).toBe(true)
  })

  it('deve alterar volume dentro dos limites', () => {
    const { result } = renderHook(() => useMiniplayer())

    act(() => {
      result.current.setVolume(75)
    })

    expect(result.current.state.volume).toBe(75)

    // Teste de limite superior
    act(() => {
      result.current.setVolume(150)
    })

    expect(result.current.state.volume).toBe(100)

    // Teste de limite inferior
    act(() => {
      result.current.setVolume(-10)
    })

    expect(result.current.state.volume).toBe(0)
  })

  it('deve controlar estado de mudo', () => {
    const { result } = renderHook(() => useMiniplayer())

    act(() => {
      result.current.setMuted(false)
    })

    expect(result.current.state.isMuted).toBe(false)

    act(() => {
      result.current.setMuted(true)
    })

    expect(result.current.state.isMuted).toBe(true)
  })

  it('deve controlar visibilidade', () => {
    const { result } = renderHook(() => useMiniplayer())

    act(() => {
      result.current.setVisible(true)
    })

    expect(result.current.state.isVisible).toBe(true)
  })

  it('deve calcular snap para corner mais próximo', () => {
    const { result } = renderHook(() => useMiniplayer())

    const snapZones = result.current.getSnapZones()
    expect(snapZones).toHaveLength(4)
    expect(snapZones[0].corner).toBe('top-left')
    expect(snapZones[1].corner).toBe('top-right')
    expect(snapZones[2].corner).toBe('bottom-left')
    expect(snapZones[3].corner).toBe('bottom-right')
  })

  it('deve fazer snap para corner específico', () => {
    const { result } = renderHook(() => useMiniplayer())

    act(() => {
      result.current.snapToCorner('top-right')
    })

    // Verificar se a posição foi ajustada para o canto superior direito
    const expectedX = 1920 - 480 - 16 // window.innerWidth - width - margin
    const expectedY = 16 // margin
    
    expect(result.current.state.position.x).toBe(expectedX)
    expect(result.current.state.position.y).toBe(expectedY)
    expect(result.current.state.dockedCorner).toBe('top-right')
  })

  it('deve resetar para estado padrão', () => {
    const { result } = renderHook(() => useMiniplayer())

    // Alterar alguns valores
    act(() => {
      result.current.setVisible(true)
      result.current.setMinimized(true)
      result.current.setMuted(false)
    })

    // Resetar
    act(() => {
      result.current.resetToDefaults()
    })

    expect(result.current.state.isVisible).toBe(false)
    expect(result.current.state.isMinimized).toBe(false)
    expect(result.current.state.isMuted).toBe(true)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('miniplayer-state')
  })

  it('deve retornar URL do Twitch corretamente quando não há streamer', () => {
    const { result } = renderHook(() => useMiniplayer())

    const embedUrl = result.current.getTwitchEmbedUrl()
    expect(embedUrl).toBeNull()
  })

  it('deve validar se pode reproduzir stream', () => {
    const { result } = renderHook(() => useMiniplayer())

    const canPlay = result.current.canPlayStream()
    expect(canPlay).toBe(false) // Não há streamers carregados
  })

  it('deve carregar estado do localStorage', () => {
    const savedState = {
      position: { x: 300, y: 400 },
      isMinimized: true,
      isMuted: false,
      volume: 80
    }
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState))

    const { result } = renderHook(() => useMiniplayer())

    // O estado deve ser carregado no useEffect
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('miniplayer-state')
  })
})