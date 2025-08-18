'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { firestoreHelpers } from '@/lib/firestore-helpers'

interface FirebaseDebugInfoProps {
  onRefresh?: () => void
}

export function FirebaseDebugInfo({ onRefresh }: FirebaseDebugInfoProps) {
  const [debugInfo, setDebugInfo] = useState<{
    envVars: Record<string, boolean>
    connectionTest: 'loading' | 'success' | 'error' | 'not-tested'
    tournamentsCount: number | null
    error: string | null
  }>({
    envVars: {},
    connectionTest: 'not-tested',
    tournamentsCount: null,
    error: null
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = () => {
    const envVars = {
      'NEXT_PUBLIC_FIREBASE_API_KEY': !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      'NEXT_PUBLIC_FIREBASE_APP_ID': !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    setDebugInfo(prev => ({ ...prev, envVars }))
  }

  const testConnection = async () => {
    setDebugInfo(prev => ({ ...prev, connectionTest: 'loading', error: null }))

    try {
      const tournamentsSnapshot = await firestoreHelpers.getAllTournaments()
      
      if (tournamentsSnapshot) {
        setDebugInfo(prev => ({
          ...prev,
          connectionTest: 'success',
          tournamentsCount: tournamentsSnapshot.empty ? 0 : tournamentsSnapshot.size,
          error: null
        }))
      } else {
        setDebugInfo(prev => ({
          ...prev,
          connectionTest: 'error',
          error: 'Não foi possível conectar ao Firebase'
        }))
      }
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        connectionTest: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }

  const allEnvVarsConfigured = Object.values(debugInfo.envVars).every(Boolean)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-lg">
            🔧 Debug Firebase
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {isExpanded ? 'Ocultar' : 'Expandir'}
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Atualizar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={debugInfo.connectionTest === 'loading'}
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {debugInfo.connectionTest === 'loading' ? 'Testando...' : 'Testar Conexão'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status das variáveis de ambiente */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Variáveis de Ambiente</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(debugInfo.envVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Badge 
                  variant={value ? "default" : "destructive"}
                  className={value ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-destructive/10 text-destructive border-destructive/20"}
                >
                  {value ? '✅' : '❌'}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {key.replace('NEXT_PUBLIC_FIREBASE_', '')}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={allEnvVarsConfigured ? "default" : "destructive"}
              className={allEnvVarsConfigured ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-destructive/10 text-destructive border-destructive/20"}
            >
              {allEnvVarsConfigured ? '✅ Todas configuradas' : '❌ Configuração incompleta'}
            </Badge>
          </div>
        </div>

        {/* Teste de conexão */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Teste de Conexão</h4>
          <div className="flex items-center gap-2">
            {debugInfo.connectionTest === 'not-tested' && (
              <Badge variant="outline" className="border-border text-muted-foreground">
                ⏳ Não testado
              </Badge>
            )}
            {debugInfo.connectionTest === 'loading' && (
              <Badge variant="outline" className="border-border text-muted-foreground">
                🔄 Testando...
              </Badge>
            )}
            {debugInfo.connectionTest === 'success' && (
              <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                ✅ Conectado
              </Badge>
            )}
            {debugInfo.connectionTest === 'error' && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                ❌ Erro
              </Badge>
            )}
            
            {debugInfo.tournamentsCount !== null && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {debugInfo.tournamentsCount} torneio{debugInfo.tournamentsCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          {debugInfo.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                <strong>Erro:</strong> {debugInfo.error}
              </p>
            </div>
          )}
        </div>

        {/* Informações expandidas */}
        {isExpanded && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground">Informações Técnicas</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Build Time:</strong> {new Date().toLocaleString('pt-BR')}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 