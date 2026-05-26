import axios from 'axios';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://10.153.25.80:5000/api';
  // 'https://battle-8-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

let authToken = null;
let unauthorizedHandler = null;

export const normalizeApiError = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  let message =
    data?.message ||
    data?.error ||
    error?.message;

  if (error?.code === 'ECONNABORTED') {
    message = 'Request timeout. Check server connection.';
  }

  if (error?.message === 'Network Error' || !error?.response) {
    message = 'Unable to connect to server.';
  }

  return {
    status,
    message: message || 'Something went wrong.',
    data,
    originalError: error,
  };
};

export const setAuthToken = (token) => {
  authToken = token;

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (
      !config.headers['Idempotency-Key'] &&
      config.method?.toLowerCase() === 'post' &&
      config.url?.includes('/contests/join')
    ) {
      config.headers['Idempotency-Key'] = `join:${JSON.stringify(config.data || {})}`;
    }

    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    const method = config?.method?.toLowerCase();
    const retryable =
      config &&
      !config.__retried &&
      (method === 'get' || config.headers?.['Idempotency-Key']) &&
      (error?.code === 'ECONNABORTED' ||
        error?.message === 'Network Error' ||
        !error?.response);

    if (retryable) {
      config.__retried = true;
      await sleep(500);
      return api(config);
    }

    const apiError = normalizeApiError(error);

    if (apiError.status === 401) {
      setAuthToken(null);
      unauthorizedHandler?.(apiError);
    }

    return Promise.reject(apiError);
  }
);

export default api;
