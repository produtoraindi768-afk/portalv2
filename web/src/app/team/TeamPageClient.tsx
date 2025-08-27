'use client'

import { TeamManagement } from '@/components/team/TeamManagement'

// Mock user para teste
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User'
}

export function TeamPageClient() {
  return (
    <div className="min-h-screen bg-background">
      <TeamManagement user={mockUser} />
    </div>
  )
}