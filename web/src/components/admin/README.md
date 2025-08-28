# Componentes de Administração

## StreamerStatusManager

Componente para gerenciar o status online/offline dos streamers sem depender de API externa.

### Funcionalidades

- ✅ **Visualização em Tempo Real**: Mostra status atual de todos os streamers
- ✅ **Toggle Individual**: Marcar streamer como online/offline
- ✅ **Controles em Lote**: Marcar todos como online ou offline
- ✅ **Interface Intuitiva**: Avatares, badges e indicadores visuais
- ✅ **Atualização Automática**: Sincroniza com o sistema de status

### Como Usar

#### 1. Importar o Componente

```typescript
import { StreamerStatusManager } from '@/components/admin/StreamerStatusManager'
```

#### 2. Usar na Página de Admin

```typescript
function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Painel de Administração</h1>
      <StreamerStatusManager />
    </div>
  )
}
```

#### 3. Componente Resumo (Opcional)

```typescript
import { StreamerStatusSummary } from '@/components/admin/StreamerStatusManager'

function Header() {
  return (
    <header>
      <h1>Portal</h1>
      <StreamerStatusSummary /> {/* Mostra "X de Y streamers online" */}
    </header>
  )
}
```

### Interface

O componente oferece:

1. **Header com Estatísticas**
   - Contador de streamers online/total
   - Botão de refresh
   - Badge com status geral

2. **Controles Globais**
   - Botão "Todos Online"
   - Botão "Todos Offline"

3. **Lista de Streamers**
   - Avatar com indicador de status
   - Nome e plataforma
   - Badge de status (Online/Offline)
   - Botão toggle individual
   - Timestamp da última atualização

### Exemplo de Uso Completo

```typescript
"use client"

import { StreamerStatusManager } from '@/components/admin/StreamerStatusManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminStreamersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Streamers</h1>
        <p className="text-muted-foreground">
          Gerencie o status online/offline dos streamers manualmente
        </p>
      </div>

      <StreamerStatusManager />

      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>• Use os botões individuais para alternar o status de cada streamer</p>
          <p>• Use "Todos Online/Offline" para controle em lote</p>
          <p>• O status é atualizado em tempo real em toda a aplicação</p>
          <p>• Os dados são mantidos na sessão atual</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Integração com Sistema de Status

O componente se integra automaticamente com:

- `useStreamerStatus()` - Hook principal de gerenciamento
- `useStreamers()` - Lista de streamers do Firestore
- Componentes de streaming que mostram status

### Benefícios

1. **Sem API Externa**: Funciona sem credenciais do Twitch
2. **Controle Total**: Administrador define quem está online
3. **Interface Amigável**: Fácil de usar e entender
4. **Tempo Real**: Mudanças refletem imediatamente
5. **Flexível**: Pode ser usado em qualquer página admin

### Notas Importantes

- O status é mantido apenas na sessão atual do navegador
- Para persistir status, seria necessário integrar com Firestore
- O componente é responsivo e funciona em mobile
- Todos os ícones e estilos seguem o design system do projeto

### Próximos Passos (Opcionais)

1. **Persistência**: Salvar status no Firestore
2. **Histórico**: Log de mudanças de status
3. **Permissões**: Controle de acesso por usuário
4. **Notificações**: Alertas quando streamer fica online
5. **Integração**: Webhook para atualizar status automaticamente
