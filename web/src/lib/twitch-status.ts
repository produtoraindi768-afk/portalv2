import { firestoreHelpers } from './firestore-helpers'

interface TwitchStreamData {
  user_login: string
  type: 'live' | ''
  viewer_count?: number
}

interface TwitchApiResponse {
  data: TwitchStreamData[]
}

export interface UpdateResult {
  processed: number
  updated: number
  errors: number
}

export class TwitchStatusService {
  private clientId: string
  private accessToken: string

  constructor() {
    this.clientId = process.env.TWITCH_CLIENT_ID || ''
    this.accessToken = process.env.TWITCH_ACCESS_TOKEN || ''
  }

  /**
   * Verifica se um streamer específico está ao vivo na Twitch
   * NOTA: Sem API da Twitch, retorna status baseado nos dados do Firestore
   */
  async checkStreamerLiveStatus(username: string): Promise<boolean> {
    // Sem API da Twitch, retorna false
    // O status real vem dos dados do Firestore via useStreamerStatus
    return false
  }

  /**
   * Extrai username da Twitch a partir de várias formas de URL aceitas.
   * Suporta:
   * - https://www.twitch.tv/<canal>
   * - https://m.twitch.tv/<canal>
   * - https://twitch.tv/<canal>
   * - https://player.twitch.tv/?channel=<canal>
   * - twitch.tv/<canal>
   * - <canal>
   */
  extractUsernameFromTwitchUrl(input: string): string | null {
    try {
      const raw = (input || '').trim()
      if (!raw) return null

      // Caso seja apenas o nome do canal
      const looksLikeUsername = /^[A-Za-z0-9_]{3,25}$/.test(raw)
      if (looksLikeUsername) {
        return raw.toLowerCase()
      }

      // Tentar parsear como URL (adiciona https se faltar)
      const ensureProtocol = (s: string) => (s.startsWith('http') ? s : `https://${s}`)
      const url = new URL(ensureProtocol(raw))

      const host = url.hostname.toLowerCase()
      const pathSegments = url.pathname.split('/').filter(Boolean)

      // player.twitch.tv com ?channel=
      if (host.includes('player.twitch.tv')) {
        const channel = url.searchParams.get('channel')
        if (channel) return channel.toLowerCase()
      }

      // *.twitch.tv/<canal>
      if (host.endsWith('twitch.tv')) {
        if (pathSegments.length > 0) {
          const candidate = pathSegments[0].toLowerCase()
          // Ignorar rotas conhecidas que não são canal
          if (!['videos', 'directory', 'p'].includes(candidate)) {
            return candidate
          }
        }
      }

      // Fallback: tentar regex pelo parâmetro channel=
      const matchChannel = raw.match(/[?&]channel=([A-Za-z0-9_]+)/i)
      if (matchChannel) return matchChannel[1].toLowerCase()

      // Fallback: extrair depois de twitch.tv/
      const matchPath = raw.match(/twitch\.tv\/(?:[a-z]{2}\/)?([A-Za-z0-9_]+)/i)
      if (matchPath) return matchPath[1].toLowerCase()

      return null
    } catch (error) {
      console.error('Error extracting username from Twitch URL:', error)
      return null
    }
  }

  /**
   * Atualiza o status online de todos os streamers em destaque
   */
  async updateAllFeaturedStreamers(): Promise<UpdateResult> {
    const result: UpdateResult = {
      processed: 0,
      updated: 0,
      errors: 0
    }

    try {
      // Buscar todos os streamers em destaque
      const streamersSnapshot = await firestoreHelpers.getFeaturedStreamers()
      
      if (!streamersSnapshot) {
        console.error('Failed to fetch featured streamers')
        result.errors = 1
        return result
      }

      const streamers = streamersSnapshot.docs

      // Preparar dados dos streamers para verificação em lote
      const streamersData: Array<{
        id: string
        data: any
        username: string | null
      }> = []

      for (const streamerDoc of streamers) {
        const streamerData = streamerDoc.data()

        // Apenas processar streamers da Twitch
        if (streamerData.platform !== 'twitch') {
          continue
        }

        // Extrair username da URL
        const username = this.extractUsernameFromTwitchUrl(streamerData.streamUrl)
        if (!username) {
          console.warn(`Invalid Twitch URL for streamer ${streamerData.name}: ${streamerData.streamUrl}`)
          result.errors++
          continue
        }

        streamersData.push({
          id: streamerDoc.id,
          data: streamerData,
          username
        })
      }

      result.processed = streamersData.length

      if (streamersData.length === 0) {
        console.log('No valid Twitch streamers found')
        return result
      }

      // Sem API da Twitch, apenas log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`Found ${streamersData.length} Twitch streamers (no API calls made)`)
        console.log('Status updates skipped - no Twitch API configured')
      }

      console.log(`Streamer status update completed: ${result.processed} processed, ${result.updated} updated, ${result.errors} errors`)
      return result

    } catch (error) {
      console.error('Error updating featured streamers:', error)
      result.errors = 1
      return result
    }
  }

  /**
   * Executa atualização periódica (para ser usado em cron job ou interval)
   */
  async runPeriodicUpdate(): Promise<UpdateResult> {
    console.log('Starting periodic streamer status update...')
    return await this.updateAllFeaturedStreamers()
  }
}

export const twitchStatusService = new TwitchStatusService()