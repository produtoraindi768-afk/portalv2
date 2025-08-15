# Política de Privacidade - ProjetoSIA

## Visão Geral

Esta página de Política de Privacidade foi criada para estar em conformidade com os requisitos da Epic Games e com as leis de proteção de dados aplicáveis.

## Características da Página

### 📍 Localização
- **URL**: `/privacy-policy`
- **Arquivo**: `web/src/app/privacy-policy/page.tsx`
- **Layout**: `web/src/app/privacy-policy/layout.tsx`

### 🎨 Design
- Utiliza componentes shadcn/ui para consistência visual
- Layout responsivo e acessível
- Estrutura clara com cards organizados por seções
- Tipografia hierárquica para melhor legibilidade

### 📋 Seções Incluídas

1. **Introdução** - Visão geral da política
2. **Informações que Coletamos** - Detalhamento dos dados coletados
3. **Como Usamos Suas Informações** - Propósitos do uso dos dados
4. **Compartilhamento de Informações** - Quando e como compartilhamos dados
5. **Cookies e Tecnologias Similares** - Uso de cookies e controles
6. **Segurança dos Dados** - Medidas de proteção implementadas
7. **Retenção de Dados** - Período de armazenamento
8. **Seus Direitos** - Direitos do usuário (LGPD/GDPR)
9. **Transferências Internacionais** - Transferência de dados entre países
10. **Proteção de Crianças** - Conformidade com COPPA
11. **Alterações nesta Política** - Processo de atualização
12. **Entre em Contato** - Informações de contato

### 🔗 Navegação
- Link adicionado no footer do site
- Acessível através de `/privacy-policy`
- Integrado com o sistema de navegação existente

## Conformidade Legal

### ✅ Epic Games
- Menciona especificamente a integração com Epic Games
- Explica o compartilhamento de dados com a plataforma
- Inclui seção sobre proteção de crianças (COPPA)

### ✅ LGPD (Lei Geral de Proteção de Dados)
- Direitos do usuário claramente definidos
- Base legal para processamento de dados
- Informações sobre DPO (Data Protection Officer)

### ✅ GDPR (Regulamento Geral de Proteção de Dados)
- Transferências internacionais de dados
- Direitos de portabilidade e exclusão
- Consentimento explícito

## Personalização Necessária

Antes de usar em produção, atualize:

1. **Informações de Contato**:
   - Email: `privacy@projetosia.com`
   - DPO: `dpo@projetosia.com`
   - Endereço físico da empresa
   - Número de telefone

2. **Detalhes Específicos**:
   - Nome exato da empresa
   - Jurisdição legal
   - Políticas específicas de retenção
   - Provedores de serviços utilizados

3. **Integrações**:
   - Detalhes específicos sobre integração com Epic Games
   - Outras plataformas de terceiros
   - APIs e serviços externos

## Manutenção

### Atualizações Regulares
- Revisar a política trimestralmente
- Atualizar a data de "Última atualização"
- Verificar conformidade com novas regulamentações

### Monitoramento
- Acompanhar mudanças nas políticas da Epic Games
- Verificar atualizações na LGPD e GDPR
- Manter documentação de compliance atualizada

## Testes

Para testar a página:

```bash
cd web
npm run dev
```

Acesse: `http://localhost:3000/privacy-policy`

## Estrutura de Arquivos

```
web/src/app/privacy-policy/
├── page.tsx          # Página principal
└── layout.tsx        # Layout específico

web/src/components/layout/
└── FooterSection.tsx # Link adicionado no footer
```

## Notas Importantes

- A política está em português brasileiro
- Inclui todas as seções necessárias para conformidade
- Design responsivo e acessível
- Integrada com o sistema de design existente
- Pronta para personalização com dados específicos da empresa
