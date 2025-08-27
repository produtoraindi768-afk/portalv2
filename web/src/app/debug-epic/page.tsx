import { EpicDebugPanel } from "@/components/auth/EpicDebugPanel"
import { LoginForm } from "@/components/auth/LoginForm"

export default function DebugEpicPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">🔧 Debug Epic Games</h1>
        <p className="text-muted-foreground">
          Página temporária para diagnosticar problemas com a autenticação Epic Games
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-4">Painel de Debug</h2>
          <EpicDebugPanel />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Teste de Login</h2>
          <div className="bg-card border rounded-lg p-6">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="bg-muted border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Checklist de Configuração</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">Firebase Console</h4>
            <ul className="text-sm space-y-1">
              <li>• [ ] Domínio autorizado: fortnitesz.online</li>
              <li>• [ ] Domínio autorizado: www.fortnitesz.online</li>
              <li>• [ ] Provedor OIDC habilitado</li>
              <li>• [ ] Client ID configurado</li>
              <li>• [ ] Client Secret configurado</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Epic Games Developer Portal</h4>
            <ul className="text-sm space-y-1">
              <li>• [ ] URL: https://dashboard-f0217.firebaseapp.com/__/auth/handler</li>
              <li>• [ ] URL: https://fortnitesz.online/__/auth/handler</li>
              <li>• [ ] URL: https://www.fortnitesz.online/__/auth/handler</li>
              <li>• [ ] Escopo basic_profile habilitado</li>
              <li>• [ ] Escopo openid habilitado</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-destructive">🚨 Erros Comuns</h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong>auth/unauthorized-domain:</strong>
            <p className="text-muted-foreground">Domínio não autorizado no Firebase Console</p>
          </div>
          <div>
            <strong>auth/invalid-redirect-uri:</strong>
            <p className="text-muted-foreground">URL de redirecionamento não configurada no Epic Games</p>
          </div>
          <div>
            <strong>auth/operation-not-allowed:</strong>
            <p className="text-muted-foreground">Provedor OIDC não habilitado no Firebase</p>
          </div>
          <div>
            <strong>auth/popup-blocked:</strong>
            <p className="text-muted-foreground">Popup bloqueado pelo navegador</p>
          </div>
        </div>
      </div>
    </div>
  )
}
