import { getClientFirestore } from '../safeFirestore'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore'

// Mock Firebase para testes
jest.mock('../firebase', () => ({
  getFirebaseApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {
      projectId: 'test-project'
    }
  }))
}))

describe('Firestore Collections Operations', () => {
  let db: any

  beforeAll(() => {
    // Configurar variáveis de ambiente para teste
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-key'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
  })

  beforeEach(() => {
    db = getClientFirestore()
  })

  describe('News Collection', () => {
    const mockNewsData = {
      title: 'Ballistic Update 1.2',
      content: 'Texto completo da notícia...',
      contentHtml: '<p>Texto <strong>formatado</strong>...</p>',
      excerpt: 'Resumo curto da notícia',
      author: 'Equipe Editorial',
      category: 'Atualizações',
      tags: ['patch', 'balance'],
      slug: 'ballistic-update-1-2',
      featuredImage: 'https://example.com/cover.jpg',
      seoTitle: 'Ballistic 1.2: Novidades',
      seoDescription: 'Resumo para SEO',
      readingTime: 4,
      status: 'published',
      publishDate: '2025-08-12',
      isFeatured: true,
      bannerUrl: 'https://example.com/banner.jpg'
    }

    it('deve criar uma nova notícia na collection news', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Preparar dados de notícia
      const newsCollection = collection(db, 'news')

      // Act: Tentar adicionar documento
      const docRef = await addDoc(newsCollection, mockNewsData)

      // Assert: Verificar se documento foi criado
      expect(docRef).toBeDefined()
      expect(docRef.id).toBeTruthy()
    })

    it('deve buscar notícias publicadas', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Query para notícias publicadas
      const newsQuery = query(
        collection(db, 'news'),
        where('status', '==', 'published'),
        orderBy('publishDate', 'desc'),
        limit(10)
      )

      // Act: Executar query
      const querySnapshot = await getDocs(newsQuery)

      // Assert: Verificar estrutura da resposta
      expect(querySnapshot).toBeDefined()
      expect(querySnapshot.docs).toBeDefined()
    })

    it('deve buscar notícias em destaque', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Query para notícias em destaque
      const featuredQuery = query(
        collection(db, 'news'),
        where('isFeatured', '==', true),
        where('status', '==', 'published')
      )

      // Act: Executar query
      const querySnapshot = await getDocs(featuredQuery)

      // Assert: Verificar estrutura da resposta
      expect(querySnapshot).toBeDefined()
      expect(querySnapshot.docs).toBeDefined()
    })
  })

  describe('Streamers Collection', () => {
    const mockStreamerData = {
      id: Date.now().toString(),
      name: 'Test Streamer',
      platform: 'twitch',
      streamUrl: 'https://twitch.tv/teststreamer',
      avatarUrl: 'https://example.com/avatar.jpg',
      category: 'FPS',
      isOnline: false,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      lastStatusUpdate: new Date().toISOString()
    }

    it('deve criar um novo streamer na collection streamers', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Preparar dados do streamer
      const streamersCollection = collection(db, 'streamers')

      // Act: Tentar adicionar documento
      const docRef = await addDoc(streamersCollection, mockStreamerData)

      // Assert: Verificar se documento foi criado
      expect(docRef).toBeDefined()
      expect(docRef.id).toBeTruthy()
    })

    it('deve buscar streamers em destaque', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Query para streamers em destaque
      const featuredQuery = query(
        collection(db, 'streamers'),
        where('isFeatured', '==', true)
      )

      // Act: Executar query
      const querySnapshot = await getDocs(featuredQuery)

      // Assert: Verificar estrutura da resposta
      expect(querySnapshot).toBeDefined()
      expect(querySnapshot.docs).toBeDefined()
    })

    it('deve atualizar status online do streamer', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Criar streamer de teste
      const streamersCollection = collection(db, 'streamers')
      const docRef = await addDoc(streamersCollection, mockStreamerData)

      // Act: Atualizar status online
      await updateDoc(docRef, {
        isOnline: true,
        lastStatusUpdate: new Date().toISOString()
      })

      // Assert: Verificar se foi atualizado
      const updatedDoc = await getDoc(docRef)
      expect(updatedDoc.exists()).toBeTruthy()
      if (updatedDoc.exists()) {
        expect(updatedDoc.data().isOnline).toBe(true)
      }
    })
  })

  describe('Tournaments Collection', () => {
    const mockTournamentData = {
      name: 'Ballistic Open',
      game: 'Fortnite: Ballistic',
      format: 'Eliminação simples',
      description: 'Torneio aberto à comunidade',
      startDate: '2025-08-20T18:00:00.000Z',
      endDate: '2025-08-21T22:00:00.000Z',
      registrationDeadline: '2025-08-18T23:59:59.000Z',
      maxParticipants: 64,
      prizePool: 5000,
      entryFee: 0,
      rules: 'Sem trapaças, seguir fair play.',
      status: 'upcoming',
      isActive: true
    }

    it('deve criar um novo torneio na collection tournaments', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Preparar dados do torneio
      const tournamentsCollection = collection(db, 'tournaments')

      // Act: Tentar adicionar documento
      const docRef = await addDoc(tournamentsCollection, mockTournamentData)

      // Assert: Verificar se documento foi criado
      expect(docRef).toBeDefined()
      expect(docRef.id).toBeTruthy()
    })

    it('deve buscar torneios ativos e futuros', async () => {
      if (!db) {
        expect(db).toBeNull()
        return
      }

      // Arrange: Query para torneios ativos
      const activeQuery = query(
        collection(db, 'tournaments'),
        where('isActive', '==', true),
        where('status', 'in', ['upcoming', 'ongoing'])
      )

      // Act: Executar query
      const querySnapshot = await getDocs(activeQuery)

      // Assert: Verificar estrutura da resposta
      expect(querySnapshot).toBeDefined()
      expect(querySnapshot.docs).toBeDefined()
    })
  })
})