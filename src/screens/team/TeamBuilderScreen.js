import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AnimatedView from '../../components/common/AnimatedView';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import PlayerCard from '../../components/team/PlayerCard';
import TeamHeader from '../../components/team/TeamHeader';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import useAppData from '../../hooks/useAppData';
import { getContestPlayers } from '../../services/playerService';
import { showError } from '../../utils/feedback';

const roles = ['All', 'Assaulter', 'Support', 'Sniper', 'IGL'];
const MAX_PLAYERS = 8;
const MAX_CREDITS = 75;
const PLAYER_ROW_HEIGHT = 66;

const TeamBuilderScreen = ({ navigation, route }) => {
  const routeContest = route.params?.contest;
  const { contests, createTeam, creatingTeam, players, refreshPlayers, setActiveContestId } = useAppData();
  const contest = contests.find((item) => (item.id || item._id) === (routeContest?.id || routeContest?._id)) || routeContest;
  const contestId = contest?.id || contest?._id;
  const [selected, setSelected] = useState([]);
  const [role, setRole] = useState('All');
  const [contestPlayers, setContestPlayers] = useState([]);
  const [loadingContestPlayers, setLoadingContestPlayers] = useState(false);
  const isContestLocked = ['live', 'completed', 'cancelled'].includes(contest?.status);

  useEffect(() => {
    setSelected([]);
  }, [contestId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoadingContestPlayers(true);
          const [, scopedPlayers] = await Promise.all([
            refreshPlayers({ silent: players.length > 0 }),
            getContestPlayers(contestId),
          ]);

          if (active) {
            setContestPlayers(scopedPlayers);
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
    }, [contestId, players.length, refreshPlayers])
  );

  const availablePlayers = contestPlayers;
  const selectedPlayers = useMemo(
    () => availablePlayers.filter((player) => selected.includes(player.id || player._id)),
    [availablePlayers, selected]
  );
  const usedCredits = selectedPlayers.reduce((sum, player) => sum + Number(player.credits || 0), 0);
  const creditsLeft = Number((MAX_CREDITS - usedCredits).toFixed(1));
  const filteredPlayers = role === 'All' ? availablePlayers : availablePlayers.filter((player) => player.role === role);
  const roleStats = useMemo(
    () =>
      roles
        .filter((item) => item !== 'All')
        .map((item) => ({
          label: item,
          current: selectedPlayers.filter((player) => player.role === item).length,
          total: availablePlayers.filter((player) => player.role === item).length,
        })),
    [availablePlayers, selectedPlayers]
  );

  const togglePlayer = useCallback((player) => {
    const playerId = player.id || player._id;
    if (!playerId || creatingTeam || isContestLocked) {
      return;
    }

    setSelected((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }
      if (current.length >= MAX_PLAYERS) {
        Alert.alert('Team full', 'You can select only 8 players.');
        return current;
      }
      const currentCredits = availablePlayers
        .filter((item) => current.includes(item.id || item._id))
        .reduce((sum, item) => sum + Number(item.credits || 0), 0);
      if (currentCredits + Number(player.credits || 0) > MAX_CREDITS) {
        Alert.alert('Credits exceeded', 'Choose a lower credit player to stay under 75 credits.');
        return current;
      }
      return [...current, playerId];
    });
  }, [availablePlayers, creatingTeam, isContestLocked]);

  const handleSubmit = useCallback(async () => {
    if (selected.length !== MAX_PLAYERS) {
      Alert.alert('Select 8 players', 'Complete your squad before joining.');
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

    try {
      const response = await createTeam({ contestId, players: selected, totalCredits: usedCredits });
      if (!response) {
        return;
      }
      setSelected([]);
      setActiveContestId(contestId);
      navigation.navigate('MainTabs', { screen: 'Leaderboard', params: { contestId } });
    } catch (error) {
      showError('Team creation failed', error);
    }
  }, [contestId, createTeam, navigation, selected, setActiveContestId, usedCredits]);

  const renderPlayer = useCallback(
    ({ item, index }) => (
      <AnimatedView delay={index * 20}>
        <PlayerCard
          player={item}
          selected={selected.includes(item.id || item._id)}
          disabled={creatingTeam || isContestLocked}
          onToggle={() => togglePlayer(item)}
        />
      </AnimatedView>
    ),
    [creatingTeam, isContestLocked, selected, togglePlayer]
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
      <TeamHeader selectedCount={selected.length} creditsLeft={creditsLeft} usedCredits={usedCredits} />

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
          <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleTab, role === item && styles.activeRole]}>
            <Text style={[styles.roleText, role === item && styles.activeRoleText]}>{item}</Text>
          </Pressable>
        ))}
      </View>

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
          extraData={selected}
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

      <View style={styles.footer}>
        <Button
          title={selected.length === MAX_PLAYERS ? 'Next' : `Next (${selected.length}/8)`}
          disabled={selected.length !== MAX_PLAYERS || creatingTeam || loadingContestPlayers || isContestLocked}
          loading={creatingTeam}
          onPress={handleSubmit}
        />
      </View>
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
    bottom: spacing.xl,
  },
});

export default TeamBuilderScreen;
