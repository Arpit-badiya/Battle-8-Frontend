import api, {
  setAuthToken,
} from './api';

export const sendOtp = async (
  email
) => {
  const response =
    await api.post(
      '/auth/send-otp',
      {
        email:
          email
            ?.trim()
            ?.toLowerCase(),
      }
    );

  return response.data;
};

export const verifyOtp = async (
  email,
  otp
) => {
  const response =
    await api.post(
      '/auth/verify-otp',
      {
        email:
          email
            ?.trim()
            ?.toLowerCase(),

        otp:
          otp?.toString(),
      }
    );

  const token =
    response?.data?.token;

  const user =
    response?.data?.user;

  if (!token || !user) {
    throw new Error(
      'Invalid login response received from server.'
    );
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
