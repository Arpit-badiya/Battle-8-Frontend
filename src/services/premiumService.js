import api from './api';

export const getPremiumStatus = async () => {
  const response = await api.get('/premium');
  return response.data;
};

export const claimPremiumDailyBonus = async () => {
  const response = await api.post('/premium/daily-bonus');
  return response.data;
};
