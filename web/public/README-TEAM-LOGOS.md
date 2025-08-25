# 🏆 Guia de Importação de Logos dos Times Firebase

Este guia mostra como importar e usar as **logoUrl** dos times da coleção `battlefy_teams` do Firebase em outros portais e aplicações.

## 📁 Arquivos de Exemplo

### 1. `team-logo-import-example.js`
**Funções principais para importação dos dados**
- `getTeamsWithLogos()` - Busca todos os times com suas logos
- `getTeamById(teamId)` - Busca um time específico
- `getTeamsByTournament(tournamentId)` - Busca times de um torneio
- `TeamLogoExample()` - Componente React de exemplo

### 2. `team-logo-usage-examples.js`
**Exemplos avançados de uso**
- `TeamSelector` - Dropdown de seleção de times
- `TeamCard` - Card detalhado de time
- `useTeamLogos()` - Hook personalizado React
- `TeamsGallery` - Galeria paginada de times
- `TeamLogoCache` - Sistema de cache para logos
- `downloadTeamLogos()` - Download em lote das logos

### 3. `team-logo-vanilla-example.html`
**Portal completo em HTML/JavaScript vanilla**
- Interface visual completa
- Filtros por torneio e busca
- Paginação
- Estatísticas
- Exportação para CSV

## 🚀 Como Usar

### Configuração Inicial

1. **Configure o Firebase** em todos os arquivos:
```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id"
};
```

2. **Instale as dependências** (para projetos React/Node.js):
```bash
npm install firebase
```

### Uso Básico - React

```jsx
import { getTeamsWithLogos } from './examples/team-logo-import-example.js';

function MeuComponente() {
  const [teams, setTeams] = useState([]);
  
  useEffect(() => {
    async function loadTeams() {
      const teamsData = await getTeamsWithLogos();
      setTeams(teamsData);
    }
    loadTeams();
  }, []);
  
  return (
    <div>
      {teams.map(team => (
        <div key={team.id}>
          {team.logoUrl && (
            <img src={team.logoUrl} alt={team.name} />
          )}
          <h3>{team.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Uso com Hook Personalizado

```jsx
import { useTeamLogos } from './examples/team-logo-usage-examples.js';

function MeuComponente({ tournamentId }) {
  const { teams, loading, error, refreshTeams } = useTeamLogos(tournamentId);
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <div>
      <button onClick={refreshTeams}>Atualizar</button>
      {teams.map(team => (
        <div key={team.id}>
          <img src={team.logoUrl || '/default-logo.png'} alt={team.name} />
          <h3>{team.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Uso em JavaScript Vanilla

Abra o arquivo `team-logo-vanilla-example.html` em um navegador e:
1. Configure suas credenciais do Firebase no script
2. Clique em "Carregar Times"
3. Use os filtros para encontrar times específicos
4. Exporte os dados se necessário

## 📊 Estrutura dos Dados

Cada time retornado possui a seguinte estrutura:

```javascript
{
  id: "documento-id-firebase",
  battlefyId: "id-original-battlefy",
  name: "Nome do Time",
  logoUrl: "https://url-da-logo.com/logo.png", // ou null
  tournamentId: "id-do-torneio",
  importedAt: "2025-01-XX...",
  updatedAt: "2025-01-XX..."
}
```

## 🎨 Personalização de CSS

### Estilos para Logos

```css
.team-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
}

.team-logo-placeholder {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.team-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}
```

## 🔧 Funcionalidades Avançadas

### Cache de Logos

```javascript
import { teamLogoCache } from './examples/team-logo-usage-examples.js';

// Usar cache para melhor performance
const logoData = await teamLogoCache.getTeamLogo('team-id');
if (logoData) {
  console.log('Logo URL:', logoData.logoUrl);
}
```

### Sincronização com API Externa

```javascript
import { syncTeamLogosToExternalAPI } from './examples/team-logo-usage-examples.js';

// Sincronizar com sua API
try {
  const result = await syncTeamLogosToExternalAPI();
  console.log('Sincronização concluída:', result);
} catch (error) {
  console.error('Erro na sincronização:', error);
}
```

### Relatório de Times

```javascript
import { generateTeamsReport } from './examples/team-logo-usage-examples.js';

// Gerar relatório completo
const report = await generateTeamsReport();
console.log(`Total de times: ${report.total_teams}`);
console.log(`Times com logo: ${report.teams_with_logo}`);
console.log(`Times sem logo: ${report.teams_without_logo}`);
```

## 🛠️ Tratamento de Erros

### Fallback para Logos

```jsx
<img 
  src={team.logoUrl} 
  alt={team.name}
  onError={(e) => {
    // Fallback 1: Imagem padrão
    e.target.src = '/default-team-logo.png';
    
    // Fallback 2: Ocultar e mostrar placeholder
    // e.target.style.display = 'none';
    // e.target.nextSibling.style.display = 'flex';
  }}
/>
```

### Validação de URLs

```javascript
function isValidImageUrl(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Usar na renderização
const logoUrl = isValidImageUrl(team.logoUrl) ? team.logoUrl : null;
```

## 📱 Responsividade

### Grid Responsivo

```css
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .teams-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .team-logo {
    width: 48px;
    height: 48px;
  }
}
```

## 🔍 Filtros e Busca

### Filtro por Múltiplos Critérios

```javascript
function filterTeams(teams, filters) {
  return teams.filter(team => {
    // Filtro por torneio
    if (filters.tournamentId && team.tournamentId !== filters.tournamentId) {
      return false;
    }
    
    // Filtro por nome
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!team.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Filtro por presença de logo
    if (filters.hasLogo !== undefined) {
      if (filters.hasLogo && !team.logoUrl) return false;
      if (!filters.hasLogo && team.logoUrl) return false;
    }
    
    return true;
  });
}
```

## 📈 Performance

### Lazy Loading de Imagens

```jsx
<img 
  src={team.logoUrl}
  alt={team.name}
  loading="lazy"
  className="team-logo"
/>
```

### Paginação Eficiente

```javascript
function paginateTeams(teams, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    items: teams.slice(startIndex, endIndex),
    totalPages: Math.ceil(teams.length / itemsPerPage),
    currentPage: page,
    totalItems: teams.length
  };
}
```

## 🚨 Considerações Importantes

1. **Segurança**: Nunca exponha suas credenciais do Firebase no frontend
2. **Performance**: Use cache e lazy loading para logos
3. **Fallbacks**: Sempre tenha uma imagem padrão ou placeholder
4. **Validação**: Valide URLs antes de usar
5. **Responsividade**: Teste em diferentes tamanhos de tela

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se as credenciais do Firebase estão corretas
2. Confirme se a coleção `battlefy_teams` existe
3. Verifique se os dados têm a estrutura esperada
4. Teste a conectividade com o Firebase

---

**Exemplo criado para importação de logos dos times do Firebase Battlefy Teams** 🏆