'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { firestoreHelpers } from '@/lib/firestore-helpers'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, UserPlus, Users, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  uid: string
  email?: string
  displayName?: string
}

interface Team {
  id: string
  name: string
  tag: string
  game: string
  region: string
  description: string
  members: string[]
  captain: string
  contactEmail: string
  discordServer: string
  avatar: string
  isActive: boolean
}

interface TeamManagementProps {
  user: User
  existingTeam?: Team
}

export function TeamManagement({ user, existingTeam }: TeamManagementProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [team, setTeam] = useState<Team | null>(existingTeam || null)
  const [showCreateForm, setShowCreateForm] = useState(!existingTeam)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: existingTeam?.name || '',
    tag: existingTeam?.tag || '',
    game: existingTeam?.game || 'Fortnite: Ballistic',
    region: existingTeam?.region || 'BR',
    description: existingTeam?.description || '',
    contactEmail: existingTeam?.contactEmail || '',
    discordServer: existingTeam?.discordServer || '',
    avatar: existingTeam?.avatar || ''
  })

  const [inviteEmail, setInviteEmail] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = async () => {
    const newErrors: Record<string, string> = {}

    // Validações básicas
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da equipe é obrigatório'
    }

    if (!formData.tag.trim()) {
      newErrors.tag = 'Tag da equipe é obrigatória'
    } else if (!/^[A-Z]+$/.test(formData.tag)) {
      newErrors.tag = 'Tag deve conter apenas letras maiúsculas'
    } else {
      // Verificar se tag já existe
      const existingTeams = await firestoreHelpers.getTeamByTag(formData.tag)
      if (existingTeams && !existingTeams.empty) {
        const teamExists = existingTeams.docs.some(doc => doc.id !== existingTeam?.id)
        if (teamExists) {
          newErrors.tag = 'Esta tag já está em uso'
        }
      }
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleCreateTeam = async () => {
    setIsLoading(true)
    
    const isValid = await validateForm()
    if (!isValid) {
      setIsLoading(false)
      return
    }

    try {
      const teamData = {
        ...formData,
        members: [user.uid],
        captain: user.uid,
        isActive: true
      }

      const docRef = await firestoreHelpers.createTeam(teamData)
      
      if (docRef) {
        toast.success('Equipe criada com sucesso!')
        setTeam({
          id: docRef.id,
          ...teamData
        })
        setShowCreateForm(false)
      } else {
        throw new Error('Falha ao criar equipe')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      toast.error('Erro ao criar equipe')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!team || !newMemberName.trim()) return

    setIsLoading(true)
    try {
      const updatedMembers = [...team.members, newMemberName.trim()]
      const success = await firestoreHelpers.updateTeamMembers(team.id, updatedMembers)
      
      if (success) {
        setTeam({ ...team, members: updatedMembers })
        setNewMemberName('')
        setShowAddMemberDialog(false)
        toast.success('Membro adicionado com sucesso!')
      } else {
        throw new Error('Falha ao adicionar membro')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Erro ao adicionar membro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberToRemove: string) => {
    if (!team || memberToRemove === team.captain) return

    setIsLoading(true)
    try {
      const updatedMembers = team.members.filter(member => member !== memberToRemove)
      const success = await firestoreHelpers.updateTeamMembers(team.id, updatedMembers)
      
      if (success) {
        setTeam({ ...team, members: updatedMembers })
        toast.success('Membro removido com sucesso!')
      } else {
        throw new Error('Falha ao remover membro')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Erro ao remover membro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!validateEmail(inviteEmail)) {
      setErrors({ invite: 'Email inválido' })
      return
    }

    // Simular envio de convite (aqui você implementaria o envio real)
    toast.success('Convite enviado com sucesso!')
    setInviteEmail('')
    setShowInviteDialog(false)
  }

  const isCaptain = team?.captain === user.uid

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Equipe</h1>
        <p className="text-muted-foreground">
          {existingTeam ? 'Gerencie sua equipe e membros' : 'Crie uma nova equipe para competir'}
        </p>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Nova Equipe</CardTitle>
            <CardDescription>
              Preencha as informações para criar sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome da Equipe</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Equipe Alpha"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tag">Tag da Equipe</Label>
                <Input
                  id="tag"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                  placeholder="Ex: ALPHA"
                  maxLength={10}
                />
                {errors.tag && (
                  <p className="text-sm text-destructive mt-1">{errors.tag}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="game">Jogo</Label>
                <Select value={formData.game} onValueChange={(value: string) => setFormData({ ...formData, game: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o jogo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fortnite: Ballistic">Fortnite: Ballistic</SelectItem>
                    <SelectItem value="Valorant">Valorant</SelectItem>
                    <SelectItem value="CS2">Counter-Strike 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="region">Região</Label>
                <Select value={formData.region} onValueChange={(value: string) => setFormData({ ...formData, region: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="NA">América do Norte</SelectItem>
                    <SelectItem value="EU">Europa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva sua equipe..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Email de Contato</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contato@equipe.com"
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive mt-1">{errors.contactEmail}</p>
              )}
            </div>

            <Button onClick={handleCreateTeam} disabled={isLoading} className="w-full">
              {isLoading ? 'Criando...' : 'Criar Equipe'}
            </Button>
          </CardContent>
        </Card>
      )}

      {team && !showCreateForm && (
        <>
          {/* Team Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {team.name}
                <Badge variant="secondary">{team.tag}</Badge>
              </CardTitle>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Jogo:</span> {team.game}
                </div>
                <div>
                  <span className="font-medium">Região:</span> {team.region}
                </div>
                <div>
                  <span className="font-medium">Membros:</span> {team.members.length}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={team.isActive ? 'default' : 'secondary'}>
                    {team.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Membros da Equipe</CardTitle>
                <div className="flex gap-2">
                  {isCaptain && (
                    <>
                      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Enviar Convite
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enviar Convite</DialogTitle>
                            <DialogDescription>
                              Envie um convite por email para um jogador se juntar à equipe
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="inviteEmail">Email do Jogador</Label>
                              <Input
                                id="inviteEmail"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="jogador@example.com"
                              />
                              {errors.invite && (
                                <p className="text-sm text-destructive mt-1">{errors.invite}</p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleSendInvite}>Enviar Convite</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">Adicionar Membro</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Novo Membro</DialogTitle>
                            <DialogDescription>
                              Adicione um membro diretamente à equipe
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="memberName">ID/Nome do Membro</Label>
                              <Input
                                id="memberName"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Nome do jogador"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddMember} disabled={!newMemberName.trim()}>
                              Adicionar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {team.members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member}</span>
                      {member === team.captain && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Capitão
                        </Badge>
                      )}
                    </div>
                    {isCaptain && member !== team.captain && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member)}
                        disabled={isLoading}
                        aria-label="Remover membro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}