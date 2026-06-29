import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedView from '../../components/common/AnimatedView';
import CoinBadge from '../../components/common/CoinBadge';
import GameAvatar from '../../components/common/GameAvatar';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import NetworkBanner from '../../components/common/NetworkBanner';
import Screen from '../../components/common/Screen';
import ContestCard from '../../components/contest/ContestCard';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import useAuth from '../../hooks/useAuth';
import { showError } from '../../utils/feedback';

const gameOptions = ['All', 'BGMI', 'Free Fire', 'Valorant', 'COD Mobile'];

const StatItem = ({ label, value, highlight }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, highlight && styles.statHighlight]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    contests,
    loading,
    network,
    refreshContests,
    refreshWallet,
    setActiveContestId,
    wallet,
  } = useAppData();
  const fade = useRef(new Animated.Value(0)).current;
  const [selectedGame, setSelectedGame] = useState('All');

  const visibleContests = useMemo(
    () =>
      selectedGame === 'All'
        ? contests
        : contests.filter((contest) => (contest.game || 'BGMI') === selectedGame),
    [contests, selectedGame]
  );

  const featuredContest = visibleContests[0];

  const stats = useMemo(() => {
    const joined = contests.filter((c) => c.userJoined).length;
    const teams = contests.filter((c) => c.teamCreated).length;
    const winnings = wallet?.winningCoins ?? wallet?.balance ?? 0;
    return [
      { label: 'Global Rank', value: '-', highlight: true },
      { label: 'Winnings', value: winnings, highlight: false },
      { label: 'My Teams', value: teams, highlight: false },
      { label: 'Played', value: joined, highlight: false },
    ];
  }, [contests, wallet]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          await Promise.all([refreshContests({ silent: contests.length > 0 }), refreshWallet({ silent: true })]);
          if (active) {
            Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
          }
        } catch (error) {
          if (active) {
            showError('Unable to load contests', error);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [contests.length, fade, refreshContests, refreshWallet])
  );

  const handleJoin = (contest) => {
    try {
      if (contest.teamCreated) {
        setActiveContestId(contest.id);
        navigation.navigate('Leaderboard', { contestId: contest.id });
        return;
      }

      setActiveContestId(contest.id);

      if (contest.contestType === 'team') {
        navigation.navigate('TeamContestBuilder', { contest, contestId: contest.id });
        return;
      }

      navigation.navigate('TeamBuilder', { contest, contestId: contest.id });
    } catch (error) {
      showError('Unable to open team builder', error);
    }
  };

  const displayName = user?.name || 'Player';

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <NetworkBanner network={network} />

        <View style={styles.topBar}>
          <View style={styles.greeting}>
            <Pressable onPress={() => navigation.navigate('Profile')} hitSlop={10}>
              <GameAvatar name={displayName} size={42} />
            </Pressable>
            <View>
              <Text style={styles.hello}>Ready to compete?</Text>
              <Text style={styles.rankLabel}>{displayName}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <CoinBadge amount={user?.coins ?? 0} />
            <Pressable style={styles.iconAction} onPress={() => navigation.navigate('Wallet')}>
              <Ionicons name="add" size={20} color={colors.white} />
            </Pressable>
            <Pressable style={styles.iconAction}>
              <Ionicons name="notifications-outline" size={20} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <AnimatedView>
          <GlassCard style={styles.statsCard}>
            {stats.map((item, index) => (
              <View key={item.label} style={styles.statWrap}>
                <StatItem label={item.label} value={item.value} highlight={item.highlight} />
                {index < stats.length - 1 && <View style={styles.statDivider} />}
              </View>
            ))}
          </GlassCard>
        </AnimatedView>

        {featuredContest && (
          <AnimatedView delay={80}>
            <GlassCard style={styles.featuredCard} glow>
              <View style={styles.featuredWatermark}>
                <Ionicons name="trophy" size={140} color="rgba(232,181,58,0.08)" />
              </View>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>FEATURED</Text>
              </View>
              <View style={styles.featuredCopy}>
                <Text style={styles.featuredTitle}>{featuredContest.title || 'Champions Circuit'}</Text>
                <Text style={styles.featuredPrize}>Prize Pool {featuredContest.prizePool || 0} coins</Text>
                <Pressable
                  style={styles.featuredButton}
                  onPress={() => handleJoin(featuredContest)}
                >
                  <Text style={styles.featuredButtonText}>Join Now</Text>
                </Pressable>
              </View>
            </GlassCard>
          </AnimatedView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Contests</Text>
          <Pressable onPress={() => navigation.navigate('MyContests')}>
            <Text style={styles.link}>View All</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gameFilter}
        >
          {gameOptions.map((game) => {
            const selected = selectedGame === game;
            return (
              <Pressable
                key={game}
                onPress={() => setSelectedGame(game)}
                style={[styles.gamePill, selected && styles.gamePillActive]}
              >
                <Text numberOfLines={1} style={[styles.gamePillText, selected && styles.gamePillTextActive]}>
                  {game}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading.contests && contests.length === 0 ? (
          <Loader />
        ) : (
          <Animated.View style={{ opacity: fade }}>
            {visibleContests.map((contest, index) => (
              <AnimatedView key={contest.id} delay={index * 80}>
                <ContestCard
                  contest={contest}
                  onJoin={() => handleJoin(contest)}
                />
              </AnimatedView>
            ))}
            {visibleContests.length === 0 && (
              <Text style={styles.emptyText}>No contests for this game yet.</Text>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 108,
  },
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  hello: {
    color: colors.text,
    ...typography.subtitle,
  },
  rankLabel: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  statsCard: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
  },
  statWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statHighlight: {
    color: colors.primary,
  },
  statLabel: {
    color: colors.textMuted,
    ...typography.micro,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderSoft,
  },
  featuredCard: {
    minHeight: 160,
    marginTop: spacing.md,
    padding: spacing.lg,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  featuredWatermark: {
    position: 'absolute',
    right: -20,
    top: -10,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  featuredBadgeText: {
    color: colors.textInverse,
    ...typography.micro,
  },
  featuredCopy: {
    maxWidth: '70%',
  },
  featuredTitle: {
    color: colors.text,
    ...typography.h3,
  },
  featuredPrize: {
    color: colors.primary,
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
  featuredButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  featuredButtonText: {
    color: colors.textInverse,
    ...typography.button,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    ...typography.caption,
  },
  gameFilter: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  gamePill: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gamePillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  gamePillText: {
    color: colors.textMuted,
    ...typography.caption,
  },
  gamePillTextActive: {
    color: colors.primary,
  },
  emptyText: {
    color: colors.textMuted,
    ...typography.bodySmall,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default HomeScreen;
