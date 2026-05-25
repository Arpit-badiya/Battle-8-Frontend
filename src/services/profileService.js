import api from './api';

export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateProfile = async ({ name }) => {
  const response = await api.put('/profile', {
    name: name?.trim(),
  });

  return response.data;
};

export const applyReferralCode = async ({ code }) => {
  const response = await api.post('/profile/referral/apply', {
    code: code?.trim(),
  });

  return response.data;
};
