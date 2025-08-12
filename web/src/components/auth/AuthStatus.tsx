"use client"

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth"
import { getFirebaseApp } from "@/lib/firebase"
import Link from "next/link"

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  if (!user) {
    return (
      <Link className="underline" href="/login">
        Login
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{user.email ?? user.displayName ?? "Usuário"}</span>
      <button
        className="underline"
        onClick={async () => {
          const app = getFirebaseApp()
          await signOut(getAuth(app))
        }}
        aria-label="Sair"
      >
        Sair
      </button>
    </div>
  )
}


