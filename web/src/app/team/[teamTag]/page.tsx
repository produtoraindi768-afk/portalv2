import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TeamProfile } from '@/components/team/TeamProfile'
import { firestoreHelpers } from '@/lib/firestore-helpers'

interface TeamPageProps {
  params: Promise<{
    teamTag: string
  }>
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { teamTag } = await params

  try {
    const teamResult = await firestoreHelpers.getTeamByTag(teamTag)
    
    if (!teamResult || teamResult.docs.length === 0) {
      return {
        title: 'Equipe não encontrada - Fortnite Ballistic Hub',
        description: 'A equipe solicitada não existe ou foi removida.'
      }
    }

    const teamData = teamResult.docs[0].data()

    return {
      title: `${teamData.name} (${teamData.tag}) - Fortnite Ballistic Hub`,
      description: teamData.description || `Perfil da equipe ${teamData.name} no Fortnite Ballistic Hub`,
      keywords: [
        'fortnite ballistic',
        'team profile',
        'esports',
        teamData.name,
        teamData.tag,
        teamData.region || 'brasil'
      ],
      openGraph: {
        title: `${teamData.name} (${teamData.tag})`,
        description: teamData.description || `Perfil da equipe ${teamData.name}`,
        type: 'profile',
        images: teamData.avatar ? [
          {
            url: teamData.avatar,
            width: 400,
            height: 400,
            alt: `Logo da equipe ${teamData.name}`
          }
        ] : undefined
      },
      twitter: {
        card: 'summary',
        title: `${teamData.name} (${teamData.tag})`,
        description: teamData.description || `Perfil da equipe ${teamData.name}`,
        images: teamData.avatar ? [teamData.avatar] : undefined
      }
    }
  } catch (error) {
    console.error('Error generating metadata for team:', error)
    return {
      title: 'Erro - Fortnite Ballistic Hub',
      description: 'Erro ao carregar informações da equipe'
    }
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamTag } = await params

  // Validar se o teamTag tem um formato válido
  if (!teamTag || teamTag.length < 2 || teamTag.length > 10) {
    notFound()
  }

  try {
    // Verificar se a equipe existe antes de renderizar
    const teamResult = await firestoreHelpers.getTeamByTag(teamTag)
    
    if (!teamResult || teamResult.docs.length === 0) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-background">
        <TeamProfile teamTag={teamTag} />
      </div>
    )
  } catch (error) {
    console.error('Error loading team page:', error)
    notFound()
  }
}

// Gerar rotas estáticas para equipes populares (opcional)
export async function generateStaticParams() {
  try {
    // Buscar algumas equipes populares para pre-renderizar
    const popularTeams = ['ALPHA', 'BETA', 'GAMMA', 'DELTA']
    
    return popularTeams.map((tag) => ({
      teamTag: tag
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}