import api, { setAuthToken } from './api';

export const loginWithGoogleToken = async ({ firebaseIdToken, referralCode }) => {
  const response = await api.post('/auth/google', {
    firebaseIdToken,
    referralCode: referralCode?.trim(),
  });

  const token = response?.data?.token;
  const user = response?.data?.user;

  if (!token || !user) {
    throw new Error('Invalid login response received from server.');
  }

  setAuthToken(token);

  return {
    token,
    user,
  };
};

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
