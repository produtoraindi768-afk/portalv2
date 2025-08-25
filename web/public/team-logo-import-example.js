// 🏆 Exemplo de Importação de Logos dos Times Firebase
// Este arquivo contém funções para importar logoUrl da coleção battlefy_teams

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Busca todos os times com suas logos da coleção battlefy_teams
 * @returns {Promise<Array>} Array de times com logoUrl
 */
export async function getTeamsWithLogos() {
  try {
    const teamsCollection = collection(db, 'battlefy_teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    
    const teams = [];
    teamsSnapshot.forEach(doc => {
      const teamData = doc.data();
      
      // Extrair logoUrl do rawData
      let logoUrl = null;
      if (teamData.rawData && typeof teamData.rawData === 'object') {
        // Priorizar rawData.persistentTeam.logoUrl (estrutura real do Battlefy)
        if (teamData.rawData.persistentTeam && teamData.rawData.persistentTeam.logoUrl) {
          logoUrl = teamData.rawData.persistentTeam.logoUrl;
        } else {
          // Fallback para outras possíveis estruturas
          // Priorizar rawData.persistentTeam.logoUrl (estrutura real do Battlefy)
        if (teamData.rawData.persistentTeam && teamData.rawData.persistentTeam.logoUrl) {
          logoUrl = teamData.rawData.persistentTeam.logoUrl;
        } else {
          // Fallback para outras possíveis estruturas
          logoUrl = teamData.rawData.logoUrl || teamData.rawData.logo;
        }
        }
      }
      
      teams.push({
        id: doc.id,
        battlefyId: teamData.battlefyId,
        name: teamData.name,
        logoUrl: logoUrl,
        tournamentId: teamData.tournamentId,
        importedAt: teamData.importedAt,
        updatedAt: teamData.updatedAt
      });
    });
    
    return teams;
  } catch (error) {
    console.error('Erro ao buscar times:', error);
    return [];
  }
}

/**
 * Busca um time específico pelo ID
 * @param {string} teamId - ID do documento do time
 * @returns {Promise<Object|null>} Dados do time ou null
 */
export async function getTeamById(teamId) {
  try {
    const teamDoc = doc(db, 'battlefy_teams', teamId);
    const teamSnapshot = await getDoc(teamDoc);
    
    if (teamSnapshot.exists()) {
      const teamData = teamSnapshot.data();
      
      // Extrair logoUrl do rawData
      let logoUrl = null;
      if (teamData.rawData && typeof teamData.rawData === 'object') {
        // Priorizar rawData.persistentTeam.logoUrl (estrutura real do Battlefy)
        if (teamData.rawData.persistentTeam && teamData.rawData.persistentTeam.logoUrl) {
          logoUrl = teamData.rawData.persistentTeam.logoUrl;
        } else {
          // Fallback para outras possíveis estruturas
          logoUrl = teamData.rawData.logoUrl || teamData.rawData.logo;
        }
      }
      
      return {
        id: teamSnapshot.id,
        battlefyId: teamData.battlefyId,
        name: teamData.name,
        logoUrl: logoUrl,
        tournamentId: teamData.tournamentId,
        importedAt: teamData.importedAt,
        updatedAt: teamData.updatedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar time:', error);
    return null;
  }
}

/**
 * Busca times de um torneio específico
 * @param {string} tournamentId - ID do torneio
 * @returns {Promise<Array>} Array de times do torneio
 */
export async function getTeamsByTournament(tournamentId) {
  try {
    const teamsCollection = collection(db, 'battlefy_teams');
    const q = query(teamsCollection, where('tournamentId', '==', tournamentId));
    const teamsSnapshot = await getDocs(q);
    
    const teams = [];
    teamsSnapshot.forEach(doc => {
      const teamData = doc.data();
      
      // Extrair logoUrl do rawData
      let logoUrl = null;
      if (teamData.rawData && typeof teamData.rawData === 'object') {
        logoUrl = teamData.rawData.logoUrl || teamData.rawData.logo;
      }
      
      teams.push({
        id: doc.id,
        battlefyId: teamData.battlefyId,
        name: teamData.name,
        logoUrl: logoUrl,
        tournamentId: teamData.tournamentId,
        importedAt: teamData.importedAt,
        updatedAt: teamData.updatedAt
      });
    });
    
    return teams;
  } catch (error) {
    console.error('Erro ao buscar times do torneio:', error);
    return [];
  }
}

/**
 * Componente React de exemplo para exibir logos dos times
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Componente React
 */
export function TeamLogoExample({ tournamentId = null }) {
  const [teams, setTeams] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        const teamsData = tournamentId 
          ? await getTeamsByTournament(tournamentId)
          : await getTeamsWithLogos();
        setTeams(teamsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadTeams();
  }, [tournamentId]);
  
  if (loading) {
    return React.createElement('div', { className: 'loading' }, 'Carregando times...');
  }
  
  if (error) {
    return React.createElement('div', { className: 'error' }, `Erro: ${error}`);
  }
  
  return React.createElement('div', { className: 'teams-container' },
    React.createElement('h2', null, `Times (${teams.length})`),
    React.createElement('div', { className: 'teams-grid' },
      teams.map(team => 
        React.createElement('div', { key: team.id, className: 'team-card' },
          team.logoUrl 
            ? React.createElement('img', {
                src: team.logoUrl,
                alt: team.name,
                className: 'team-logo',
                onError: (e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }
              })
            : null,
          React.createElement('div', {
            className: 'team-logo-placeholder',
            style: { display: team.logoUrl ? 'none' : 'flex' }
          }, team.name.charAt(0).toUpperCase()),
          React.createElement('h3', null, team.name),
          React.createElement('p', null, `ID: ${team.battlefyId}`)
        )
      )
    )
  );
}

// Exportar configuração do Firebase para uso em outros arquivos
export { db, firebaseConfig };