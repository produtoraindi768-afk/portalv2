import { PlayerProfile } from '@/components/profile/PlayerProfile'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <PlayerProfile username={params.username} />
}

export function generateMetadata({ params }: ProfilePageProps) {
  return {
    title: `Perfil de ${params.username} - Fortnite Hub`,
    description: `Veja as estatísticas, partidas e histórico de equipes de ${params.username}`,
  }
}