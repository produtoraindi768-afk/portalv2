import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Política de Privacidade | SAFEZONE',
  description: 'Nossa política de privacidade descreve como coletamos, usamos e protegemos suas informações pessoais.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Política de Privacidade</h1>
          <p className="text-muted-foreground text-lg">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Separator />

        {/* Introdução */}
        <Card>
          <CardHeader>
            <CardTitle>1. Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bem-vindo ao SAFEZONE. Esta Política de Privacidade descreve como coletamos, usamos, 
              armazenamos e protegemos suas informações pessoais quando você utiliza nossos serviços, 
              incluindo nosso site, aplicações e integrações com plataformas como Epic Games.
            </p>
            <p>
              Ao usar nossos serviços, você concorda com a coleta e uso de informações de acordo com 
              esta política. Suas informações pessoais são usadas para fornecer e melhorar nossos serviços.
            </p>
          </CardContent>
        </Card>

        {/* Informações que Coletamos */}
        <Card>
          <CardHeader>
            <CardTitle>2. Informações que Coletamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">2.1 Informações que você nos fornece:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Informações de conta (nome de usuário, email, senha)</li>
                <li>Perfil do Epic Games (quando conectado)</li>
                <li>Informações de perfil e preferências</li>
                <li>Comunicações conosco</li>
                <li>Conteúdo que você envia ou compartilha</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">2.2 Informações coletadas automaticamente:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dados de uso e analytics</li>
                <li>Informações do dispositivo e navegador</li>
                <li>Endereço IP e localização aproximada</li>
                <li>Cookies e tecnologias similares</li>
                <li>Logs de servidor e dados de performance</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">2.3 Informações de terceiros:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dados do Epic Games (quando autorizado)</li>
                <li>Informações de redes sociais (quando conectado)</li>
                <li>Dados de parceiros e provedores de serviços</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Como Usamos Suas Informações */}
        <Card>
          <CardHeader>
            <CardTitle>3. Como Usamos Suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Usamos suas informações pessoais para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar transações e gerenciar sua conta</li>
              <li>Personalizar sua experiência e conteúdo</li>
              <li>Comunicar com você sobre nossos serviços</li>
              <li>Detectar e prevenir fraudes e abusos</li>
              <li>Cumprir obrigações legais e regulamentares</li>
              <li>Conduzir pesquisas e análises</li>
              <li>Integrar com plataformas como Epic Games</li>
            </ul>
          </CardContent>
        </Card>

        {/* Compartilhamento de Informações */}
        <Card>
          <CardHeader>
            <CardTitle>4. Compartilhamento de Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Podemos compartilhar suas informações nas seguintes situações:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Com seu consentimento:</strong> Quando você autorizar explicitamente</li>
              <li><strong>Provedores de serviços:</strong> Empresas que nos ajudam a operar nossos serviços</li>
              <li><strong>Epic Games:</strong> Para integração de serviços quando autorizado</li>
              <li><strong>Requisitos legais:</strong> Quando exigido por lei ou processo legal</li>
              <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos e segurança</li>
              <li><strong>Fusão ou aquisição:</strong> Em caso de mudança de controle da empresa</li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies e Tecnologias Similares */}
        <Card>
          <CardHeader>
            <CardTitle>5. Cookies e Tecnologias Similares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
              analisar o uso do site e personalizar conteúdo.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold">Tipos de cookies que usamos:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Cookies essenciais:</strong> Necessários para o funcionamento básico do site</li>
                <li><strong>Cookies de performance:</strong> Para analisar como o site é usado</li>
                <li><strong>Cookies de funcionalidade:</strong> Para lembrar suas preferências</li>
                <li><strong>Cookies de marketing:</strong> Para personalizar anúncios e conteúdo</li>
              </ul>
            </div>
            <p>
              Você pode controlar o uso de cookies através das configurações do seu navegador. 
              No entanto, desabilitar certos cookies pode afetar a funcionalidade do site.
            </p>
          </CardContent>
        </Card>

        {/* Segurança dos Dados */}
        <Card>
          <CardHeader>
            <CardTitle>6. Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
              proteger suas informações pessoais contra acesso não autorizado, alteração, 
              divulgação ou destruição.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e seguros</li>
              <li>Treinamento de funcionários em segurança</li>
            </ul>
          </CardContent>
        </Card>

        {/* Retenção de Dados */}
        <Card>
          <CardHeader>
            <CardTitle>7. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir 
              os propósitos descritos nesta política, a menos que um período de retenção 
              mais longo seja exigido ou permitido por lei.
            </p>
            <p>
              Quando não precisarmos mais de suas informações pessoais, as excluiremos 
              ou anonimizaremos de forma segura.
            </p>
          </CardContent>
        </Card>

        {/* Seus Direitos */}
        <Card>
          <CardHeader>
            <CardTitle>8. Seus Direitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Você tem os seguintes direitos relacionados às suas informações pessoais:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Acesso:</strong> Solicitar informações sobre os dados que temos sobre você</li>
              <li><strong>Correção:</strong> Solicitar correção de dados imprecisos ou incompletos</li>
              <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
              <li><strong>Restrição:</strong> Solicitar limitação do processamento</li>
              <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
            </ul>
            <p>
              Para exercer esses direitos, entre em contato conosco através dos canais 
              fornecidos no final desta política.
            </p>
          </CardContent>
        </Card>

        {/* Transferências Internacionais */}
        <Card>
          <CardHeader>
            <CardTitle>9. Transferências Internacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Suas informações podem ser transferidas e processadas em países diferentes 
              do seu país de residência. Garantimos que essas transferências são feitas 
              de acordo com as leis de proteção de dados aplicáveis.
            </p>
            <p>
              Quando transferimos dados para países que não oferecem o mesmo nível de 
              proteção, implementamos salvaguardas apropriadas, como cláusulas contratuais 
              padrão aprovadas pela autoridade de proteção de dados.
            </p>
          </CardContent>
        </Card>

        {/* Crianças */}
        <Card>
          <CardHeader>
            <CardTitle>10. Proteção de Crianças</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Nossos serviços não são destinados a crianças menores de 13 anos. 
              Não coletamos intencionalmente informações pessoais de crianças menores de 13 anos.
            </p>
            <p>
              Se você é pai ou responsável e acredita que seu filho nos forneceu 
              informações pessoais, entre em contato conosco imediatamente.
            </p>
            <p>
              Para usuários entre 13 e 18 anos, recomendamos que um responsável 
              revise esta política e supervisione o uso de nossos serviços.
            </p>
          </CardContent>
        </Card>

        {/* Alterações na Política */}
        <Card>
          <CardHeader>
            <CardTitle>11. Alterações nesta Política</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. 
              Notificaremos você sobre mudanças significativas através de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Notificação por email</li>
              <li>Aviso em nosso site</li>
              <li>Atualização da data "Última atualização"</li>
            </ul>
            <p>
              Recomendamos que você revise esta política regularmente para se manter 
              informado sobre como protegemos suas informações.
            </p>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>12. Entre em Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre 
              como tratamos suas informações pessoais, entre em contato conosco:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> privacy@fortnitesz.online</p>
            </div>
            <p>
              Para questões relacionadas à proteção de dados, você também pode 
              entrar em contato com nossa equipe de proteção de dados em: 
              dpo@fortnitesz.online
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          <p>
            Esta política está em conformidade com as diretrizes da Epic Games 
            e com as leis de proteção de dados aplicáveis.
          </p>
        </div>
      </div>
    </div>
  )
}
