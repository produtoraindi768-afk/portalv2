import { Suspense } from 'react'
import { Metadata } from 'next'
import { MatchesContent } from '@/components/matches/MatchesContent'
import { Skeleton } from '@/components/ui/skeleton'
import { PageLayout, ContentWrapper } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Partidas | SZ - Fortnite Ballistic',
}

function MatchesLoadingSkeleton() {
  return (
    <PageLayout 
      pattern="wide" 
      title="Partidas"
      description="Acompanhe todas as partidas dos torneios em tempo real"
    >
      <ContentWrapper layout="stack" gap="spacious">
        {/* Skeleton para seções */}
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <ContentWrapper layout="grid-3" gap="normal">
              {[1, 2, 3].map((card) => (
                <div key={card} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-12" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </ContentWrapper>
          </div>
        ))}
      </ContentWrapper>
    </PageLayout>
  )
}

export default function MatchesPage() {
  return <MatchesContent />
}