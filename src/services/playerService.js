import api from './api';

const unwrapList = (
  payload
) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    Array.isArray(
      payload?.players
    )
  ) {
    return payload.players;
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

const normalizePlayer = (
  player = {}
) => ({
  ...player,

  id:
    player._id ||
    player.id,

  name:
    player.name ||
    player.username ||
    player.ign ||
    'Player',

  team:
    player.team ||
    player.teamName ||
    'Unknown Team',

  role:
    player.role ||
    player.position ||
    'BAT',

  credits: Number(
    player.credits ??
      player.credit ??
      0
  ),
});

export const getPlayers =
  async () => {
    const response =
      await api.get(
        '/players'
      );

    return unwrapList(
      response.data
    ).map(
      normalizePlayer
    );
  };

export const getContestPlayers =
  async (contestId) => {
    if (!contestId) {
      return [];
    }

    const response =
      await api.get(
        `/players/contest/${contestId}`
      );

    return unwrapList(
      response.data
    ).map(
      normalizePlayer
    );
  };
