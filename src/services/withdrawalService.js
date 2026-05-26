import api from './api';

export const getWithdrawalOverview = async () => {
  const response = await api.get('/withdrawals');
  return response.data;
};

export const requestWithdrawal = async ({ amountCoins, upiId, accountName }) => {
  const response = await api.post('/withdrawals', {
    amountCoins,
    upiId,
    accountName,
  });
  return response.data;
};
