"use client"

import { signOut } from "firebase/auth"
import { getAuth } from "firebase/auth"
import { getFirebaseApp } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function AuthStatus() {
  const { user, userData, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Entrar
        </Button>
      </Link>
    )
  }

  const handleSignOut = async () => {
    try {
      const app = getFirebaseApp()
      const auth = getAuth(app)
      await signOut(auth)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const displayName = userData?.playerProfile?.displayName || user?.displayName || user?.email || "Usuário"
  const avatarUrl = userData?.playerProfile?.avatar || user?.photoURL
  const username = userData?.playerProfile?.username

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {username && (
              <p className="text-xs leading-none text-muted-foreground">
                @{username}
              </p>
            )}
            {userData?.provider && (
              <p className="text-xs leading-none text-muted-foreground">
                Conectado via {userData.provider === 'epic' ? 'Epic Games' : userData.provider}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${username || user?.uid}`}>
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


