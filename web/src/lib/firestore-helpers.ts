import { getClientFirestore } from './safeFirestore'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  doc,
  DocumentData,
  QuerySnapshot,
  DocumentReference
} from 'firebase/firestore'

export type NewsData = {
  title: string
  content: string
  contentHtml: string
  excerpt: string
  author: string
  category: string
  tags: string[]
  slug: string
  featuredImage: string
  seoTitle: string
  seoDescription: string
  readingTime: number
  status: 'draft' | 'published'
  publishDate: string // YYYY-MM-DD format
  isFeatured: boolean
  bannerUrl: string
}

export type StreamerData = {
  id: string // gerado com Date.now().toString()
  name: string
  platform: string // twitch, youtube, etc.
  streamUrl: string
  avatarUrl: string
  category: string // FPS, MOBA, etc.
  isOnline: boolean
  isFeatured: boolean
  createdAt: string // ISO format
  lastStatusUpdate: string // ISO format
}

export type TeamData = {
  id: string,
  name: string,
  logo: string | null,
  avatar: string | null
}

export type MatchData = {
  tournamentId: string
  team1Id: string
  team2Id: string
  scheduledDate: string // ISO format
  format: 'MD1' | 'MD3' | 'MD5'
  game: string
  isFeatured: boolean
  tournamentName: string
  team1: TeamData
  team2: TeamData
  maps: Array<{
    name: string,
    winner: null | 'team1' | 'team2'
  }>
  status: 'scheduled' | 'ongoing' | 'finished'
  result: {
    team1Score: number,
    team2Score: number,
    winner: null | 'team1' | 'team2'
  }
  resultMD3: {
    team1Score: number, // 0-3
    team2Score: number, // 0-3
    winner: string | null // 'team1' | 'team2'
  }
  resultMD5: {
    team1Score: number, // 0-5
    team2Score: number, // 0-5
    winner: string | null // 'team1' | 'team2'
  }
}

export type TournamentData = {
  name: string
  game: string
  format: string
  description: string
  startDate: string // ISO format
  endDate: string // ISO format
  registrationDeadline: string // ISO format
  maxParticipants: number
  prizePool: number // em R$
  entryFee: number // em R$
  rules: string
  status: 'upcoming' | 'ongoing' | 'finished'
  isActive: boolean
}

export type TeamFullData = {
  name: string
  tag: string // maiúsculas, ex: 'ALPHA'
  game: string
  region: string
  description: string
  members: string[] // lista de IDs/nomes, filtrar vazios
  captain: string // ID/nome
  contactEmail: string
  discordServer: string // URL/ID do servidor Discord
  avatar: string // URL do avatar
  isActive: boolean
}

export type PlayerData = {
  username: string
  displayName: string
  avatar: string
  bio: string
  country: string
  joinDate: string // ISO format
  isVerified: boolean
  socialLinks: {
    twitch?: string
    youtube?: string
    twitter?: string
    discord?: string
  }
}

export type PlayerStats = {
  totalMatches: number
  wins: number
  winRate: number
  killDeathRatio: number
  averagePlacement: number
  totalKills: number
  totalDeaths: number
}

export type PlayerMatch = {
  tournamentName: string
  tournamentId: string
  date: string // ISO format
  placement: number
  kills: number
  deaths: number
  result: 'win' | 'loss' | 'draw'
  teamId?: string
}

export type PlayerTeam = {
  teamId: string
  name: string
  tag: string
  role: 'Captain' | 'Member'
  joinDate: string // ISO format
  leaveDate?: string // ISO format
  isActive: boolean
}

export class FirestoreHelpers {
  private db: ReturnType<typeof getClientFirestore>

  constructor() {
    this.db = getClientFirestore()
  }

  // News operations
  async createNews(newsData: NewsData): Promise<DocumentReference | null> {
    if (!this.db) return null

    try {
      const newsCollection = collection(this.db, 'news')
      return await addDoc(newsCollection, newsData)
    } catch (error) {
      console.error('Error creating news:', error)
      return null
    }
  }

  async getPublishedNews(limitCount: number = 10): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const newsQuery = query(
        collection(this.db, 'news'),
        where('status', '==', 'published'),
        orderBy('publishDate', 'desc'),
        limit(limitCount)
      )
      return await getDocs(newsQuery)
    } catch (error) {
      console.error('Error fetching published news:', error)
      return null
    }
  }

  async getFeaturedNews(): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const featuredQuery = query(
        collection(this.db, 'news'),
        where('isFeatured', '==', true),
        where('status', '==', 'published'),
        orderBy('publishDate', 'desc')
      )
      return await getDocs(featuredQuery)
    } catch (error) {
      console.error('Error fetching featured news:', error)
      return null
    }
  }

  // Streamers operations
  async createStreamer(streamerData: StreamerData): Promise<DocumentReference | null> {
    if (!this.db) return null

    try {
      const streamersCollection = collection(this.db, 'streamers')
      return await addDoc(streamersCollection, streamerData)
    } catch (error) {
      console.error('Error creating streamer:', error)
      return null
    }
  }

  async getFeaturedStreamers(): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const featuredQuery = query(
        collection(this.db, 'streamers'),
        where('isFeatured', '==', true),
        where('isOnline', '==', true)
      )
      return await getDocs(featuredQuery)
    } catch (error) {
      console.error('Error fetching featured streamers:', error)
      return null
    }
  }

  async updateStreamerOnlineStatus(streamerId: string, isOnline: boolean): Promise<boolean> {
    if (!this.db) return false

    try {
      const streamerDocRef = doc(this.db, 'streamers', streamerId)
      await updateDoc(streamerDocRef, {
        isOnline,
        lastStatusUpdate: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Error updating streamer status:', error)
      return false
    }
  }

  // Tournaments operations
  async createTournament(tournamentData: TournamentData): Promise<DocumentReference | null> {
    if (!this.db) return null

    try {
      const tournamentsCollection = collection(this.db, 'tournaments')
      return await addDoc(tournamentsCollection, tournamentData)
    } catch (error) {
      console.error('Error creating tournament:', error)
      return null
    }
  }

  async getActiveTournaments(): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const activeQuery = query(
        collection(this.db, 'tournaments'),
        where('isActive', '==', true),
        where('status', 'in', ['upcoming', 'ongoing']),
        orderBy('startDate', 'asc')
      )
      return await getDocs(activeQuery)
    } catch (error) {
      console.error('Error fetching active tournaments:', error)
      return null
    }
  }

  async getAllTournaments(): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const tournamentsQuery = query(
        collection(this.db, 'tournaments'),
        where('isActive', '==', true),
        orderBy('startDate', 'desc')
      )
      return await getDocs(tournamentsQuery)
    } catch (error) {
      console.error('Error fetching all tournaments:', error)
      return null
    }
  }

  async getTournamentsByStatus(status: 'upcoming' | 'ongoing' | 'finished'): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const statusQuery = query(
        collection(this.db, 'tournaments'),
        where('isActive', '==', true),
        where('status', '==', status),
        orderBy('startDate', 'asc')
      )
      return await getDocs(statusQuery)
    } catch (error) {
      console.error(`Error fetching ${status} tournaments:`, error)
      return null
    }
  }

  // Matches operations
  async createMatch(matchData: MatchData): Promise<DocumentReference | null> {
    if (!this.db) return null

    try {
      const matchesCollection = collection(this.db, 'matches')
      return await addDoc(matchesCollection, matchData)
    } catch (error) {
      console.error('Error creating match:', error)
      return null
    }
  }

  async getFeaturedMatches(): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const featuredQuery = query(
        collection(this.db, 'matches'),
        where('isFeatured', '==', true),
        orderBy('scheduledDate', 'asc')
      )
      return await getDocs(featuredQuery)
    } catch (error) {
      console.error('Error fetching featured matches:', error)
      return null
    }
  }

  async updateMatchStatus(matchId: string, status: 'scheduled' | 'ongoing' | 'finished'): Promise<boolean> {
    if (!this.db) return false

    try {
      const matchDocRef = doc(this.db, 'matches', matchId)
      await updateDoc(matchDocRef, { status })
      return true
    } catch (error) {
      console.error('Error updating match status:', error)
      return false
    }
  }

  // Teams operations
  async createTeam(teamData: TeamFullData): Promise<DocumentReference | null> {
    if (!this.db) return null

    try {
      const teamsCollection = collection(this.db, 'teams')
      // Filtrar membros vazios antes de salvar
      const filteredTeamData = {
        ...teamData,
        members: teamData.members.filter(member => member.trim() !== '')
      }
      return await addDoc(teamsCollection, filteredTeamData)
    } catch (error) {
      console.error('Error creating team:', error)
      return null
    }
  }

  async getActiveTeams(): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const activeQuery = query(
        collection(this.db, 'teams'),
        where('isActive', '==', true)
      )
      return await getDocs(activeQuery)
    } catch (error) {
      console.error('Error fetching active teams:', error)
      return null
    }
  }

  async getTeamByTag(tag: string): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const tagQuery = query(
        collection(this.db, 'teams'),
        where('tag', '==', tag.toUpperCase())
      )
      return await getDocs(tagQuery)
    } catch (error) {
      console.error('Error fetching team by tag:', error)
      return null
    }
  }

  async updateTeamMembers(teamId: string, members: string[]): Promise<boolean> {
    if (!this.db) return false

    try {
      const teamDocRef = doc(this.db, 'teams', teamId)
      await updateDoc(teamDocRef, {
        members: members.filter(member => member.trim() !== '')
      })
      return true
    } catch (error) {
      console.error('Error updating team members:', error)
      return false
    }
  }

  // Players operations
  async getPlayerByUsername(username: string): Promise<{ exists: boolean, data?: () => PlayerData } | null> {
    if (!this.db) return null

    try {
      const playerQuery = query(
        collection(this.db, 'players'),
        where('username', '==', username.toLowerCase())
      )
      const snapshot = await getDocs(playerQuery)
      
      if (snapshot.empty) {
        return { exists: false }
      }

      const playerDoc = snapshot.docs[0]
      return { 
        exists: true, 
        data: () => playerDoc.data() as PlayerData 
      }
    } catch (error) {
      console.error('Error fetching player by username:', error)
      return null
    }
  }

  async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    if (!this.db) return null

    try {
      // Em um cenário real, isso seria calculado com base em matches
      // Por simplicidade, retorno dados mock
      return {
        totalMatches: 150,
        wins: 45,
        winRate: 30,
        killDeathRatio: 1.85,
        averagePlacement: 8.5,
        totalKills: 3420,
        totalDeaths: 1850
      }
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return null
    }
  }

  async getPlayerMatches(playerId: string): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const matchesQuery = query(
        collection(this.db, 'player_matches'),
        where('playerId', '==', playerId),
        orderBy('date', 'desc'),
        limit(20)
      )
      return await getDocs(matchesQuery)
    } catch (error) {
      console.error('Error fetching player matches:', error)
      return null
    }
  }

  async getPlayerTeams(playerId: string): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const teamsQuery = query(
        collection(this.db, 'player_teams'),
        where('playerId', '==', playerId),
        orderBy('joinDate', 'desc')
      )
      return await getDocs(teamsQuery)
    } catch (error) {
      console.error('Error fetching player teams:', error)
      return null
    }
  }

  // Team extended operations
  async getTeamStats(teamId: string): Promise<any | null> {
    if (!this.db) return null

    try {
      // Em um cenário real, isso seria calculado com base em matches
      // Por simplicidade, retorno dados mock
      return {
        totalMatches: 75,
        wins: 48,
        losses: 27,
        winRate: 64,
        averagePlacement: 4.2,
        totalPrizeWon: 25000,
        currentRank: 3
      }
    } catch (error) {
      console.error('Error fetching team stats:', error)
      return null
    }
  }

  async getTeamMatches(teamId: string): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const matchesQuery = query(
        collection(this.db, 'team_matches'),
        where('teamId', '==', teamId),
        orderBy('date', 'desc'),
        limit(20)
      )
      return await getDocs(matchesQuery)
    } catch (error) {
      console.error('Error fetching team matches:', error)
      return null
    }
  }

  async getTeamMembers(teamId: string): Promise<QuerySnapshot<DocumentData> | null> {
    if (!this.db) return null

    try {
      const membersQuery = query(
        collection(this.db, 'team_members'),
        where('teamId', '==', teamId),
        where('isActive', '==', true),
        orderBy('joinDate', 'asc')
      )
      return await getDocs(membersQuery)
    } catch (error) {
      console.error('Error fetching team members:', error)
      return null
    }
  }

  // Utility methods for seeding data
  async seedSampleData(): Promise<void> {
    if (!this.db) {
      console.warn('Cannot seed data: Firestore not available')
      return
    }

    try {
      // Sample News
      const sampleNews: NewsData = {
        title: "Ballistic Update 1.2",
        content: "Texto completo da notícia...",
        contentHtml: "<p>Texto <strong>formatado</strong>...</p>",
        excerpt: "Resumo curto da notícia",
        author: "Equipe Editorial",
        category: "Atualizações",
        tags: ["patch", "balance"],
        slug: "ballistic-update-1-2",
        featuredImage: "https://example.com/cover.jpg",
        seoTitle: "Ballistic 1.2: Novidades",
        seoDescription: "Resumo para SEO",
        readingTime: 4,
        status: "published",
        publishDate: "2025-08-12",
        isFeatured: true,
        bannerUrl: "https://example.com/banner.jpg"
      }

      // Sample Streamer
      const sampleStreamer: StreamerData = {
        id: Date.now().toString(),
        name: "Streamer Name",
        platform: "twitch",
        streamUrl: "https://twitch.tv/streamername",
        avatarUrl: "https://example.com/avatar.jpg",
        category: "FPS",
        isOnline: false,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        lastStatusUpdate: new Date().toISOString()
      }

      // Sample Tournament
      const sampleTournament: TournamentData = {
        name: "Ballistic Open",
        game: "Fortnite: Ballistic",
        format: "Eliminação simples",
        description: "Torneio aberto à comunidade",
        startDate: "2025-08-20T18:00:00.000Z",
        endDate: "2025-08-21T22:00:00.000Z",
        registrationDeadline: "2025-08-18T23:59:59.000Z",
        maxParticipants: 64,
        prizePool: 5000,
        entryFee: 0,
        rules: "Sem trapaças, seguir fair play.",
        status: "upcoming",
        isActive: true
      }

      // Sample Team
      const sampleTeam: TeamFullData = {
        name: "Equipe Alpha",
        tag: "ALPHA",
        game: "Fortnite: Ballistic",
        region: "BR",
        description: "Time competitivo...",
        members: ["user_1", "user_2"],
        captain: "user_1",
        contactEmail: "contato@alpha.gg",
        discordServer: "https://discord.gg/abc123",
        avatar: "https://example.com/logo.png",
        isActive: true
      }

      // Create sample data
      await this.createNews(sampleNews)
      await this.createStreamer(sampleStreamer)
      await this.createTournament(sampleTournament)
      await this.createTeam(sampleTeam)

      console.log('Sample data seeded successfully!')
    } catch (error) {
      console.error('Error seeding sample data:', error)
    }
  }
}

export const firestoreHelpers = new FirestoreHelpers()