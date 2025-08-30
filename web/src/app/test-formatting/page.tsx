import { TextFormattingDemo } from '@/components/demo/TextFormattingDemo'
import { PageLayout } from '@/components/layout'

export default function TestFormattingPage() {
  return (
    <PageLayout 
      title="Teste de Formatação Inteligente"
      description="Página para testar se a formatação inteligente está funcionando corretamente"
      pattern="narrow"
    >
      <TextFormattingDemo />
    </PageLayout>
  )
}