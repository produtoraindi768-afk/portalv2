"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuth, GoogleAuthProvider, signInWithPopup, OAuthProvider, UserCredential } from "firebase/auth"
import { getFirebaseApp } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { saveEpicUserData } from "@/lib/user-helpers"
import { toast } from "sonner"
import Image from "next/image"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const handleEpicLogin = async () => {
    try {
      toast.loading("Conectando com Epic Games...")
      
      const app = getFirebaseApp()
      const auth = getAuth(app)
      const provider = new OAuthProvider("oidc.epic")
      
      // Adicionar escopos conforme documentação oficial
      provider.addScope('basic_profile')
      provider.addScope('openid')
      provider.addScope('email')
      
      const result: UserCredential = await signInWithPopup(auth, provider)
      
      // Capturar dados específicos da Epic Games
      const epicData = (result as any).additionalUserInfo?.profile
      
      // Validar dados antes de salvar
      if (epicData && epicData.sub) {
        // Salvar dados no Firestore
        if (result.user) {
          await saveEpicUserData(result.user, epicData)
        }
        toast.dismiss()
        toast.success("Login Epic Games realizado com sucesso!")
      } else {
        console.warn('Dados Epic Games não encontrados')
        toast.dismiss()
        toast.success("Login realizado, mas dados do perfil não disponíveis")
      }
      
    } catch (error: any) {
      toast.dismiss()
      console.error('Erro no login Epic Games:', error)
      
      // Tratamento específico de erros conforme documentação
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Login cancelado pelo usuário")
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup bloqueado. Permita popups para este site")
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error("Domínio não autorizado. Configure no Firebase Console")
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error("Login Epic Games não está habilitado. Configure no Firebase Console")
      } else {
        toast.error("Erro ao fazer login com Epic Games. Tente novamente.")
      }
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Use um provedor para acessar sua conta
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Senha</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Entrar
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            ou continue com
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            id="btn-google"
            onClick={async () => {
              try {
                toast.loading("Conectando com Google...")
                const app = getFirebaseApp()
                const auth = getAuth(app)
                const provider = new GoogleAuthProvider()
                await signInWithPopup(auth, provider)
                toast.dismiss()
                toast.success("Login Google realizado com sucesso!")
              } catch (error) {
                toast.dismiss()
                toast.error("Erro ao fazer login com Google. Tente novamente.")
              }
            }}
            aria-label="Entrar com Google"
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            id="btn-discord"
            onClick={async () => {
              try {
                toast.loading("Conectando com Discord...")
                const app = getFirebaseApp()
                const auth = getAuth(app)
                const provider = new OAuthProvider("oidc.discord")
                await signInWithPopup(auth, provider)
                toast.dismiss()
                toast.success("Login Discord realizado com sucesso!")
              } catch (error) {
                toast.dismiss()
                toast.error("Erro ao fazer login com Discord. Tente novamente.")
              }
            }}
            aria-label="Entrar com Discord"
          >
            Discord
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            id="btn-epic"
            onClick={handleEpicLogin}
            aria-label="Entrar com Epic Games"
          >
            <Image 
              src="/epic-games.svg" 
              alt="Epic Games" 
              width={16} 
              height={16} 
              className="mr-2"
            />
            Epic Games
          </Button>
        </div>
      </div>
    </form>
  )
}


