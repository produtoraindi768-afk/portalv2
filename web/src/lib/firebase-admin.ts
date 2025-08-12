import admin from 'firebase-admin'
import type { App as AdminApp } from 'firebase-admin/app'
import type { Firestore } from 'firebase-admin/firestore'

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dashboard-f0217',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@dashboard-f0217.iam.gserviceaccount.com',
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
}

// Private key completa do service account para desenvolvimento
const DEVELOPMENT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCV9xsEtCJy2zSN
GQx9fZLN9P6+u7PKQ+DakwcY3bPVDtGxVKNcbZMBnnWX8hhrXEXQMKYXMrZbqE6M
q9hhDZ2RKnJrqYz6ROskDxJakCG3+VABnPg6RgDAuPJjHZHQvnKvv3SL7BreouRN
dAdo9D0iMGWjhzJ68BWVNWzTGSQfay5FzqOCDnXA4cXP8uWYU+QmLUFJIJzLRn1z
7dtRuCB103MSv1rl/0oNEBTwbkk9alh3SSRK0sbcyAjQEOXPOYsng6G3wnYG1uPX
z9K3j2EIOD413YtQu38vFg3GdsRI9C+Np0dtB2wAP9YZDmeqEvFmbDg3RESKo1dD
jkaEbwe3AgMBAAECggEAM1D9g9yINTlhgC7kIUUJKUT+rxHX8gzMMr9BHHcxBGUv
yDioNgag2Vr57ma/iG1ozlb3XtTRpgev6V8cigl4s6YMxV6diT5wIESwCSFtCGFd
yU+HeZlexJQFDXme3gltgUpIfWDryOeArChaKMX67WoWPaET2xGwsQA5Hvtpav5h
50FuxPak4kBOqc/ZSbZBVPYiNfy9uvUBO6Jx+S9IaemmYFulloYy7Yb57uRwEOYD
cc5t6LUHVRDgdnR+o4i4N3Epoh04i9966HcoKs7v+wZSvPL4QA5vZtKz5vxCYqef
s+SSnCB9UmByLVPqdpvQZh9RxCr7evX/auviOQpn8QKBgQDPKB161T3yZRaRUyA+
SsBaccTibpD+4dbM7AeUYvtJ1jakFVBB7l8ulmsJ4wdDA/Wb0ySNolt4n8uUBvys
bl7yfZ+odUtq0DzkbKa9/zAj0lgsi+syd1wCiSla7NyFjmd9tz/YW3qTlnSkI90y
Lv2L6xEcFky3jogc/RmfCqc9DQKBgQC5UvDPeKFenSTxHO2mTbIYoiwPuKth0zaz
viA/oYhsfjXoVPdlp0ls8vtCAdiM12uZx+WrpjfKUlpuuFslfhWdzHaUbMiE0dOo
tVv8bcWOmiTcRXMTS5Y9sI//eSQmOJMbI1E8mtdTQUt5Zb8JBgcXyjdV5WqHpKAT
J+S3fgUO0wKBgC+oNef9SMwL734tVnyeK9Ri2f2RnC/W+tiX8EJ15wOckWN8N8OD
OEh6eFOE9DW5onZfw8gFsu90K5x5YwW0Oomk1uclXN1M3MVcLZwGKigDix9sbQZm
KTe4IFh3p1/eW/azArAek3uCoIDmc0vJPbFDueLxSmLsGmo42/0XsVO9AoGAZ258
Cj84SRcJhCxyEqwwZwEz+D5IIJwCXsUROJJOEsdKDPZG8YwxNcZTJx7inpCodDaV
33wwjRHzePIZpM4/AEgaMnKYY1C8gd9ejH8zkIhFZE66kB1Sp/GAHMSewVo3+CB4
+Yst/EBoAEQiH8YmdUeeJKmbEEN4N9i/FQ4XgpMCgYAeAtCdemZQdRnzcjGvyX5o
h/YKs2tpRbxQlbZyoLPf+fW7UzjAAmD2/WJAALzCKcMsNbqPQ+0OJMaxEOldk1Xv
E3YoO1bMJIFyECyPflQJ8/rGgs02nPCbsaXHu5Q3ig1r96UxT/f4N1kXo6CX5Pvj
g+hLQeSXKxRHOt3MOFHT7g==
-----END PRIVATE KEY-----`

export function getFirebaseAdminApp(): AdminApp | null {
  try {
    // Verificar se já existe uma instância admin
    const existingApp = admin.apps.find((app: any) => app?.name === 'firebase-admin')
    if (existingApp) {
      return existingApp as AdminApp
    }

    // Usar private key do ambiente ou fallback para desenvolvimento
    const privateKey = firebaseAdminConfig.privateKey || DEVELOPMENT_PRIVATE_KEY

    // Inicializar o app admin com service account
    const adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: privateKey,
      }),
      projectId: firebaseAdminConfig.projectId,
    }, 'firebase-admin')

    console.log('Firebase Admin SDK initialized successfully')
    return adminApp
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error)
    return null
  }
}

export function getAdminFirestore(): Firestore | null {
  try {
    const adminApp = getFirebaseAdminApp()
    if (!adminApp) return null
    
    return admin.firestore(adminApp)
  } catch (error) {
    console.error('Error getting Admin Firestore instance:', error)
    return null
  }
}

// Utility para seed de dados usando Admin SDK
export async function seedDataWithAdmin(): Promise<boolean> {
  try {
    const adminDb = getAdminFirestore()
    if (!adminDb) {
      console.error('Admin Firestore not available for seeding')
      return false
    }

    // Dados de exemplo baseados no PROJETO_SEED_DATA.md
    const collections = {
      news: {
        'ballistic-update-1-2': {
          title: "Ballistic Update 1.2",
          content: "Texto completo da notícia sobre o update 1.2 do Fortnite: Ballistic...",
          contentHtml: "<p>Texto <strong>formatado</strong> da notícia...</p>",
          excerpt: "Resumo curto da notícia sobre as novidades do patch",
          author: "Equipe Editorial",
          category: "Atualizações",
          tags: ["patch", "balance", "fortnite"],
          slug: "ballistic-update-1-2",
          featuredImage: "https://example.com/ballistic-cover.jpg",
          seoTitle: "Ballistic 1.2: Novidades e Mudanças",
          seoDescription: "Confira todas as novidades do update 1.2 do Fortnite: Ballistic",
          readingTime: 4,
          status: "published",
          publishDate: "2025-08-12",
          isFeatured: true,
          bannerUrl: "https://example.com/ballistic-banner.jpg"
        }
      },
      streamers: {
        'streamer_001': {
          id: "1733856000000",
          name: "GameMasterBR",
          platform: "twitch",
          streamUrl: "https://twitch.tv/gamemasterbr",
          avatarUrl: "https://example.com/avatar-gamemaster.jpg",
          category: "FPS",
          isOnline: false,
          isFeatured: true,
          createdAt: "2025-08-10T10:00:00.000Z",
          lastStatusUpdate: "2025-08-10T10:00:00.000Z"
        }
      },
      tournaments: {
        'ballistic_open_2025': {
          name: "Ballistic Open 2025",
          game: "Fortnite: Ballistic",
          format: "Eliminação simples",
          description: "Torneio aberto à comunidade brasileira de Fortnite: Ballistic",
          startDate: "2025-08-20T18:00:00.000Z",
          endDate: "2025-08-21T22:00:00.000Z",
          registrationDeadline: "2025-08-18T23:59:59.000Z",
          maxParticipants: 64,
          prizePool: 5000,
          entryFee: 0,
          rules: "Sem trapaças, seguir fair play. Uso de cheats resulta em desqualificação.",
          status: "upcoming",
          isActive: true
        }
      },
      teams: {
        'team_alpha': {
          name: "Equipe Alpha",
          tag: "ALPHA",
          game: "Fortnite: Ballistic",
          region: "BR",
          description: "Time competitivo focado em Fortnite: Ballistic",
          members: ["player_001", "player_002", "player_003"],
          captain: "player_001",
          contactEmail: "contato@alpha.gg",
          discordServer: "https://discord.gg/alpha123",
          avatar: "https://example.com/alpha-logo.png",
          isActive: true
        }
      }
    }

    // Criar as collections e documentos
    for (const [collectionName, documents] of Object.entries(collections)) {
      for (const [docId, data] of Object.entries(documents)) {
        await adminDb.collection(collectionName).doc(docId).set(data)
        console.log(`Created document ${docId} in collection ${collectionName}`)
      }
    }

    console.log('All seed data created successfully!')
    return true
  } catch (error) {
    console.error('Error seeding data:', error)
    return false
  }
}