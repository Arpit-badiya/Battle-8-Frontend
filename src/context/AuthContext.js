import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import { getProfile as requestProfile, sendOtp as requestOtp, updateProfile as requestUpdateProfile, verifyOtp as requestVerifyOtp } from '../services/authService';
import { clearAuthSession, getAuthSession, saveAuthSession } from '../utils/storage';

export const AuthContext = createContext(null);

const decodeBase64Url = (value = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = value.replace(/-/g, '+').replace(/_/g, '/');
  let output = '';
  let buffer = 0;
  let bits = 0;

  while (str.length % 4) {
    str += '=';
  }

  for (let index = 0; index < str.length; index += 1) {
    const char = str[index];

    if (char === '=') {
      break;
    }

    const valueIndex = chars.indexOf(char);

    if (valueIndex < 0) {
      continue;
    }

    buffer = (buffer << 6) | valueIndex;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return decodeURIComponent(
    output
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );
};

const isJwtExpired = (jwtToken) => {
  try {
    const [, payload] = String(jwtToken || '').split('.');

    if (!payload) {
      return true;
    }

    const decoded = JSON.parse(decodeBase64Url(payload));

    return decoded.exp ? decoded.exp * 1000 <= Date.now() : false;
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const saved = await getAuthSession();
        if (saved?.token && saved?.user && !isJwtExpired(saved.token)) {
          setUser(saved.user);
          setToken(saved.token);
          setAuthToken(saved.token);
        } else if (saved?.token) {
          await clearAuthSession();
        }
      } finally {
        setBooting(false);
      }
    };

    hydrate();
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await clearAuthSession();
  }, []);

  const persistSession = useCallback(async ({ user: nextUser, token: nextToken = token }) => {
    setUser(nextUser);

    if (nextToken) {
      setToken(nextToken);
      setAuthToken(nextToken);
      await saveAuthSession({ user: nextUser, token: nextToken });
    }
  }, [token]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const sendOtp = useCallback(async (email) => {
    setLoading(true);
    try {
      const response = await requestOtp(email);
      setPendingEmail(email.trim().toLowerCase());
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (otp, emailOverride) => {
    setLoading(true);
    try {
      const email = emailOverride || pendingEmail;
      const response = await requestVerifyOtp(email, otp);
      const nextUser = response.user;
      const nextToken = response.token;

      setUser(nextUser);
      setToken(nextToken);
      setAuthToken(nextToken);
      await saveAuthSession({ user: nextUser, token: nextToken });
      return response;
    } finally {
      setLoading(false);
    }
  }, [pendingEmail]);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

 const updateCoins = useCallback((value) => {
  setUser((current) => {
    if (!current) return current;

    const nextCoins =
      typeof value === 'function'
        ? value(current.coins || 0)
        : value;

    return {
      ...current,
      coins: nextCoins,
    };
  });
}, []);

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const response = await requestProfile();
      if (response?.user) {
        await persistSession({ user: response.user });
      }
      return response;
    } finally {
      setProfileLoading(false);
    }
  }, [persistSession]);

  const updateProfile = useCallback(async ({ name }) => {
    const normalizedName = name?.trim();
    const previousUser = user;
    const optimisticUser = previousUser
      ? {
          ...previousUser,
          name: normalizedName,
        }
      : previousUser;

    if (optimisticUser) {
      setUser(optimisticUser);
    }

    setProfileLoading(true);

    try {
      const response = await requestUpdateProfile({ name: normalizedName });
      if (response?.user) {
        await persistSession({ user: response.user });
      }
      return response;
    } catch (error) {
      if (previousUser) {
        setUser(previousUser);
      }
      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, [persistSession, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      pendingEmail,
      booting,
      loading,
      profileLoading,
      isAuthenticated: Boolean(user && token),
      needsName: Boolean(user && token && !user.name),
      sendOtp,
      verifyOtp,
      logout,
      updateCoins,
      refreshProfile,
      updateProfile,
    }),
    [user, token, pendingEmail, booting, loading, profileLoading, sendOtp, verifyOtp, logout, updateCoins, refreshProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
