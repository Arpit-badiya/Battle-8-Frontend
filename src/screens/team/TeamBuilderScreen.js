import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AnimatedView from '../../components/common/AnimatedView';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import SearchableSelector from '../../components/common/SearchableSelector';
import PlayerCard from '../../components/team/PlayerCard';
import TeamHeader from '../../components/team/TeamHeader';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import useAppData from '../../hooks/useAppData';
import { getMyTeam } from '../../services/contestService';
import { getContestPlayers } from '../../services/playerService';
import { showError } from '../../utils/feedback';

const roles = ['All', 'IGL', 'Assaulter', 'Supporter'];
const MAX_PLAYERS = 8;
const MAX_CREDITS = 75;
const PLAYER_ROW_HEIGHT = 66;
const getPlayerId = (player = {}) => String(player.id || player._id || '');

const TeamBuilderScreen = ({ navigation, route }) => {
  const routeContest = route.params?.contest;
  const { contests, creatingTeam, players, refreshPlayers } = useAppData();
  const contest =
    contests.find((item) => (item.id || item._id) === (routeContest?.id || routeContest?._id)) ||
    routeContest;
  const contestId = contest?.id || contest?._id;

  // selected: array of player id strings (order preserved)
  // selectedPlayerMap: id → player object (survives team tab switches)
  const [selected, setSelected] = useState([]);
  const [selectedPlayerMap, setSelectedPlayerMap] = useState({});
  const [role, setRole] = useState('All');
  const [contestPlayers, setContestPlayers] = useState([]);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [myTeam, setMyTeam] = useState(null);
  const [loadingContestPlayers, setLoadingContestPlayers] = useState(false);

  // Keep a ref so togglePlayer always reads the latest selectedTeamName
  // without needing to be in its dependency array (avoids stale-closure bug
  // when FlatList renders with a cached renderItem).
  const selectedTeamNameRef = useRef(selectedTeamName);
  useEffect(() => {
    selectedTeamNameRef.current = selectedTeamName;
  }, [selectedTeamName]);

  const isContestLocked = ['live', 'completed', 'cancelled'].includes(contest?.status);

  // Reset all local state when the contest changes
  useEffect(() => {
    setSelected([]);
    setSelectedPlayerMap({});
    setSelectedTeamName('');
    setMyTeam(null);
    setRole('All');
  }, [contestId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoadingContestPlayers(true);
          const [teamResponse, , scopedPlayers] = await Promise.all([
            contest?.teamCreated ? getMyTeam(contestId).catch(() => null) : Promise.resolve(null),
            refreshPlayers({ silent: players.length > 0 }),
            getContestPlayers(contestId),
          ]);

          if (active) {
            setContestPlayers(scopedPlayers);
            setMyTeam(teamResponse);
          }
        } catch (error) {
          if (active) {
            showError('Unable to load players', error);
          }
        } finally {
          if (active) {
            setLoadingContestPlayers(false);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [contest?.teamCreated, contestId, players.length, refreshPlayers])
  );

  const teamNames = useMemo(
    () => [...new Set(contestPlayers.map((p) => p.team).filter(Boolean))].sort(),
    [contestPlayers]
  );

  const contestPlayersById = useMemo(
    () =>
      new Map(
        contestPlayers
          .map((p) => [getPlayerId(p), p])
          .filter(([id]) => Boolean(id))
      ),
    [contestPlayers]
  );

  // Keep selectedPlayerMap in sync when contestPlayers refreshes
  useEffect(() => {
    if (selected.length === 0 || contestPlayersById.size === 0) return;

    setSelectedPlayerMap((current) => {
      let changed = false;
      const next = { ...current };

      selected.forEach((playerId) => {
        const latest = contestPlayersById.get(playerId);
        if (latest && next[playerId] !== latest) {
          next[playerId] = latest;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [contestPlayersById, selected]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const selectedPlayers = useMemo(
    () =>
      selected
        .map((id) => selectedPlayerMap[id] || contestPlayersById.get(id))
        .filter(Boolean),
    [contestPlayersById, selected, selectedPlayerMap]
  );

  const usedCredits = useMemo(
    () => selectedPlayers.reduce((sum, p) => sum + Number(p.credits || 0), 0),
    [selectedPlayers]
  );
  const creditsLeft = Number((MAX_CREDITS - usedCredits).toFixed(1));

  const availablePlayers = useMemo(
    () =>
      selectedTeamName
        ? contestPlayers.filter((p) => p.team === selectedTeamName)
        : contestPlayers,
    [contestPlayers, selectedTeamName]
  );

  const filteredPlayers = useMemo(
    () =>
      role === 'All'
        ? availablePlayers
        : availablePlayers.filter((p) => p.role === role),
    [availablePlayers, role]
  );

  const roleStats = useMemo(
    () =>
      roles
        .filter((r) => r !== 'All')
        .map((r) => ({
          label: r,
          current: selectedPlayers.filter((p) => p.role === r).length,
          total: availablePlayers.filter((p) => p.role === r).length,
        })),
    [availablePlayers, selectedPlayers]
  );

  // togglePlayer uses a ref for selectedTeamName so the FlatList renderItem
  // callback never goes stale when the user switches team tabs.
  const togglePlayer = useCallback(
    (player) => {
      const playerId = getPlayerId(player);
      if (!playerId || creatingTeam || isContestLocked) return;

      const isSelected = selectedSet.has(playerId);

      if (isSelected) {
        // Deselect: remove from both arrays atomically via functional updates
        setSelected((prev) => prev.filter((id) => id !== playerId));
        setSelectedPlayerMap((prev) => {
          const next = { ...prev };
          delete next[playerId];
          return next;
        });
        return;
      }

      // Select guards
      if (!selectedTeamNameRef.current) {
        Alert.alert('Select team', 'Choose an esports team before selecting players.');
        return;
      }
      if (selected.length >= MAX_PLAYERS) {
        Alert.alert('Team full', `You can select only ${MAX_PLAYERS} players.`);
        return;
      }
      const currentCredits = selectedPlayers.reduce(
        (sum, p) => sum + Number(p.credits || 0),
        0
      );
      if (currentCredits + Number(player.credits || 0) > MAX_CREDITS) {
        Alert.alert('Credits exceeded', 'Choose a lower credit player to stay under 75 credits.');
        return;
      }

      // Add to both maps atomically
      setSelected((prev) => [...prev, playerId]);
      setSelectedPlayerMap((prev) => ({ ...prev, [playerId]: player }));
    },
    // selectedSet and selectedPlayers are derived from selected — including them
    // keeps the guards accurate without stale reads.
    [creatingTeam, isContestLocked, selected, selectedPlayers, selectedSet]
  );

  const handleSubmit = useCallback(() => {
    if (selected.length !== MAX_PLAYERS) {
      Alert.alert(`Select ${MAX_PLAYERS} players`, 'Complete your team before continuing.');
      return;
    }
    if (!contestId) {
      Alert.alert('Contest missing', 'Go back and select a contest again.');
      return;
    }
    if (usedCredits > MAX_CREDITS) {
      Alert.alert('Credits exceeded', 'Update your team before continuing.');
      return;
    }

    navigation.navigate('CaptainSelection', {
      contest,
      contestId,
      selectedPlayerIds: selected,
      selectedPlayers,
      selectedTeamName,
      totalCredits: usedCredits,
    });
  }, [contest, contestId, navigation, selected, selectedPlayers, selectedTeamName, usedCredits]);

  const chooseTeam = useCallback(
    (teamName) => {
      if (creatingTeam || isContestLocked) return;
      setSelectedTeamName(teamName);
    },
    [creatingTeam, isContestLocked]
  );

  // extraData includes selectedSet AND togglePlayer so FlatList re-renders
  // correctly when either the selection or the callback changes.
  const flatListExtraData = useMemo(
    () => ({ selectedSet, togglePlayer }),
    [selectedSet, togglePlayer]
  );

  const renderPlayer = useCallback(
    ({ item, index }) => (
      <AnimatedView delay={index * 20}>
        <PlayerCard
          player={item}
          selected={flatListExtraData.selectedSet.has(getPlayerId(item))}
          disabled={creatingTeam || isContestLocked}
          onToggle={() => flatListExtraData.togglePlayer(item)}
        />
      </AnimatedView>
    ),
    [creatingTeam, isContestLocked, flatListExtraData]
  );

  const getPlayerLayout = useCallback(
    (_, index) => ({
      length: PLAYER_ROW_HEIGHT,
      offset: PLAYER_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <Screen>
      <Header
        title="Create Team"
        onBack={() => navigation.goBack()}
        right={<Ionicons name="help-circle-outline" size={28} color={colors.text} />}
      />

      {myTeam ? (
        <GlassCard style={styles.myTeamCard}>
          <Text style={styles.myTeamTitle}>My Team</Text>
          <View style={styles.myTeamStats}>
            <Text style={styles.myTeamStat}>Rank #{myTeam.rank || '-'}</Text>
            <Text style={styles.myTeamStat}>{myTeam.points || 0} pts</Text>
            <Text style={styles.myTeamStat}>{myTeam.selectedTeamName || 'Team'}</Text>
          </View>
          {(myTeam.players || []).map((player) => (
            <View key={player._id || player.id} style={styles.myPlayerRow}>
              <View style={styles.myPlayerMain}>
                <Text style={styles.myPlayerName}>
                  {player.name}{player.isCaptain ? ' (C)' : player.isViceCaptain ? ' (VC)' : ''}
                </Text>
                <Text style={styles.myPlayerMeta}>
                  {player.active ? 'Active' : 'Inactive'} | {player.kills || 0} kills | #{player.placement || '-'}
                </Text>
              </View>
              <Text style={styles.myPlayerPoints}>{player.points || 0}</Text>
            </View>
          ))}
        </GlassCard>
      ) : (
        <TeamHeader
          selectedCount={selected.length}
          creditsLeft={creditsLeft}
          usedCredits={usedCredits}
          maxPlayers={MAX_PLAYERS}
        />
      )}

      {!myTeam && (
        <>
          <View style={styles.teamSelectorRow}>
            <SearchableSelector
              label="Select Team"
              value={selectedTeamName}
              placeholder="Tap to choose a team"
              options={teamNames}
              onSelect={(teamName) => chooseTeam(teamName)}
              disabled={creatingTeam || isContestLocked}
              emptyText="No teams available for this contest."
            />
          </View>

          <GlassCard style={styles.roleStats}>
            {roleStats.map((item) => (
              <View key={item.label} style={styles.roleStat}>
                <Text style={styles.roleStatValue}>{item.current} / {item.total}</Text>
                <Text style={styles.roleStatLabel}>{item.label}</Text>
                <View style={styles.roleLine} />
              </View>
            ))}
          </GlassCard>

          <View style={styles.roleTabs}>
            {roles.map((item) => (
              <Pressable
                key={item}
                onPress={() => setRole(item)}
                style={[styles.roleTab, role === item && styles.activeRole]}
              >
                <Text style={[styles.roleText, role === item && styles.activeRoleText]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <GlassCard style={styles.playerPanel}>
        <View style={styles.playerPanelHead}>
          <Text style={styles.helper}>
            {loadingContestPlayers ? 'Loading Players' : 'Contest Players'}
          </Text>
          <Text style={styles.creditHead}>Credits</Text>
        </View>
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderPlayer}
          getItemLayout={getPlayerLayout}
          extraData={flatListExtraData}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          removeClippedSubviews
          windowSize={7}
          ListFooterComponent={<View style={styles.footerSpace} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Admin has not added players to this contest yet.
            </Text>
          }
        />
      </GlassCard>

      {!myTeam && (
        <View style={styles.footer}>
          <Button
            title={
              selected.length === MAX_PLAYERS
                ? 'Next'
                : `Select Players (${selected.length}/${MAX_PLAYERS})`
            }
            disabled={
              selected.length !== MAX_PLAYERS ||
              creatingTeam ||
              loadingContestPlayers ||
              isContestLocked
            }
            loading={creatingTeam}
            onPress={handleSubmit}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  roleStats: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  teamSelectorRow: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
  },
  myTeamCard: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  myTeamTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  myTeamStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  myTeamStat: {
    flex: 1,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  myPlayerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  myPlayerMain: {
    flex: 1,
    minWidth: 0,
  },
  myPlayerName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  myPlayerMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  myPlayerPoints: {
    color: colors.coin,
    fontSize: 16,
    fontWeight: '900',
  },
  roleStat: {
    flex: 1,
    alignItems: 'center',
  },
  roleStatValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  roleStatLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
  },
  roleLine: {
    width: 26,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  roleTabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  roleTab: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeRole: {
    backgroundColor: 'rgba(85,255,23,0.14)',
  },
  roleText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  activeRoleText: {
    color: colors.primary,
  },
  playerPanel: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    flex: 1,
    marginBottom: 82,
  },
  playerPanelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  helper: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  creditHead: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    padding: spacing.lg,
  },
  list: {
    overflow: 'hidden',
  },
  footerSpace: {
    height: 88,
  },
  footer: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    bottom: spacing.xxl,
  },
});

export default TeamBuilderScreen;
