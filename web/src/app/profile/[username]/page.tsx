import { PlayerProfile } from '@/components/profile/PlayerProfile'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  return <PlayerProfile username={username} />
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  return {
    title: `Perfil de ${username} - Fortnite Hub`,
    description: `Veja as estatísticas, partidas e histórico de equipes de ${username}`,
  }
}