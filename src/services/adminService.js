import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminAdRewards = async () => {
  const response = await api.get('/admin/ad-rewards');
  return response.data.rewards || [];
};

export const getAdminWithdrawals = async () => {
  const response = await api.get('/admin/withdrawals');
  return response.data.withdrawals || [];
};

export const updateWithdrawalStatus = async ({ withdrawalId, status, adminNote, paymentReference }) => {
  const response = await api.post(`/admin/withdrawals/${withdrawalId}/status`, {
    status,
    adminNote,
    paymentReference,
  });
  return response.data;
};

export const setUserPremium = async ({ userId, active, expiresAt }) => {
  const response = await api.post(`/admin/users/${userId}/premium`, {
    active,
    expiresAt,
  });
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

export const createTeamPlayers = async (payload) => {
  const response = await api.post('/players/team', payload);
  return response.data;
};

export const deletePlayer = async (playerId) => {
  const response = await api.delete(`/players/${playerId}`);
  return response.data;
};

export const deleteTeam = async ({ game, team }) => {
  const response = await api.delete('/players/team', {
    data: { game, team },
  });
  return response.data;
};

export const processResults = async ({ contestId, playerResults, matchName, tournamentName, matchIdentifier, matchDateTime }) => {
  const response = await api.post('/results/process', {
    contestId,
    playerResults,
    matchName,
    tournamentName,
    matchIdentifier,
    matchDateTime,
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

export const markContestLive = async (contestId) => {
  const response = await api.post(`/admin/contests/${contestId}/live`);
  return response.data;
};

export const cancelContest = async ({ contestId, reason }) => {
  const response = await api.post(`/admin/contests/${contestId}/cancel`, { reason });
  return response.data;
};

export const rehostContest = async ({
  contestId,
  startTime,
  estimatedEndTime,
  reason,
  matchName,
  tournamentName,
  matchIdentifier,
  matchDateTime,
}) => {
  const response = await api.post(`/admin/contests/${contestId}/rehost`, {
    startTime,
    estimatedEndTime,
    reason,
    matchName,
    tournamentName,
    matchIdentifier,
    matchDateTime,
  });
  return response.data;
};

export const forceCompleteContest = async (contestId) => {
  const response = await api.post(`/admin/contests/${contestId}/complete`);
  return response.data;
};

export const refundContest = async (contestId) => {
  const response = await api.post(`/admin/contests/${contestId}/refund`);
  return response.data;
};

export const restartResultProcessing = async (contestId) => {
  const response = await api.post(`/admin/contests/${contestId}/restart-results`);
  return response.data;
};

const getMimeType = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.xlsx')) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
  if (lower.endsWith('.xls')) {
    return 'application/vnd.ms-excel';
  }
  return 'text/csv';
};

const uploadImportFile = async ({ url, file, extra = {} }) => {
  const formData = new FormData();
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'import.csv',
    type: file.mimeType || getMimeType(file.name || ''),
  });

  const response = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const importContestPlayers = async ({ contestId, file, defaultCredits = 8 }) =>
  uploadImportFile({
    url: `/admin/contests/${contestId}/import-players`,
    file,
    extra: { defaultCredits },
  });

export const importContestResults = async ({ contestId, file }) =>
  uploadImportFile({
    url: `/admin/contests/${contestId}/import-results`,
    file,
  });

export const getAdminLeaderboard = async (contestId) => {
  const response = await api.get(`/admin/leaderboard/${contestId}`);
  return response.data?.leaderboard || [];
};
