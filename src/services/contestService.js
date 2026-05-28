import api from './api';

const unwrapList = (
  payload,
  key
) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    Array.isArray(
      payload?.[key]
    )
  ) {
    return payload[key];
  }

  if (
    Array.isArray(
      payload?.data
    )
  ) {
    return payload.data;
  }

  return [];
};

const normalizeContest = (
  contest = {}
) => ({
  ...contest,

  id:
    contest._id ||
    contest.id,

  players:
    Number(
      contest.players ??
        contest.totalPlayers ??
        contest.maxPlayers ??
        0
    ),

  totalSpots:
    Number(
      contest.totalSpots ??
        contest.players ??
        contest.totalPlayers ??
        contest.maxPlayers ??
        0
    ),

  entryFee:
    Number(
      contest.entryFee ??
        contest.coins ??
        contest.fee ??
        0
    ),

  prizePool:
    Number(
      contest.prizePool ??
        contest.totalPool ??
        contest.prize ??
        0
    ),

  platformCommissionPercent: Number(
    contest.platformCommissionPercent ??
      0
  ),

  totalCollection: Number(
    contest.totalCollection ??
      0
  ),

  platformCommissionAmount: Number(
    contest.platformCommissionAmount ??
      0
  ),

  joined:
    Number(
      contest.joined ??
        contest.joinedPlayers ??
        contest.participantsCount ??
        0
    ),

  remainingSlots: Number(
    contest.remainingSlots ??
      Math.max(
        Number(
          contest.players ??
            contest.totalPlayers ??
            contest.maxPlayers ??
            0
        ) -
          Number(
            contest.joined ??
              contest.joinedPlayers ??
              contest.participantsCount ??
              0
          ),
        0
      )
  ),

  status:
    contest.status ||
    'upcoming',

  startTime:
    contest.startTime ||
    contest.startsAt ||
    null,

  endTime:
    contest.endTime ||
    contest.endsAt ||
    null,

  userJoined: Boolean(
    contest.userJoined
  ),

  teamCreated: Boolean(
    contest.teamCreated
  ),

  timeLeft:
    contest.timeLeft ||
    contest.endsIn ||
    contest.duration ||
    '00:00:00',

  winnings:
    Array.isArray(contest.winnings) ? contest.winnings : [],

  contestPlayers:
    Array.isArray(contest.contestPlayers) ? contest.contestPlayers : [],

  matchName: contest.matchName || contest.title || '',
  tournamentName: contest.tournamentName || '',
  matchIdentifier: contest.matchIdentifier || '',
  matchDateTime: contest.matchDateTime || contest.startTime || contest.startsAt || null,
});

const normalizeLeaderboardRow = (
  row = {},
  index
) => ({
  ...row,

  rank:
    Number(
      row.rank
    ) ||
    index + 1,

  team:
    row.team ||
    row.teamName ||
    row.userName ||
    row.user?.name ||
    'Team',

  points: Number(
    row.points ??
      row.score ??
      0
  ),

  winnings: Number(
    row.winnings ??
      row.prize ??
      0
  ),

  mine: Boolean(
    row.mine ||
      row.isCurrentUser
  ),
});

export const getContests =
  async ({ game } = {}) => {
    const response =
      await api.get(
        '/contests',
        game ? { params: { game } } : undefined
      );

    return unwrapList(
      response.data,
      'contests'
    ).map(normalizeContest);
  };

export const joinContest =
  async (contestId) => {
    if (!contestId) {
      throw new Error(
        'Contest ID missing'
      );
    }

    const response = await api.post(
      '/contests/join',
      { contestId }
    );

    return response.data;
  };

export const createTeam =
  async ({
    contestId,
    players,
    totalCredits,
    captain,
    viceCaptain,
  }) => {
    if (!contestId) {
      throw new Error(
        'Contest ID missing'
      );
    }

    if (
      !Array.isArray(
        players
      ) ||
      players.length === 0
    ) {
      throw new Error(
        'Players required'
      );
    }

    const uniquePlayers =
      [...new Set(players)];

    const response =
      await api.post(
        '/team/create',
        {
          contestId,

          players:
            uniquePlayers,

          captain,
          viceCaptain,

          totalCredits:
            Number(
              totalCredits ||
                0
            ),
        }
      );

    return response.data;
  };

export const getMyTeam =
  async (contestId) => {
    if (!contestId) {
      return null;
    }

    const response = await api.get(`/team/contest/${contestId}/me`);
    return response.data?.team || null;
  };

export const getLeaderboard =
  async (contestId) => {
    if (!contestId) {
      return [];
    }

    const response =
      await api.get(
        `/leaderboard/${contestId}`
      );

    return unwrapList(
      response.data,
      'leaderboard'
    ).map(
      normalizeLeaderboardRow
    );
  };
