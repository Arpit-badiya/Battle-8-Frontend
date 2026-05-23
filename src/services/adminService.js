import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const createContest = async (payload) => {
  const response = await api.post('/admin/contests', payload);
  return response.data;
};

export const createPlayer = async (payload) => {
  const response = await api.post('/players/create', payload);
  return response.data;
};

export const processResults = async ({ contestId, playerResults }) => {
  const response = await api.post('/results/process', {
    contestId,
    playerResults,
  });

  return response.data;
};

export const savePlayerResult = async ({ contestId, playerId, kills, placement }) => {
  const response = await api.post('/results/player', {
    contestId,
    playerId,
    kills,
    placement,
  });

  return response.data;
};

export const updateContestPlayers = async ({ contestId, players }) => {
  const response = await api.put(`/admin/contests/${contestId}/players`, {
    players,
  });
  return response.data;
};

export const getAdminLeaderboard = async (contestId) => {
  const response = await api.get(`/admin/leaderboard/${contestId}`);
  return response.data?.leaderboard || [];
};
