import { getFirebaseApp } from '../firebase'
import { getClientFirestore } from '../safeFirestore'

describe('Firebase Configuration', () => {
  describe('Firebase App Initialization', () => {
    it('deve inicializar o app Firebase com configuração válida', () => {
      // Arrange: Mock das variáveis de ambiente necessárias
      const originalEnv = process.env
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        NEXT_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:abc123'
      }

      // Act: Tentar inicializar o Firebase
      const app = getFirebaseApp()

      // Assert: Verificar se o app foi inicializado
      expect(app).toBeDefined()
      expect(app.name).toBe('[DEFAULT]')
      
      // Cleanup
      process.env = originalEnv
    })

    it('deve falhar gracefully quando configuração está ausente', () => {
      // Arrange: Remover variáveis de ambiente
      const originalEnv = process.env
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined
      }

      // Act & Assert: Deve falhar gracefully
      expect(() => {
        getClientFirestore()
      }).not.toThrow()

      const db = getClientFirestore()
      expect(db).toBeNull()
      
      // Cleanup
      process.env = originalEnv
    })
  })

  describe('Firestore Integration', () => {
    it('deve retornar instância do Firestore quando configurado', () => {
      // Arrange: Configurar variáveis válidas
      const originalEnv = process.env
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project-id'
      }

      // Act: Obter instância do Firestore
      const db = getClientFirestore()

      // Assert: Verificar retorno válido
      expect(db).toBeDefined()
      
      // Cleanup
      process.env = originalEnv
    })

    it('deve retornar null quando Firebase não configurado', () => {
      // Arrange: Limpar configuração
      const originalEnv = process.env
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: '',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ''
      }

      // Act: Tentar obter Firestore
      const db = getClientFirestore()

      // Assert: Deve retornar null
      expect(db).toBeNull()
      
      // Cleanup
      process.env = originalEnv
    })
  })
})