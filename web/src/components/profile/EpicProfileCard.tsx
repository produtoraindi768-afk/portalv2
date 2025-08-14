"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserData } from "@/lib/user-helpers"
import { Calendar, MapPin, Globe, Trophy, Users } from "lucide-react"

interface EpicProfileCardProps {
  userData: UserData
}

export function EpicProfileCard({ userData }: EpicProfileCardProps) {
  const epicProfile = userData.epicProfile
  const playerProfile = userData.playerProfile
  const playerStats = userData.playerStats

  if (!epicProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil Epic Games</CardTitle>
          <CardDescription>Nenhuma informação da Epic Games disponível</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Card do Perfil Epic Games */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userData.photoURL || undefined} alt={epicProfile.displayName} />
              <AvatarFallback>
                {epicProfile.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{epicProfile.displayName}</CardTitle>
              <CardDescription>@{epicProfile.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>ID da Conta: {epicProfile.accountId}</span>
          </div>
          {epicProfile.country && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>País: {epicProfile.country}</span>
            </div>
          )}
          {epicProfile.preferredLanguage && (
            <div className="flex items-center gap-2 text-sm">
              <span>Idioma: {epicProfile.preferredLanguage}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Membro desde: {new Date(userData.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <Badge variant="secondary" className="w-fit">
            Conectado via Epic Games
          </Badge>
        </CardContent>
      </Card>

      {/* Card das Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Estatísticas
          </CardTitle>
          <CardDescription>Suas estatísticas de jogo</CardDescription>
        </CardHeader>
        <CardContent>
          {playerStats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{playerStats.totalMatches}</div>
                <div className="text-sm text-muted-foreground">Partidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{playerStats.wins}</div>
                <div className="text-sm text-muted-foreground">Vitórias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{playerStats.winRate}%</div>
                <div className="text-sm text-muted-foreground">Taxa de Vitória</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{playerStats.killDeathRatio}</div>
                <div className="text-sm text-muted-foreground">K/D Ratio</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhuma estatística disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card dos Times */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Times
          </CardTitle>
          <CardDescription>Times dos quais você faz parte</CardDescription>
        </CardHeader>
        <CardContent>
          {userData.playerTeams && userData.playerTeams.length > 0 ? (
            <div className="space-y-3">
              {userData.playerTeams
                .filter(team => team.isActive)
                .map((team) => (
                  <div key={team.teamId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{team.tag}</span>
                      </div>
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.role} • Desde {new Date(team.joinDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={team.role === 'Captain' ? 'default' : 'secondary'}>
                      {team.role}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Você não faz parte de nenhum time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
