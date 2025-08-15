"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getFirebaseApp } from "@/lib/firebase"
import { getAuth, OAuthProvider } from "firebase/auth"

interface DebugInfo {
  domain: string
  url: string
  firebaseConfig: {
    projectId: string
    authDomain: string
    apiKey: boolean
  }
  userAgent: string
  timestamp: string
}

export function EpicDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDebug = () => {
    setIsLoading(true)
    
    try {
      const app = getFirebaseApp()
      const auth = getAuth(app)
      const provider = new OAuthProvider("oidc.epic")
      
      const info: DebugInfo = {
        domain: window.location.hostname,
        url: window.location.href,
        firebaseConfig: {
          projectId: app.options.projectId || "Não configurado",
          authDomain: app.options.authDomain || "Não configurado",
          apiKey: !!app.options.apiKey
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
      
      setDebugInfo(info)
      console.log("🔍 Debug Info:", info)
      
    } catch (error) {
      console.error("❌ Erro no debug:", error)
      setDebugInfo({
        domain: window.location.hostname,
        url: window.location.href,
        firebaseConfig: {
          projectId: "Erro",
          authDomain: "Erro",
          apiKey: false
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyDebugInfo = () => {
    if (debugInfo) {
      const debugText = `
🔍 Debug Epic Games - ${debugInfo.timestamp}

🌐 Domínio: ${debugInfo.domain}
🔗 URL: ${debugInfo.url}
🕒 Timestamp: ${debugInfo.timestamp}

🔥 Firebase Config:
- Project ID: ${debugInfo.firebaseConfig.projectId}
- Auth Domain: ${debugInfo.firebaseConfig.authDomain}
- API Key: ${debugInfo.firebaseConfig.apiKey ? "✅ Configurada" : "❌ Não configurada"}

🌍 User Agent: ${debugInfo.userAgent}

📋 Checklist:
- [ ] Domínio autorizado no Firebase Console
- [ ] URLs de redirecionamento configuradas no Epic Games
- [ ] Provedor OIDC habilitado no Firebase
- [ ] Variáveis de ambiente configuradas no Vercel
      `.trim()
      
      navigator.clipboard.writeText(debugText)
      alert("Debug info copiado para a área de transferência!")
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Debug Epic Games
        </CardTitle>
        <CardDescription>
          Painel para diagnosticar problemas com a autenticação Epic Games
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDebug} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Executando..." : "Executar Debug"}
          </Button>
          {debugInfo && (
            <Button 
              onClick={copyDebugInfo}
              variant="secondary"
            >
              Copiar Info
            </Button>
          )}
        </div>

        {debugInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Domínio:</strong>
                <div className="text-muted-foreground">{debugInfo.domain}</div>
              </div>
              <div>
                <strong>URL:</strong>
                <div className="text-muted-foreground break-all">{debugInfo.url}</div>
              </div>
            </div>

            <div>
              <strong>Firebase Config:</strong>
              <div className="space-y-1 mt-1">
                <div className="flex items-center gap-2">
                  <span>Project ID:</span>
                  <Badge variant={debugInfo.firebaseConfig.projectId === "dashboard-f0217" ? "default" : "destructive"}>
                    {debugInfo.firebaseConfig.projectId}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Auth Domain:</span>
                  <Badge variant={debugInfo.firebaseConfig.authDomain === "dashboard-f0217.firebaseapp.com" ? "default" : "destructive"}>
                    {debugInfo.firebaseConfig.authDomain}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>API Key:</span>
                  <Badge variant={debugInfo.firebaseConfig.apiKey ? "default" : "destructive"}>
                    {debugInfo.firebaseConfig.apiKey ? "✅ Configurada" : "❌ Não configurada"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <strong>Próximos Passos:</strong>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Verifique se o domínio está autorizado no Firebase Console</li>
                <li>• Confirme as URLs de redirecionamento no Epic Games Developer Portal</li>
                <li>• Verifique se o provedor OIDC está habilitado</li>
                <li>• Teste as variáveis de ambiente no Vercel</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
