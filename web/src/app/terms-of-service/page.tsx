import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Termos de Serviço | SAFEZONE',
  description: 'Nossos termos de serviço descrevem as condições de uso da plataforma SAFEZONE e integração com Epic Games.',
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Termos de Serviço</h1>
          <p className="text-muted-foreground text-lg">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Separator />

        {/* Introdução */}
        <Card>
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bem-vindo ao SAFEZONE. Ao acessar e usar nossos serviços, você concorda em cumprir 
              e estar vinculado a estes Termos de Serviço ("Termos"). Se você não concordar com 
              qualquer parte destes termos, não deve usar nossos serviços.
            </p>
            <p>
              Estes Termos se aplicam a todos os usuários, visitantes e outros que acessem ou 
              usem nossos serviços, incluindo nosso site, aplicações e integrações com plataformas 
              como Epic Games.
            </p>
          </CardContent>
        </Card>

        {/* Descrição dos Serviços */}
        <Card>
          <CardHeader>
            <CardTitle>2. Descrição dos Serviços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              O SAFEZONE é um hub da comunidade Fortnite que oferece:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Notícias e atualizações sobre Fortnite</li>
              <li>Streamers ao vivo e conteúdo de jogadores</li>
              <li>Partidas em destaque e estatísticas</li>
              <li>Torneios e eventos da comunidade</li>
              <li>Integração com contas Epic Games</li>
              <li>Perfis de jogadores e times</li>
              <li>Miniplayer para acompanhar streams</li>
            </ul>
            <p>
              Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto 
              de nossos serviços a qualquer momento, com ou sem aviso prévio.
            </p>
          </CardContent>
        </Card>

        {/* Conta e Registro */}
        <Card>
          <CardHeader>
            <CardTitle>3. Conta e Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">3.1 Criação de Conta:</h4>
              <p>
                Para acessar certos recursos, você pode precisar criar uma conta. Você é responsável 
                por manter a confidencialidade de suas credenciais de login e por todas as atividades 
                que ocorrem em sua conta.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">3.2 Integração Epic Games:</h4>
              <p>
                Ao conectar sua conta Epic Games, você autoriza o SAFEZONEa acessar e usar 
                informações da sua conta Epic Games de acordo com nossa Política de Privacidade 
                e os Termos de Serviço da Epic Games.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">3.3 Elegibilidade:</h4>
              <p>
                Você deve ter pelo menos 13 anos de idade para usar nossos serviços. Se você for 
                menor de 18 anos, deve ter o consentimento de um responsável legal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Uso Aceitável */}
        <Card>
          <CardHeader>
            <CardTitle>4. Uso Aceitável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Você concorda em usar nossos serviços apenas para propósitos legais e aceitáveis:</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold">4.1 Você NÃO deve:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Violar leis aplicáveis ou direitos de terceiros</li>
                <li>Usar nossos serviços para atividades ilegais ou fraudulentas</li>
                <li>Interferir na operação ou segurança de nossos serviços</li>
                <li>Tentar acessar contas de outros usuários sem autorização</li>
                <li>Compartilhar conteúdo ofensivo, abusivo ou inadequado</li>
                <li>Usar bots, scripts ou métodos automatizados sem permissão</li>
                <li>Violar os Termos de Serviço da Epic Games</li>
                <li>Promover cheats, hacks ou modificações não autorizadas</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">4.2 Uso Responsável:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Respeitar outros usuários e membros da comunidade</li>
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Reportar bugs ou problemas de segurança</li>
                <li>Usar recursos de forma eficiente e responsável</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>5. Conteúdo do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">5.1 Propriedade do Conteúdo:</h4>
              <p>
                Você mantém a propriedade do conteúdo que envia, posta ou compartilha em nossos 
                serviços. Ao fazer upload de conteúdo, você nos concede uma licença não exclusiva, 
                mundial e livre de royalties para usar, reproduzir e distribuir esse conteúdo.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">5.2 Responsabilidade pelo Conteúdo:</h4>
              <p>
                Você é responsável por todo o conteúdo que envia ou compartilha. Garantimos que 
                você tem todos os direitos necessários para compartilhar esse conteúdo e que ele 
                não viola direitos de terceiros.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">5.3 Moderação:</h4>
              <p>
                Reservamo-nos o direito de remover, editar ou moderar qualquer conteúdo que 
                viole estes Termos ou que consideremos inadequado, sem aviso prévio.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Propriedade Intelectual */}
        <Card>
          <CardHeader>
            <CardTitle>6. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">6.1 Nossos Direitos:</h4>
              <p>
                Todos os direitos, títulos e interesses em nossos serviços, incluindo mas não 
                se limitando a software, design, marcas registradas, patentes e conteúdo, 
                são e permanecerão nossa propriedade exclusiva.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">6.2 Licença de Uso:</h4>
              <p>
                Concedemos a você uma licença limitada, não exclusiva, não transferível e 
                revogável para usar nossos serviços de acordo com estes Termos.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">6.3 Epic Games:</h4>
              <p>
                Reconhecemos que Epic Games mantém todos os direitos sobre Fortnite e suas 
                propriedades intelectuais. Nossa integração com Epic Games é feita em 
                conformidade com seus Termos de Serviço e Políticas de Desenvolvedor.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacidade */}
        <Card>
          <CardHeader>
            <CardTitle>7. Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Sua privacidade é importante para nós. Nossa coleta, uso e proteção de suas 
              informações pessoais são regidos por nossa Política de Privacidade, que faz 
              parte destes Termos.
            </p>
            <p>
              Ao usar nossos serviços, você concorda com nossa coleta e uso de informações 
              conforme descrito em nossa Política de Privacidade.
            </p>
          </CardContent>
        </Card>

        {/* Limitação de Responsabilidade */}
        <Card>
          <CardHeader>
            <CardTitle>8. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">8.1 Exclusão de Garantias:</h4>
              <p>
                Nossos serviços são fornecidos "como estão" e "conforme disponível", sem 
                garantias de qualquer tipo, expressas ou implícitas.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">8.2 Limitação de Danos:</h4>
              <p>
                Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, 
                especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou 
                uso, incorridos por você ou qualquer terceiro.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">8.3 Responsabilidade Máxima:</h4>
              <p>
                Nossa responsabilidade total para com você por qualquer reclamação não 
                excederá o valor pago por você pelos serviços nos 12 meses anteriores.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Indenização */}
        <Card>
          <CardHeader>
            <CardTitle>9. Indenização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Você concorda em indenizar, defender e isentar o SAFEZONE, seus diretores, 
              funcionários e agentes de qualquer reclamação, dano, perda ou despesa (incluindo 
              honorários advocatícios) decorrentes de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Seu uso de nossos serviços</li>
              <li>Violation destes Termos</li>
              <li>Conteúdo que você envia ou compartilha</li>
              <li>Violation de direitos de terceiros</li>
              <li>Uso não autorizado de sua conta</li>
            </ul>
          </CardContent>
        </Card>

        {/* Rescisão */}
        <Card>
          <CardHeader>
            <CardTitle>10. Rescisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">10.1 Rescisão por Você:</h4>
              <p>
                Você pode encerrar sua conta a qualquer momento, entrando em contato conosco 
                ou usando as opções de cancelamento disponíveis em sua conta.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">10.2 Rescisão por Nós:</h4>
              <p>
                Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, 
                se você violar estes Termos ou se considerarmos necessário por qualquer motivo.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">10.3 Efeitos da Rescisão:</h4>
              <p>
                Após a rescisão, você não terá mais acesso aos serviços e podemos excluir 
                sua conta e dados relacionados, conforme nossa Política de Privacidade.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lei Aplicável */}
        <Card>
          <CardHeader>
            <CardTitle>11. Lei Aplicável e Jurisdição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Estes Termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida 
              nos tribunais competentes do Brasil, a menos que a lei aplicável exija o contrário.
            </p>
            <p>
              Se você estiver localizado fora do Brasil, pode estar sujeito a leis adicionais 
              ou diferentes em sua jurisdição.
            </p>
          </CardContent>
        </Card>

        {/* Disposições Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>12. Disposições Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">12.1 Acordo Completo:</h4>
              <p>
                Estes Termos constituem o acordo completo entre você e o SAFEZONE em relação 
                ao uso de nossos serviços.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">12.2 Renúncia:</h4>
              <p>
                Nossa falha em fazer valer qualquer disposição destes Termos não constitui 
                uma renúncia a essa disposição.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">12.3 Divisibilidade:</h4>
              <p>
                Se qualquer disposição destes Termos for considerada inválida, as demais 
                disposições permanecerão em pleno vigor e efeito.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">12.4 Alterações:</h4>
              <p>
                Podemos modificar estes Termos a qualquer momento. Notificaremos você sobre 
                mudanças significativas através de nosso site ou por email.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>13. Entre em Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> legal@fortnitesz.online</p>
            </div>
            <p>
              Para questões relacionadas à integração com Epic Games, você também pode 
              consultar os Termos de Serviço da Epic Games em: 
              <a href="https://www.epicgames.com/site/pt-BR/tos" className="text-primary hover:underline ml-1">
                https://www.epicgames.com/site/pt-BR/tos
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>
            Estes termos estão em conformidade com as diretrizes da Epic Games 
            e com as leis brasileiras aplicáveis.
          </p>
        </div>
      </div>
    </div>
  )
}
