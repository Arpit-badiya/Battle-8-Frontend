import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '../services/api';

const useApi = (request) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const response = await request(...args);
        setData(response);
        return response;
      } catch (requestError) {
        setError(requestError);
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [request]
  );

  return {
    data,
    loading,
    error,
    errorMessage: error ? getApiErrorMessage(error) : '',
    execute,
    setData,
  };
};

export default useApi;
