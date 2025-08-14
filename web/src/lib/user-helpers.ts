import { User } from 'firebase/auth'
import { getClientFirestore } from './safeFirestore'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

// Tipos baseados na estrutura do PROJETO_SEED_DATA.md
export interface UserData {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  provider: 'google' | 'discord' | 'epic'
  createdAt: string
  lastLogin: string
  
  // Dados específicos da Epic Games
  epicAccountId?: string
  epicDisplayName?: string
  epicUsername?: string
  epicProfile?: {
    accountId: string
    displayName: string
    username: string
    country?: string
    preferredLanguage?: string
  }
  
  // Dados do perfil do jogador (baseado no PROJETO_SEED_DATA.md)
  playerProfile?: {
    username: string
    displayName: string
    avatar: string
    bio: string
    country: string
    joinDate: string
    isVerified: boolean
    socialLinks: {
      twitch?: string
      youtube?: string
      twitter?: string
      discord?: string
    }
  }
  
  // Estatísticas do jogador
  playerStats?: {
    totalMatches: number
    wins: number
    winRate: number
    killDeathRatio: number
    averagePlacement: number
    totalKills: number
    totalDeaths: number
  }
  
  // Times do jogador
  playerTeams?: Array<{
    teamId: string
    name: string
    tag: string
    role: 'Captain' | 'Member'
    joinDate: string
    leaveDate?: string
    isActive: boolean
  }>
}

export async function saveEpicUserData(user: User, epicData?: any): Promise<void> {
  const db = getClientFirestore()
  if (!db) return

  try {
    // Verificar se o usuário já existe
    const existingUser = await getUserData(user.uid)
    
    const userData: Partial<UserData> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined,
      provider: 'epic',
      lastLogin: new Date().toISOString(),
      
      // Dados específicos da Epic Games
      epicAccountId: epicData?.accountId,
      epicDisplayName: epicData?.displayName,
      epicUsername: epicData?.username,
      epicProfile: epicData ? {
        accountId: epicData.accountId,
        displayName: epicData.displayName,
        username: epicData.username,
        country: epicData.country,
        preferredLanguage: epicData.preferredLanguage
      } : undefined
    }

    // Se é um novo usuário, adicionar data de criação
    if (!existingUser) {
      userData.createdAt = new Date().toISOString()
      
      // Criar perfil básico do jogador
      userData.playerProfile = {
        username: epicData?.username || user.displayName?.toLowerCase() || 'player',
        displayName: user.displayName || 'Jogador',
        avatar: user.photoURL || '',
        bio: '',
        country: epicData?.country || 'BR',
        joinDate: new Date().toISOString(),
        isVerified: false,
        socialLinks: {}
      }
      
      // Inicializar estatísticas
      userData.playerStats = {
        totalMatches: 0,
        wins: 0,
        winRate: 0,
        killDeathRatio: 0,
        averagePlacement: 0,
        totalKills: 0,
        totalDeaths: 0
      }
      
      userData.playerTeams = []
    }

    await setDoc(doc(db, 'users', user.uid), userData, { merge: true })
    console.log('Dados do usuário Epic Games salvos com sucesso')
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error)
  }
}

export async function getUserData(uid: string): Promise<UserData | null> {
  const db = getClientFirestore()
  if (!db) return null

  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return null
  }
}

export async function updateUserProfile(uid: string, profileData: Partial<UserData['playerProfile']>): Promise<boolean> {
  const db = getClientFirestore()
  if (!db) return false

  try {
    await updateDoc(doc(db, 'users', uid), {
      playerProfile: profileData
    })
    return true
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error)
    return false
  }
}

export async function updateUserStats(uid: string, statsData: Partial<UserData['playerStats']>): Promise<boolean> {
  const db = getClientFirestore()
  if (!db) return false

  try {
    await updateDoc(doc(db, 'users', uid), {
      playerStats: statsData
    })
    return true
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do usuário:', error)
    return false
  }
}

export async function addUserToTeam(uid: string, teamData: {
  teamId: string
  name: string
  tag: string
  role: 'Captain' | 'Member'
}): Promise<boolean> {
  const db = getClientFirestore()
  if (!db) return false

  try {
    const user = await getUserData(uid)
    if (!user) return false

    const newTeam = {
      ...teamData,
      joinDate: new Date().toISOString(),
      isActive: true
    }

    const updatedTeams = [...(user.playerTeams || []), newTeam]
    
    await updateDoc(doc(db, 'users', uid), {
      playerTeams: updatedTeams
    })
    
    return true
  } catch (error) {
    console.error('Erro ao adicionar usuário ao time:', error)
    return false
  }
}

export async function removeUserFromTeam(uid: string, teamId: string): Promise<boolean> {
  const db = getClientFirestore()
  if (!db) return false

  try {
    const user = await getUserData(uid)
    if (!user) return false

    const updatedTeams = (user.playerTeams || []).map(team => 
      team.teamId === teamId 
        ? { ...team, isActive: false, leaveDate: new Date().toISOString() }
        : team
    )
    
    await updateDoc(doc(db, 'users', uid), {
      playerTeams: updatedTeams
    })
    
    return true
  } catch (error) {
    console.error('Erro ao remover usuário do time:', error)
    return false
  }
}
