// 🏆 Exemplos Avançados de Uso das Logos dos Times
// Este arquivo contém componentes e funções avançadas para usar logoUrl

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTeamsWithLogos, getTeamsByTournament, db } from './team-logo-import-example.js';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Hook personalizado para gerenciar logos dos times
 * @param {string} tournamentId - ID do torneio (opcional)
 * @returns {Object} Estado e funções para gerenciar times
 */
export function useTeamLogos(tournamentId = null) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const teamsData = tournamentId 
        ? await getTeamsByTournament(tournamentId)
        : await getTeamsWithLogos();
      
      setTeams(teamsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);
  
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);
  
  const refreshTeams = useCallback(() => {
    loadTeams();
  }, [loadTeams]);
  
  const teamsWithLogos = useMemo(() => 
    teams.filter(team => team.logoUrl), [teams]
  );
  
  const teamsWithoutLogos = useMemo(() => 
    teams.filter(team => !team.logoUrl), [teams]
  );
  
  return {
    teams,
    teamsWithLogos,
    teamsWithoutLogos,
    loading,
    error,
    refreshTeams,
    stats: {
      total: teams.length,
      withLogos: teamsWithLogos.length,
      withoutLogos: teamsWithoutLogos.length,
      percentage: teams.length > 0 ? Math.round((teamsWithLogos.length / teams.length) * 100) : 0
    }
  };
}

/**
 * Componente Dropdown para seleção de times
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Componente de seleção
 */
export function TeamSelector({ onTeamSelect, tournamentId = null, placeholder = "Selecione um time" }) {
  const { teams, loading, error } = useTeamLogos(tournamentId);
  const [selectedTeam, setSelectedTeam] = useState('');
  
  const handleChange = (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    
    const team = teams.find(t => t.id === teamId);
    if (onTeamSelect) {
      onTeamSelect(team);
    }
  };
  
  if (loading) return React.createElement('div', null, 'Carregando times...');
  if (error) return React.createElement('div', null, `Erro: ${error}`);
  
  return React.createElement('select', {
    value: selectedTeam,
    onChange: handleChange,
    className: 'team-selector'
  },
    React.createElement('option', { value: '' }, placeholder),
    teams.map(team => 
      React.createElement('option', { key: team.id, value: team.id },
        `${team.name} ${team.logoUrl ? '🖼️' : '📝'}`
      )
    )
  );
}

/**
 * Componente Card detalhado de time
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Card do time
 */
export function TeamCard({ team, showDetails = true, onClick = null }) {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleClick = () => {
    if (onClick) onClick(team);
  };
  
  return React.createElement('div', {
    className: `team-card ${onClick ? 'clickable' : ''}`,
    onClick: handleClick
  },
    React.createElement('div', { className: 'team-logo-container' },
      !imageError && team.logoUrl
        ? React.createElement('img', {
            src: team.logoUrl,
            alt: team.name,
            className: 'team-logo',
            onError: handleImageError
          })
        : React.createElement('div', { className: 'team-logo-placeholder' },
            team.name.charAt(0).toUpperCase()
          )
    ),
    React.createElement('div', { className: 'team-info' },
      React.createElement('h3', { className: 'team-name' }, team.name),
      showDetails && React.createElement('div', { className: 'team-details' },
        React.createElement('p', null, `ID: ${team.battlefyId}`),
        React.createElement('p', null, `Torneio: ${team.tournamentId}`),
        team.logoUrl && React.createElement('p', { className: 'has-logo' }, '✅ Com logo'),
        !team.logoUrl && React.createElement('p', { className: 'no-logo' }, '❌ Sem logo')
      )
    )
  );
}

/**
 * Componente Galeria paginada de times
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Galeria de times
 */
export function TeamsGallery({ 
  tournamentId = null, 
  itemsPerPage = 12, 
  showFilters = true,
  onTeamClick = null 
}) {
  const { teams, loading, error, stats } = useTeamLogos(tournamentId);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'with-logo', 'without-logo'
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTeams = useMemo(() => {
    let filtered = teams;
    
    // Filtro por logo
    if (filter === 'with-logo') {
      filtered = filtered.filter(team => team.logoUrl);
    } else if (filter === 'without-logo') {
      filtered = filtered.filter(team => !team.logoUrl);
    }
    
    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [teams, filter, searchTerm]);
  
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTeams = filteredTeams.slice(startIndex, startIndex + itemsPerPage);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);
  
  if (loading) return React.createElement('div', { className: 'loading' }, 'Carregando galeria...');
  if (error) return React.createElement('div', { className: 'error' }, `Erro: ${error}`);
  
  return React.createElement('div', { className: 'teams-gallery' },
    // Estatísticas
    React.createElement('div', { className: 'gallery-stats' },
      React.createElement('h2', null, 'Galeria de Times'),
      React.createElement('p', null, 
        `Total: ${stats.total} | Com logo: ${stats.withLogos} (${stats.percentage}%) | Sem logo: ${stats.withoutLogos}`
      )
    ),
    
    // Filtros
    showFilters && React.createElement('div', { className: 'gallery-filters' },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Buscar time...',
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value),
        className: 'search-input'
      }),
      React.createElement('select', {
        value: filter,
        onChange: (e) => setFilter(e.target.value),
        className: 'filter-select'
      },
        React.createElement('option', { value: 'all' }, 'Todos os times'),
        React.createElement('option', { value: 'with-logo' }, 'Com logo'),
        React.createElement('option', { value: 'without-logo' }, 'Sem logo')
      )
    ),
    
    // Grid de times
    React.createElement('div', { className: 'teams-grid' },
      currentTeams.map(team => 
        React.createElement(TeamCard, {
          key: team.id,
          team: team,
          onClick: onTeamClick
        })
      )
    ),
    
    // Paginação
    totalPages > 1 && React.createElement('div', { className: 'pagination' },
      React.createElement('button', {
        onClick: () => setCurrentPage(Math.max(1, currentPage - 1)),
        disabled: currentPage === 1,
        className: 'pagination-btn'
      }, '← Anterior'),
      React.createElement('span', { className: 'pagination-info' },
        `Página ${currentPage} de ${totalPages}`
      ),
      React.createElement('button', {
        onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)),
        disabled: currentPage === totalPages,
        className: 'pagination-btn'
      }, 'Próxima →')
    ),
    
    // Info da página atual
    React.createElement('div', { className: 'page-info' },
      `Mostrando ${currentTeams.length} de ${filteredTeams.length} times`
    )
  );
}

/**
 * Sistema de cache para logos dos times
 */
export const teamLogoCache = {
  cache: new Map(),
  
  async getTeamLogo(teamId) {
    if (this.cache.has(teamId)) {
      return this.cache.get(teamId);
    }
    
    try {
      const team = await getTeamById(teamId);
      if (team) {
        this.cache.set(teamId, team);
        return team;
      }
    } catch (error) {
      console.error('Erro ao buscar logo do time:', error);
    }
    
    return null;
  },
  
  clearCache() {
    this.cache.clear();
  },
  
  getCacheSize() {
    return this.cache.size;
  }
};

/**
 * Função para download em lote das logos
 * @param {Array} teams - Array de times
 * @returns {Promise<Array>} URLs das logos baixadas
 */
export async function downloadTeamLogos(teams) {
  const downloads = [];
  
  for (const team of teams) {
    if (team.logoUrl) {
      try {
        const response = await fetch(team.logoUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          downloads.push({
            teamId: team.id,
            teamName: team.name,
            originalUrl: team.logoUrl,
            downloadUrl: url,
            size: blob.size,
            type: blob.type
          });
        }
      } catch (error) {
        console.error(`Erro ao baixar logo do time ${team.name}:`, error);
      }
    }
  }
  
  return downloads;
}

/**
 * Função para gerar relatório dos times
 * @returns {Promise<Object>} Relatório completo
 */
export async function generateTeamsReport() {
  try {
    const teams = await getTeamsWithLogos();
    
    const report = {
      generated_at: new Date().toISOString(),
      total_teams: teams.length,
      teams_with_logo: teams.filter(t => t.logoUrl).length,
      teams_without_logo: teams.filter(t => !t.logoUrl).length,
      tournaments: [...new Set(teams.map(t => t.tournamentId))],
      teams_by_tournament: {}
    };
    
    // Agrupar por torneio
    report.tournaments.forEach(tournamentId => {
      const tournamentTeams = teams.filter(t => t.tournamentId === tournamentId);
      report.teams_by_tournament[tournamentId] = {
        total: tournamentTeams.length,
        with_logo: tournamentTeams.filter(t => t.logoUrl).length,
        without_logo: tournamentTeams.filter(t => !t.logoUrl).length
      };
    });
    
    return report;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return null;
  }
}

/**
 * Função para sincronizar com API externa
 * @param {string} apiEndpoint - Endpoint da API
 * @returns {Promise<Object>} Resultado da sincronização
 */
export async function syncTeamLogosToExternalAPI(apiEndpoint) {
  try {
    const teams = await getTeamsWithLogos();
    const teamsWithLogos = teams.filter(team => team.logoUrl);
    
    const payload = {
      timestamp: new Date().toISOString(),
      teams: teamsWithLogos.map(team => ({
        id: team.battlefyId,
        name: team.name,
        logoUrl: team.logoUrl,
        tournamentId: team.tournamentId
      }))
    };
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      return {
        success: true,
        synced_teams: teamsWithLogos.length,
        response: await response.json()
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}