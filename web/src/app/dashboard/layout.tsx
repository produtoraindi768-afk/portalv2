import { DashboardPageLayout } from "@/components/layout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardPageLayout showHeader={false}>
      {children}
    </DashboardPageLayout>
  )
}


