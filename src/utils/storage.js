import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_SESSION_KEY =
  '@happy_happy_auth_session';

export const saveAuthSession =
  async ({
    token,
    user,
  }) => {
    try {
      await AsyncStorage.setItem(
        AUTH_SESSION_KEY,

        JSON.stringify({
          token,
          user,
        })
      );
    } catch (error) {
      console.log(
        'SAVE SESSION ERROR',
        error
      );
    }
  };

export const getAuthSession =
  async () => {
    try {
      const raw =
        await AsyncStorage.getItem(
          AUTH_SESSION_KEY
        );

      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    } catch (error) {
      console.log(
        'GET SESSION ERROR',
        error
      );

      await AsyncStorage.removeItem(
        AUTH_SESSION_KEY
      );

      return null;
    }
  };

export const clearAuthSession =
  async () => {
    try {
      await AsyncStorage.removeItem(
        AUTH_SESSION_KEY
      );
    } catch (error) {
      console.log(
        'CLEAR SESSION ERROR',
        error
      );
    }
  };