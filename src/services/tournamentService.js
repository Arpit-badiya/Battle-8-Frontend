import api from './api';

export const getTournaments = async () => {
  const response = await api.get('/admin/tournaments');
  return response.data.tournaments || [];
};

export const createTournament = async (payload) => {
  const response = await api.post('/admin/tournaments', payload);
  return response.data.tournament;
};

export const updateTournament = async ({ tournamentId, ...payload }) => {
  const response = await api.put(`/admin/tournaments/${tournamentId}`, payload);
  return response.data.tournament;
};

export const deleteTournament = async (tournamentId) => {
  const response = await api.delete(`/admin/tournaments/${tournamentId}`);
  return response.data;
};

export const syncTournamentById = async (tournamentId) => {
  const response = await api.post(`/admin/tournaments/${tournamentId}/sync`);
  return response.data;
};

export const syncTournament = async ({ name, source, sourceUrl, autoSync }) => {
  const response = await api.post('/admin/tournaments/sync', {
    name,
    source,
    sourceUrl,
    autoSync,
  });

  return response.data;
};
