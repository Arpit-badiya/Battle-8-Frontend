import api from './api';

export const getAdSummary = async () => {
  const response = await api.get('/ads/summary');
  return response.data;
};

export const recordAdReward = async (payload) => {
  const response = await api.post('/ads/reward', payload);
  return response.data;
};
