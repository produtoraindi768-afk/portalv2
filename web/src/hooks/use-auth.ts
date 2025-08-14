import { useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import { getFirebaseApp } from '@/lib/firebase'
import { getUserData, UserData } from '@/lib/user-helpers'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Buscar dados adicionais do usuário no Firestore
        const data = await getUserData(user.uid)
        setUserData(data)
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    user,
    userData,
    loading,
    isAuthenticated: !!user
  }
}
