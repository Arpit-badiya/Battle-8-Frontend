import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AnimatedView from '../../components/common/AnimatedView';
import GameAvatar from '../../components/common/GameAvatar';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import { showError } from '../../utils/feedback';

const ROW_HEIGHT = 54;

const formatWinnings = (amount) => {
  const value = Number(amount || 0);
  return value > 0 ? `+${value}` : '-';
};

const LeaderboardScreen = ({ navigation, route }) => {
  const [active, setActive] = useState('All');
  const {
    activeContest,
    activeContestId,
    contests,
    leaderboards,
    loading,
    refreshContests,
    refreshLeaderboard,
    setActiveContestId,
  } = useAppData();
  const contestId = route.params?.contestId || activeContestId || activeContest?.id;
  const contest = useMemo(
    () => contests.find((item) => item.id === contestId) || activeContest,
    [activeContest, contestId, contests]
  );
  const rows = contest?.id ? leaderboards[contest.id] || [] : [];
  const podium = rows.slice(0, 3);
  const tableRows = rows.slice(3);
  const contestStatus = (contest?.status || 'upcoming').toUpperCase();

  useFocusEffect(
    useCallback(() => {
      let screenActive = true;

      const load = async () => {
        try {
          const latestContests = await refreshContests({ silent: contests.length > 0 });
          const selectedContest =
            latestContests.find((item) => item.id === route.params?.contestId) ||
            latestContests.find((item) => item.id === activeContestId) ||
            latestContests[0];

          if (screenActive && selectedContest?.id) {
            setActiveContestId(selectedContest.id);
            await refreshLeaderboard(selectedContest.id, { silent: rows.length > 0 });
          }
        } catch (error) {
          if (screenActive) {
            showError('Unable to load leaderboard', error);
          }
        }
      };

      load();

      return () => {
        screenActive = false;
      };
    }, [activeContestId, contests.length, refreshContests, refreshLeaderboard, route.params?.contestId, rows.length, setActiveContestId])
  );

  const renderItem = useCallback(({ item, index }) => (
    <AnimatedView delay={index * 50}>
      <View style={[styles.row, item.mine && styles.myRow]}>
        <Text style={styles.rankText}>#{item.rank}</Text>
        <View style={styles.teamCell}>
          <GameAvatar name={item.team} size={32} />
          <Text numberOfLines={1} style={[styles.teamName, item.mine && styles.mineText]}>{item.team}</Text>
        </View>
        <Text style={styles.points}>{Number(item.points || 0).toFixed(1)}</Text>
        <Text style={styles.winnings}>{formatWinnings(item.winnings)}</Text>
      </View>
    </AnimatedView>
  ), []);

  const getItemLayout = useCallback(
    (_, index) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <Screen>
      <Header title="Leaderboard" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <View style={styles.segment}>
        {['All', 'Friends'].map((tab) => (
          <Pressable key={tab} onPress={() => setActive(tab)} style={[styles.segmentItem, active === tab && styles.segmentActive]}>
            <Text style={[styles.segmentText, active === tab && styles.segmentTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {loading.leaderboard && rows.length === 0 ? (
        <Loader />
      ) : (
        <View style={styles.content}>
          <View style={styles.headerLine}>
            <Text numberOfLines={1} style={styles.contestTitle}>
              {contest?.title || 'Contest Leaderboard'}
            </Text>
            <Text style={[styles.statusBadge, contest?.status === 'live' && styles.liveBadge, contest?.status === 'completed' && styles.completedBadge]}>
              {contestStatus}
            </Text>
          </View>

          <View style={styles.podium}>
            {podium.map((item, index) => (
              <GlassCard key={`${item.rank}-${item.team}-${index}`} style={[styles.podiumCard, index === 0 && styles.winnerCard]} glow={index === 0}>
                <View style={[styles.rankBadge, index === 0 && styles.winnerBadge]}>
                  <Text style={styles.rankBadgeText}>#{item.rank}</Text>
                </View>
                <Ionicons name="trophy" size={22} color={index === 0 ? colors.coin : colors.textMuted} />
                <GameAvatar name={item.team} size={50} />
                <Text numberOfLines={1} style={styles.podiumName}>{item.team}</Text>
                <Text style={styles.podiumPoints}>{Number(item.points || 0).toFixed(1)}</Text>
                <Text style={styles.podiumWinnings}>{formatWinnings(item.winnings)} coins</Text>
              </GlassCard>
            ))}
          </View>

          <View style={styles.tableHead}>
            <Text style={styles.rankHead}>Rank</Text>
            <Text style={styles.teamHead}>Team</Text>
            <Text style={styles.pointsHead}>Points</Text>
            <Text style={styles.winHead}>Win</Text>
          </View>
          <GlassCard style={styles.table}>
            {rows.length === 0 ? (
              <Text style={styles.emptyText}>Leaderboard will appear after teams are created.</Text>
            ) : (
              <FlatList
                data={tableRows}
                keyExtractor={(item, index) => item.teamId || `${item.rank}-${item.team}-${item.points}-${index}`}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialNumToRender={12}
                scrollEnabled={false}
              />
            )}
          </GlassCard>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: 200,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.textMuted,
    ...typography.caption,
  },
  segmentTextActive: {
    color: colors.textInverse,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 110,
  },
  headerLine: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  contestTitle: {
    flex: 1,
    color: colors.text,
    ...typography.title,
  },
  statusBadge: {
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.accentDark,
    color: colors.white,
    ...typography.micro,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  liveBadge: {
    backgroundColor: colors.live,
  },
  completedBadge: {
    backgroundColor: colors.textMuted,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  podiumCard: {
    flex: 1,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    position: 'relative',
  },
  winnerCard: {
    minHeight: 150,
  },
  rankBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surfaceMuted,
  },
  winnerBadge: {
    backgroundColor: colors.coinSoft,
  },
  rankBadgeText: {
    color: colors.coin,
    ...typography.micro,
  },
  podiumName: {
    color: colors.text,
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: '100%',
  },
  podiumPoints: {
    color: colors.text,
    ...typography.subtitle,
    marginTop: 2,
  },
  podiumWinnings: {
    color: colors.coin,
    ...typography.micro,
    marginTop: 2,
  },
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  rankHead: {
    width: 50,
    color: colors.textMuted,
    ...typography.caption,
  },
  teamHead: {
    flex: 1,
    color: colors.textMuted,
    ...typography.caption,
  },
  pointsHead: {
    width: 72,
    color: colors.textMuted,
    textAlign: 'right',
    ...typography.caption,
  },
  winHead: {
    width: 56,
    color: colors.textMuted,
    textAlign: 'right',
    ...typography.caption,
  },
  table: {
    overflow: 'hidden',
  },
  emptyText: {
    color: colors.textMuted,
    ...typography.bodySmall,
    textAlign: 'center',
    padding: spacing.lg,
  },
  row: {
    minHeight: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  myRow: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
  },
  rankText: {
    width: 50,
    color: colors.text,
    ...typography.body,
  },
  teamCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamName: {
    color: colors.text,
    ...typography.bodySmall,
  },
  mineText: {
    color: colors.primary,
  },
  points: {
    width: 72,
    textAlign: 'right',
    color: colors.text,
    ...typography.bodySmall,
  },
  winnings: {
    width: 56,
    textAlign: 'right',
    color: colors.coin,
    ...typography.caption,
  },
});

export default LeaderboardScreen;
