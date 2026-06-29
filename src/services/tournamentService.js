import api from './api';

export const syncTournament = async ({ name, source, sourceUrl, autoSync }) => {
  const response = await api.post('/admin/tournaments/sync', {
    name,
    source,
    sourceUrl,
    autoSync,
  });

  return response.data;
};
