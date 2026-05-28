import NetInfo from '@react-native-community/netinfo';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import {
  createTeam as createTeamRequest,
  getContests as getContestsRequest,
  getLeaderboard as getLeaderboardRequest,
  joinContest as joinContestRequest,
} from '../services/contestService';
import { getPlayers as getPlayersRequest } from '../services/playerService';
import { connectSocket, disconnectSocket, joinContestRoom, leaveContestRoom, onSocketEvent } from '../services/socketService';
import { getWallet as getWalletRequest } from '../services/walletService';
import { showSuccess } from '../utils/feedback';

export const AppDataContext = createContext(null);

const mergeContest = (contest, patch) => ({
  ...contest,
  ...patch,
  id: patch?._id || patch?.id || contest.id,
  players: Number(patch?.players ?? contest.players ?? 0),
  totalSpots: Number(patch?.totalSpots ?? patch?.players ?? contest.totalSpots ?? contest.players ?? 0),
  joined: Number(patch?.joined ?? contest.joined ?? 0),
  remainingSlots: Number(
    patch?.remainingSlots ??
      Math.max(
        Number(patch?.players ?? contest.players ?? 0) -
          Number(patch?.joined ?? contest.joined ?? 0),
        0
      )
  ),
});

const getContestFromJoinResponse = (response) =>
  response?.contest || response?.data?.contest || response?.data || null;

const getWalletFromResponse = (response) =>
  response?.wallet || response?.data?.wallet || response?.data || null;

export const AppDataProvider = ({ children }) => {
  const { isAuthenticated, token, updateCoins, user } = useAuth();

  const [contests, setContests] = useState([]);
  const [players, setPlayers] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [leaderboards, setLeaderboards] = useState({});
  const [activeContestId, setActiveContestId] = useState(null);
  const [network, setNetwork] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  const [loading, setLoading] = useState({
    contests: false,
    players: false,
    wallet: false,
    leaderboard: false,
  });

  const [joiningContestIds, setJoiningContestIds] = useState({});
  const [creatingTeam, setCreatingTeam] = useState(false);

  const mountedRef = useRef(true);
  const requestsRef = useRef({});

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetwork({
        isConnected: state.isConnected !== false,
        isInternetReachable: state.isInternetReachable !== false,
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setContests([]);
      setPlayers([]);
      setWallet(null);
      setLeaderboards({});
      setActiveContestId(null);
      requestsRef.current = {};
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeContestId || !isAuthenticated) {
      return undefined;
    }

    joinContestRoom(activeContestId);

    return () => leaveContestRoom(activeContestId);
  }, [activeContestId, isAuthenticated]);

  const safeSetLoading = useCallback((key, value) => {
    if (!mountedRef.current) return;

    setLoading((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const refreshContests = useCallback(async ({ silent = false, game = '' } = {}) => {
    const requestKey = game ? `contests:${game}` : 'contests';
    if (requestsRef.current[requestKey]) {
      return requestsRef.current[requestKey];
    }

    if (!silent) {
      safeSetLoading('contests', true);
    }

    requestsRef.current[requestKey] = getContestsRequest({ game })
      .then((data) => {
        if (mountedRef.current && !game) {
          setContests(data);
        }

        return data;
      })
      .finally(() => {
        delete requestsRef.current[requestKey];
        safeSetLoading('contests', false);
      });

    return requestsRef.current[requestKey];
  }, [safeSetLoading]);

  const refreshPlayers = useCallback(async ({ silent = false, game = '' } = {}) => {
    const requestKey = game ? `players:${game}` : 'players';
    if (requestsRef.current[requestKey]) {
      return requestsRef.current[requestKey];
    }

    if (!silent) {
      safeSetLoading('players', true);
    }

    requestsRef.current[requestKey] = getPlayersRequest({ game })
      .then((data) => {
        if (mountedRef.current && !game) {
          setPlayers(data);
        }

        return data;
      })
      .finally(() => {
        delete requestsRef.current[requestKey];
        safeSetLoading('players', false);
      });

    return requestsRef.current[requestKey];
  }, [safeSetLoading]);

  const refreshWallet = useCallback(async ({ silent = false } = {}) => {
    if (requestsRef.current.wallet) {
      return requestsRef.current.wallet;
    }

    if (!silent) {
      safeSetLoading('wallet', true);
    }

    requestsRef.current.wallet = getWalletRequest()
      .then((data) => {
        if (mountedRef.current) {
          setWallet(data);

          updateCoins(
            data.balance ??
            data.coins ??
            0
          );
        }

        return data;
      })
      .finally(() => {
        delete requestsRef.current.wallet;
        safeSetLoading('wallet', false);
      });

    return requestsRef.current.wallet;
  }, [safeSetLoading, updateCoins]);

  const refreshLeaderboard = useCallback(async (contestId, { silent = false } = {}) => {
    if (!contestId) return [];

    const requestKey = `leaderboard:${contestId}`;

    if (requestsRef.current[requestKey]) {
      return requestsRef.current[requestKey];
    }

    if (!silent) {
      safeSetLoading('leaderboard', true);
    }

    requestsRef.current[requestKey] = getLeaderboardRequest(contestId)
      .then((data) => {
        if (mountedRef.current) {
          setLeaderboards((current) => ({
            ...current,
            [contestId]: data,
          }));
        }

        return data;
      })
      .finally(() => {
        delete requestsRef.current[requestKey];
        safeSetLoading('leaderboard', false);
      });

    return requestsRef.current[requestKey];
  }, [safeSetLoading]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      return undefined;
    }

    connectSocket(token);

    const cleanupContest = onSocketEvent('contest:listUpdated', ({ contest }) => {
      if (!contest) return;

      setContests((current) =>
        current.map((item) =>
          (item.id || item._id) === (contest.id || contest._id)
            ? mergeContest(item, contest)
            : item
        )
      );
    });

    const cleanupLeaderboard = onSocketEvent('leaderboard:updated', ({ contestId, leaderboard }) => {
      if (!contestId || !Array.isArray(leaderboard)) return;

      setLeaderboards((current) => ({
        ...current,
        [contestId]: leaderboard,
      }));
    });

    const cleanupResult = onSocketEvent('result:declared', ({ contestId }) => {
      if (contestId) {
        refreshLeaderboard(contestId, { silent: true });
        refreshContests({ silent: true });
      }
    });

    return () => {
      cleanupContest();
      cleanupLeaderboard();
      cleanupResult();
      disconnectSocket();
    };
  }, [isAuthenticated, refreshContests, refreshLeaderboard, token]);

  const syncAfterJoin = useCallback(async (contestId, response) => {
    const responseContest = getContestFromJoinResponse(response);
    const responseWallet = getWalletFromResponse(response);

    if (responseContest?._id || responseContest?.id) {
      setContests((current) =>
        current.map((contest) =>
          (contest.id || contest._id) === contestId
            ? mergeContest(contest, responseContest)
            : contest
        )
      );
    }

    if (
      responseWallet?.balance !== undefined ||
      responseWallet?.coins !== undefined
    ) {
      const balance =
        responseWallet.balance ??
        responseWallet.coins;

      setWallet((current) => ({
        ...(current || {}),
        ...responseWallet,
        balance,
      }));

      updateCoins(balance);
    }

    const [freshContests, freshWallet] = await Promise.all([
      refreshContests({ silent: true }),
      refreshWallet({ silent: true }),
    ]);

    if (contestId) {
      await refreshLeaderboard(contestId, {
        silent: true,
      });
    }

    return {
      contests: freshContests,
      wallet: freshWallet,
    };
  }, [
    refreshContests,
    refreshLeaderboard,
    refreshWallet,
    updateCoins,
  ]);

  const joinContest = useCallback(async (contest) => {
    const contestId = contest?.id || contest?._id;

    const requestKey = `join:${contestId}`;

    if (
      !contestId ||
      joiningContestIds[contestId] ||
      requestsRef.current[requestKey]
    ) {
      return null;
    }

    if (!network.isConnected || !network.isInternetReachable) {
      throw new Error('You are offline. Please reconnect and try again.');
    }

    const previousContests = contests;
    const previousCoins = user?.coins ?? 0;

    setJoiningContestIds((current) => ({
      ...current,
      [contestId]: true,
    }));

    requestsRef.current[requestKey] = true;

    setContests((current) =>
      current.map((item) =>
        (item.id || item._id) === contestId
          ? {
              ...item,
              userJoined: true,
              joined: Math.min(
                (item.joined ?? 0) + 1,
                item.players ||
                  (item.joined ?? 0) + 1
              ),
              remainingSlots: Math.max(
                (item.remainingSlots ??
                  (item.players || 0) -
                    (item.joined || 0)) - 1,
                0
              ),
            }
          : item
      )
    );

    if (contest?.entryFee) {
      updateCoins((coins) =>
        Math.max(0, coins - contest.entryFee)
      );
    }

    try {
      const response = await joinContestRequest(
        contestId
      );

      await syncAfterJoin(contestId, response);

      showSuccess('Contest joined successfully');

      return response;
    } catch (error) {
      if (mountedRef.current) {
        setContests(previousContests);

        updateCoins(previousCoins);
      }

      throw error;
    } finally {
      if (mountedRef.current) {
        setJoiningContestIds((current) => {
          const next = { ...current };

          delete next[contestId];

          return next;
        });
      }

      delete requestsRef.current[requestKey];
    }
  }, [
    contests,
    joiningContestIds,
    syncAfterJoin,
    updateCoins,
    user?.coins,
  ]);

  const createTeam = useCallback(async ({
    contestId,
    players: playerIds,
    totalCredits,
    captain,
    viceCaptain,
  }) => {
    if (
      creatingTeam ||
      requestsRef.current.createTeam
    ) {
      return null;
    }

    const uniquePlayerIds = [
      ...new Set(playerIds),
    ].filter(Boolean);

    setCreatingTeam(true);

    requestsRef.current.createTeam = true;

    try {
      let teamResponse = null;
      const contest = contests.find((item) => (item.id || item._id) === contestId);
      const entryFee = Number(contest?.entryFee || 0);

      if (!contest?.userJoined && entryFee > 0) {
        const latestWallet = await refreshWallet({ silent: true }).catch(() => wallet);
        const availableCoins = Number(
          latestWallet?.balance ??
            latestWallet?.coins ??
            wallet?.balance ??
            wallet?.coins ??
            user?.coins ??
            0
        );

        if (availableCoins < entryFee) {
          const error = new Error('Insufficient wallet balance');
          error.neededCoins = Math.max(entryFee - availableCoins, 0);
          throw error;
        }
      }

      try {
        teamResponse = await createTeamRequest({
          contestId,
          players: uniquePlayerIds,
          captain,
          viceCaptain,
          totalCredits,
        });
      } catch (error) {
        const isExistingTeam =
          error?.status === 409 ||
          String(error?.message || '').toLowerCase().includes('team already created');

        if (!isExistingTeam) {
          throw error;
        }
      }

      let joinResponse = null;
      if (!contest?.userJoined) {
        try {
          joinResponse = await joinContestRequest(contestId);
        } catch (error) {
          const alreadyJoined =
            error?.status === 409 ||
            String(error?.message || '').toLowerCase().includes('already joined');

          if (!alreadyJoined) {
            throw error;
          }
        }
      }

      setContests((current) =>
        current.map((contest) =>
          (contest.id || contest._id) === contestId
            ? {
                ...contest,
                teamCreated: true,
                userJoined: true,
              }
            : contest
        )
      );

      if (joinResponse) {
        await syncAfterJoin(contestId, joinResponse);
      } else {
        await refreshContests({ silent: true });
      }
      await refreshLeaderboard(contestId, { silent: true });

      showSuccess('Team created successfully');

      return {
        team: teamResponse?.team || teamResponse,
        join: joinResponse,
      };
    } finally {
      delete requestsRef.current.createTeam;

      if (mountedRef.current) {
        setCreatingTeam(false);
      }
    }
  }, [
    creatingTeam,
    contests,
    refreshContests,
    refreshLeaderboard,
    refreshWallet,
    syncAfterJoin,
    user?.coins,
    wallet,
  ]);

  const activeContest = useMemo(
    () =>
      contests.find(
        (contest) =>
          (contest.id || contest._id) ===
          activeContestId
      ) ||
      contests[0] ||
      null,
    [activeContestId, contests]
  );

  const value = useMemo(
    () => ({
      activeContest,
      activeContestId,
      contests,
      creatingTeam,
      joinContest,
      joiningContestIds,
      leaderboards,
      loading,
      network,
      players,
      refreshContests,
      refreshLeaderboard,
      refreshPlayers,
      refreshWallet,
      setActiveContestId,
      wallet,
      createTeam,
    }),
    [
      activeContest,
      activeContestId,
      contests,
      creatingTeam,
      joinContest,
      joiningContestIds,
      leaderboards,
      loading,
      network,
      players,
      refreshContests,
      refreshLeaderboard,
      refreshPlayers,
      refreshWallet,
      wallet,
      createTeam,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
