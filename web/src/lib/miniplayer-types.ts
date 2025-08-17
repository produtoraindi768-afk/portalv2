// Tipos para o Miniplayer Flutuante

export type DockedCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface Position {
  x: number
  y: number
}

export interface MiniplPlayerSize {
  width: number
  height: number
}

export interface MiniplPlayerState {
  // Posição e layout
  position: Position
  size: MiniplPlayerSize
  isDragging: boolean
  isMinimized: boolean
  isHovering: boolean
  dockedCorner?: DockedCorner

  // Stream atual
  currentStreamIndex: number
  currentStreamId?: string

  // Controles de mídia
  isMuted: boolean
  volume: number // 0-100
  
  // Visibilidade
  isVisible: boolean
}

export interface StreamerForMiniplayer {
  id: string
  name: string
  platform: string
  streamUrl: string
  avatarUrl: string
  category: string
  isOnline: boolean
  isFeatured: boolean
  twitchChannel?: string // Extraído da streamUrl
  createdAt: string
  lastStatusUpdate: string
}

export interface MiniplPlayerConfig {
  // Tamanhos
  defaultSize: MiniplPlayerSize
  minimizedSize: MiniplPlayerSize
  aspectRatio: number // 16:9 = 1.777...

  // Comportamento
  snapToCorners: boolean
  margin: number // Margem das bordas da tela
  autoHide: boolean
  autoHideDelay: number

  // Twitch
  twitchParentDomains: string[]
}

export interface MiniplPlayerLocalStorage {
  position: Position
  isMinimized: boolean
  isMuted: boolean
  volume: number
  currentStreamId?: string
  dockedCorner?: DockedCorner
}

export interface DragState {
  isDragging: boolean
  startPosition: Position
  currentPosition: Position
  offset: Position
}

export interface SnapZone {
  corner: DockedCorner
  bounds: {
    top: number
    left: number
    right: number
    bottom: number
  }
}

// Constantes para configuração
export const MINIPLAYER_CONFIG: MiniplPlayerConfig = {
  defaultSize: { width: 480, height: 270 }, // 16:9
  minimizedSize: { width: 300, height: 40 }, // Ajustado para formato de pílula perfeito
  aspectRatio: 16 / 9,
  snapToCorners: true,
  margin: 16,
  autoHide: false,
  autoHideDelay: 3000,
  twitchParentDomains: ['localhost', 'your-domain.com'] // Configurar conforme necessário
}

export const STORAGE_KEYS = {
  MINIPLAYER_STATE: 'miniplayer-state',
  MINIPLAYER_VERSION: '1.0.0'
} as const

// Utility types
export type MiniplPlayerAction = 
  | { type: 'SET_POSITION'; payload: Position }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_MINIMIZED'; payload: boolean }
  | { type: 'SET_HOVERING'; payload: boolean }
  | { type: 'SET_STREAM'; payload: { index: number; streamId: string } }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_VISIBLE'; payload: boolean }
  | { type: 'SET_DOCKED_CORNER'; payload: DockedCorner | undefined }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<MiniplPlayerState> }

// Hook types
export interface UseMiniplPlayerReturn {
  state: MiniplPlayerState
  streamers: StreamerForMiniplayer[]
  loading: boolean
  error: string | null
  
  // Actions
  setPosition: (position: Position) => void
  setDragging: (isDragging: boolean) => void
  setMinimized: (isMinimized: boolean) => void
  setHovering: (isHovering: boolean) => void
  setCurrentStream: (index: number) => void
  setMuted: (isMuted: boolean) => void
  setVolume: (volume: number) => void
  setVisible: (isVisible: boolean) => void
  snapToCorner: (corner: DockedCorner) => void
  
  // Utilities  
  getCurrentStreamer: () => StreamerForMiniplayer | undefined
  getTwitchEmbedUrl: () => string | null
  canPlayStream: () => boolean
  getSnapZones: () => SnapZone[]
  resetToDefaults: () => void
}

// Props types
export interface MiniplPlayerProps {
  className?: string
  onClose?: () => void
  onOpenTwitch?: (streamUrl: string) => void
  selectedStreamer?: StreamerForMiniplayer | null
}

export interface StreamSwitcherProps {
  streamers: StreamerForMiniplayer[]
  currentIndex: number
  onStreamChange: (index: number) => void
  className?: string
  isMinimized?: boolean
}

export interface PlayerControlsProps {
  isMinimized: boolean
  isMuted: boolean
  volume: number
  canShowVolumeSlider: boolean
  onMinimizeToggle: () => void
  onMuteToggle: () => void
  onVolumeChange: (volume: number) => void
  onClose: () => void
  onOpenTwitch: () => void
  className?: string
}