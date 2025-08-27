import { Metadata } from 'next'
import { TeamPageClient } from './TeamPageClient'

export const metadata: Metadata = {
  title: 'Gerenciar Time | SZ - Fortnite Ballistic',
}

export default function TeamPage() {
  return <TeamPageClient />
}