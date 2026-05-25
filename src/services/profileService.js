import api from './api';

export const applyReferralCode = async ({ code }) => {
  const response = await api.post('/profile/referral/apply', {
    code: code?.trim(),
  });

  return response.data;
};
