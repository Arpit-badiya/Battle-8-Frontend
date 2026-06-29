import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import {
  getProfile as requestProfile,
  loginWithGoogleToken as requestGoogleLogin,
  updateProfile as requestUpdateProfile,
} from '../services/authService';
import { clearAuthSession, getAuthSession, saveAuthSession } from '../utils/storage';

export const AuthContext = createContext(null);

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

const getGoogleSignInErrorMessage = (error) => {
  if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Google sign-in was cancelled.';
  }

  if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services is not available or needs to be updated.';
  }

  if (error?.code === statusCodes.DEVELOPER_ERROR || error?.message?.includes('DEVELOPER_ERROR')) {
    return 'Google Sign-In is not configured for this Android app. Add the app package and signing SHA in Firebase, download the updated google-services.json, then rebuild the app.';
  }

  return error?.message || 'Google sign-in failed. Please try again.';
};

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
    const decoded = getJwtPayload(jwtToken);

    return decoded.exp ? decoded.exp * 1000 <= Date.now() : false;
  } catch (error) {
    return true;
  }
};

const getJwtPayload = (jwtToken) => {
  const [, payload] = String(jwtToken || '').split('.');

  if (!payload) {
    return {};
  }

  return JSON.parse(decodeBase64Url(payload));
};

const normalizeAuthUser = (nextUser, jwtToken) => {
  if (!nextUser) {
    return null;
  }

  const payload = getJwtPayload(jwtToken);
  const id = nextUser._id || nextUser.id || payload.id || '';

  return {
    ...nextUser,
    _id: id,
    id,
    email: nextUser.email || '',
    name: nextUser.name || '',
    role: nextUser.role || payload.role || 'user',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const saved = await getAuthSession();
        if (saved?.token && saved?.user && !isJwtExpired(saved.token)) {
          const savedUser = normalizeAuthUser(saved.user, saved.token);
          setUser(savedUser);
          setToken(saved.token);
          setAuthToken(saved.token);

          try {
            const response = await requestProfile();
            if (response?.user) {
              const freshUser = normalizeAuthUser(response.user, saved.token);
              setUser(freshUser);
              await saveAuthSession({ user: freshUser, token: saved.token });
            } else if (savedUser?.role !== saved.user.role || savedUser?._id !== saved.user._id) {
              await saveAuthSession({ user: savedUser, token: saved.token });
            }
          } catch (error) {
            if (savedUser?.role !== saved.user.role || savedUser?._id !== saved.user._id) {
              await saveAuthSession({ user: savedUser, token: saved.token });
            }
          }
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

  const persistSession = useCallback(
    async ({ user: nextUser, token: nextToken = token }) => {
      const normalizedUser = normalizeAuthUser(nextUser, nextToken);
      setUser(normalizedUser);

      if (nextToken) {
        setToken(nextToken);
        setAuthToken(nextToken);
        await saveAuthSession({ user: normalizedUser, token: nextToken });
      }
    },
    [token]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const loginWithGoogle = useCallback(async (referralCode = '') => {
    setLoading(true);
    try {
      if (!WEB_CLIENT_ID) {
        throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not configured.');
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      let signInResponse;
      try {
        signInResponse = await GoogleSignin.signIn();
      } catch (error) {
        throw new Error(getGoogleSignInErrorMessage(error));
      }
      const idToken = signInResponse?.type === 'success' ? signInResponse.data?.idToken : null;

      if (!idToken) {
        throw new Error(
          signInResponse?.type === 'cancelled'
            ? 'Google sign-in was cancelled.'
            : 'Google did not return an ID token.'
        );
      }

      const credential = auth.GoogleAuthProvider.credential(idToken);
      const firebaseCredential = await auth().signInWithCredential(credential);
      const firebaseIdToken = await firebaseCredential.user.getIdToken();
      const response = await requestGoogleLogin({
        firebaseIdToken,
        referralCode: referralCode.trim().toUpperCase(),
      });
      const nextToken = response.token;
      const nextUser = normalizeAuthUser(response.user, nextToken);

      setUser(nextUser);
      setToken(nextToken);
      setAuthToken(nextToken);
      await saveAuthSession({ user: nextUser, token: nextToken });
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        auth().signOut().catch(() => undefined),
        GoogleSignin.signOut().catch(() => undefined),
      ]);
    } finally {
      await clearSession();
    }
  }, [clearSession]);

  const updateCoins = useCallback((value) => {
    setUser((current) => {
      if (!current) return current;

      const nextCoins = typeof value === 'function' ? value(current.coins || 0) : value;

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

  const updateProfile = useCallback(
    async ({ name }) => {
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
    },
    [persistSession, user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      loading,
      profileLoading,
      isAuthenticated: Boolean(user && token),
      needsName: Boolean(user && token && !user.name),
      loginWithGoogle,
      logout,
      updateCoins,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      token,
      booting,
      loading,
      profileLoading,
      loginWithGoogle,
      logout,
      updateCoins,
      refreshProfile,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
