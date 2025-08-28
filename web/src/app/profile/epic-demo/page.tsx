"use client"

import { useAuth } from "@/hooks/use-auth"
import { EpicProfileCard } from "@/components/profile/EpicProfileCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Info, LogIn } from "lucide-react"
import Link from "next/link"

export default function EpicDemoPage() {
  const { user, userData, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Acesso Restrito
              </CardTitle>
              <CardDescription>
                Você precisa estar logado para ver esta página
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Esta página demonstra como os dados do usuário Epic Games são exibidos após o login.
                  Faça login com sua conta Epic Games para ver o conteúdo.
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Link href="/login">
                  <Button className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Usuário</CardTitle>
              <CardDescription>
                Carregando dados do usuário...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Os dados do usuário estão sendo carregados do Firestore.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Demonstração do Perfil Epic Games</h1>
          <p className="text-muted-foreground">
            Esta página mostra como os dados do usuário Epic Games são exibidos após o login bem-sucedido.
          </p>
        </div>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Sessão</CardTitle>
            <CardDescription>Dados básicos da autenticação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Dados do Firebase Auth</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>UID:</strong> {user?.uid}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Display Name:</strong> {user?.displayName}</p>
                  <p><strong>Provider:</strong> {userData.provider}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Dados do Firestore</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Criado em:</strong> {new Date(userData.createdAt).toLocaleString('pt-BR')}</p>
                  <p><strong>Último login:</strong> {new Date(userData.lastLogin).toLocaleString('pt-BR')}</p>
                  <p><strong>Epic Account ID:</strong> {userData.epicAccountId || 'N/A'}</p>
                  <p><strong>Epic Username:</strong> {userData.epicUsername || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Perfil Epic Games */}
        <EpicProfileCard userData={userData} />

        {/* Dados JSON */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Completos (JSON)</CardTitle>
            <CardDescription>
              Estrutura completa dos dados salvos no Firestore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Links de Navegação */}
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button variant="outline">
              Ir para Dashboard
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">
              Ver Perfil Completo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
