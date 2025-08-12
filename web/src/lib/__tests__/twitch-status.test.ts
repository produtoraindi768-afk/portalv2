import { TwitchStatusService } from '../twitch-status'
import { firestoreHelpers } from '../firestore-helpers'

// Mock dos helpers do Firestore
jest.mock('../firestore-helpers', () => ({
  firestoreHelpers: {
    getFeaturedStreamers: jest.fn(),
    updateStreamerOnlineStatus: jest.fn()
  }
}))

// Mock do fetch para APIs externas
global.fetch = jest.fn()

describe('Twitch Status Service', () => {
  let twitchService: TwitchStatusService
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    // Mock das variáveis de ambiente para os testes
    process.env.TWITCH_CLIENT_ID = 'test-client-id'
    process.env.TWITCH_ACCESS_TOKEN = 'test-access-token'
    
    twitchService = new TwitchStatusService()
    mockFetch.mockClear()
    ;(firestoreHelpers.getFeaturedStreamers as jest.Mock).mockClear()
    ;(firestoreHelpers.updateStreamerOnlineStatus as jest.Mock).mockClear()
  })

  afterEach(() => {
    // Limpar variáveis de ambiente após os testes
    delete process.env.TWITCH_CLIENT_ID
    delete process.env.TWITCH_ACCESS_TOKEN
  })

  describe('checkStreamerLiveStatus', () => {
    const mockStreamerData = {
      id: '123',
      name: 'TestStreamer',
      platform: 'twitch',
      streamUrl: 'https://twitch.tv/teststreamer',
      avatarUrl: 'https://example.com/avatar.jpg',
      category: 'FPS',
      isOnline: false,
      isFeatured: true,
      createdAt: new Date().toISOString(),
      lastStatusUpdate: new Date().toISOString()
    }

    it('deve verificar se um streamer está ao vivo na Twitch', async () => {
      // Arrange: Mock da resposta da API da Twitch
      const mockTwitchResponse = {
        data: [
          {
            user_login: 'teststreamer',
            type: 'live',
            viewer_count: 1000
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTwitchResponse
      } as Response)

      // Act: Verificar status do streamer
      const isLive = await twitchService.checkStreamerLiveStatus('teststreamer')

      // Assert: Verificar se está ao vivo
      expect(isLive).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('helix/streams?user_login=teststreamer'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Client-ID': expect.any(String),
            'Authorization': expect.stringContaining('Bearer ')
          })
        })
      )
    })

    it('deve retornar false quando streamer não está ao vivo', async () => {
      // Arrange: Mock da resposta vazia da API da Twitch
      const mockTwitchResponse = {
        data: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTwitchResponse
      } as Response)

      // Act: Verificar status do streamer
      const isLive = await twitchService.checkStreamerLiveStatus('offlinestreamer')

      // Assert: Verificar se não está ao vivo
      expect(isLive).toBe(false)
    })

    it('deve tratar erro da API gracefully', async () => {
      // Arrange: Mock de erro da API
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Act: Verificar status do streamer com erro
      const isLive = await twitchService.checkStreamerLiveStatus('errorstreamer')

      // Assert: Deve retornar false em caso de erro
      expect(isLive).toBe(false)
    })
  })

  describe('updateAllFeaturedStreamers', () => {
    it('deve atualizar status de todos os streamers em destaque', async () => {
      // Arrange: Mock dos streamers em destaque
      const mockStreamers = {
        docs: [
          {
            id: 'doc1',
            data: () => ({
              id: 'streamer1',
              name: 'TestStreamer1',
              platform: 'twitch',
              streamUrl: 'https://twitch.tv/teststreamer1',
              isOnline: false, // estava offline
              isFeatured: true
            })
          },
          {
            id: 'doc2',
            data: () => ({
              id: 'streamer2',
              name: 'TestStreamer2',
              platform: 'twitch',
              streamUrl: 'https://twitch.tv/teststreamer2',
              isOnline: false, // estava offline (mudança: ambos começam offline)
              isFeatured: true
            })
          }
        ]
      }

      ;(firestoreHelpers.getFeaturedStreamers as jest.Mock).mockResolvedValueOnce(mockStreamers)
      ;(firestoreHelpers.updateStreamerOnlineStatus as jest.Mock).mockResolvedValue(true)

      // Mock das respostas da Twitch para cada streamer
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [{ user_login: 'teststreamer1', type: 'live' }] })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }) // streamer2 ainda offline
        } as Response)

      // Act: Atualizar todos os streamers
      const result = await twitchService.updateAllFeaturedStreamers()

      // Assert: Verificar se todos foram processados
      expect(result.processed).toBe(2)
      expect(result.updated).toBe(1) // apenas streamer1 mudou de estado (false -> true)
      expect(firestoreHelpers.getFeaturedStreamers).toHaveBeenCalledTimes(1)
      expect(firestoreHelpers.updateStreamerOnlineStatus).toHaveBeenCalledTimes(1) // apenas 1 mudança
    })

    it('deve tratar erro ao buscar streamers do Firestore', async () => {
      // Arrange: Mock de erro no Firestore
      ;(firestoreHelpers.getFeaturedStreamers as jest.Mock).mockResolvedValueOnce(null)

      // Act: Tentar atualizar streamers
      const result = await twitchService.updateAllFeaturedStreamers()

      // Assert: Deve retornar resultado com erro
      expect(result.processed).toBe(0)
      expect(result.updated).toBe(0)
      expect(result.errors).toBe(1)
    })

    it('deve continuar processando mesmo com erro em um streamer', async () => {
      // Arrange: Mock de streamers com um que vai dar erro
      const mockStreamers = {
        docs: [
          {
            id: 'doc1',
            data: () => ({
              id: 'streamer1',
              name: 'GoodStreamer',
              platform: 'twitch',
              streamUrl: 'https://twitch.tv/goodstreamer',
              isOnline: false,
              isFeatured: true
            })
          },
          {
            id: 'doc2',
            data: () => ({
              id: 'streamer2',
              name: 'BadStreamer',
              platform: 'twitch',
              streamUrl: 'https://twitch.tv/badstreamer',
              isOnline: false,
              isFeatured: true
            })
          }
        ]
      }

      ;(firestoreHelpers.getFeaturedStreamers as jest.Mock).mockResolvedValueOnce(mockStreamers)
      ;(firestoreHelpers.updateStreamerOnlineStatus as jest.Mock)
        .mockResolvedValueOnce(true)  // sucesso para streamer1
        .mockResolvedValueOnce(false) // erro para streamer2

      // Mock das respostas da Twitch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [{ user_login: 'goodstreamer', type: 'live' }] })
        } as Response)
        .mockRejectedValueOnce(new Error('API error for badstreamer'))

      // Act: Atualizar todos os streamers
      const result = await twitchService.updateAllFeaturedStreamers()

      // Assert: Deve processar ambos, mas sem erro de sistema (checkStreamerLiveStatus trata erros internamente)
      expect(result.processed).toBe(2)
      expect(result.updated).toBe(1) // apenas 1 foi atualizado com sucesso (goodstreamer mudou de false para true)
      expect(result.errors).toBe(0) // checkStreamerLiveStatus trata erros internamente, retornando false
    })
  })

  describe('extractUsernameFromTwitchUrl', () => {
    it('deve extrair username de URL da Twitch', () => {
      const testCases = [
        { url: 'https://twitch.tv/username', expected: 'username' },
        { url: 'https://www.twitch.tv/username/', expected: 'username' },
        { url: 'twitch.tv/username', expected: 'username' },
        { url: 'https://twitch.tv/username?param=value', expected: 'username' }
      ]

      testCases.forEach(({ url, expected }) => {
        const result = twitchService.extractUsernameFromTwitchUrl(url)
        expect(result).toBe(expected)
      })
    })

    it('deve retornar null para URLs inválidas', () => {
      const invalidUrls = [
        'https://youtube.com/channel',
        'invalid-url',
        'https://twitch.tv/', // sem username
        ''
      ]

      invalidUrls.forEach(url => {
        const result = twitchService.extractUsernameFromTwitchUrl(url)
        expect(result).toBeNull()
      })
    })
  })
})