"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuth, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth"
import { getFirebaseApp } from "@/lib/firebase"
import { cn } from "@/lib/utils"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
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
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            id="btn-google"
            onClick={async () => {
              const app = getFirebaseApp()
              const auth = getAuth(app)
              const provider = new GoogleAuthProvider()
              await signInWithPopup(auth, provider)
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
              const app = getFirebaseApp()
              const auth = getAuth(app)
              const provider = new OAuthProvider("oidc.discord")
              await signInWithPopup(auth, provider)
            }}
            aria-label="Entrar com Discord"
          >
            Discord
          </Button>
        </div>
      </div>
    </form>
  )
}


