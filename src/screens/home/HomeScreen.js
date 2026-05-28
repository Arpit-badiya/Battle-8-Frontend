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
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import useAuth from '../../hooks/useAuth';
import { showError } from '../../utils/feedback';

const categories = [
  { label: 'All Contests', icon: 'trophy' },
  { label: 'Hot Contests', icon: 'flame' },
  { label: 'Mega Contests', icon: 'diamond' },
  { label: 'Practice', icon: 'game-controller' },
];
const gameOptions = ['All', 'BGMI', 'Free Fire', 'Valorant', 'COD Mobile'];

const Hero = ({ onPress }) => (
  <Pressable onPress={onPress}>
    <GlassCard style={styles.hero} glow>
    <View style={styles.heroSparkOne} />
    <View style={styles.heroSparkTwo} />
    <View style={styles.heroCopy}>
      <Text style={styles.heroTitle}>CREATE YOUR TEAM</Text>
      <Text style={styles.heroTitle}>JOIN CONTESTS</Text>
      <Text style={styles.heroWin}>WIN COINS</Text>
      <View style={styles.playNow}>
        <Text style={styles.playNowText}>PLAY NOW</Text>
      </View>
    </View>
    <View style={styles.heroSoldiers}>
      <GameAvatar name="A" size={74} />
      <GameAvatar name="B" size={74} />
    </View>
    </GlassCard>
  </Pressable>
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

      if (contest.userJoined) {
        setActiveContestId(contest.id);
        navigation.navigate('TeamBuilder', { contest, contestId: contest.id });
        return;
      }

      setActiveContestId(contest.id);
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
              <GameAvatar name={displayName} size={46} />
            </Pressable>
            <View>
              <Text style={styles.hello}>Hello, {displayName}</Text>
              <Text style={styles.rankLabel}>Pro Player</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <CoinBadge amount={user?.coins ?? 0} />
            <Pressable style={styles.addCoin} onPress={() => navigation.navigate('Wallet')}>
              <Ionicons name="add" size={22} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <AnimatedView>
          <Hero onPress={() => navigation.navigate('MyContests')} />
        </AnimatedView>

        <GlassCard style={styles.coinComingSoon}>
          <View style={styles.coinIcon}>
            <Ionicons name="wallet" size={22} color={colors.coin} />
          </View>
          <View style={styles.coinCopy}>
            <Text style={styles.coinTitle}>Earn Coins</Text>
            <Text style={styles.coinSub}>Watch ads for entry coins. Winnings stay withdrawable.</Text>
          </View>
        </GlassCard>

        <View style={styles.categoryRow}>
          {categories.map((item, index) => (
            <AnimatedView key={item.label} delay={index * 70} style={styles.categoryWrap}>
              <GlassCard style={styles.categoryCard}>
                <Ionicons name={item.icon} size={27} color={index === 1 ? colors.white : colors.coin} />
              </GlassCard>
              <Text style={styles.categoryText}>{item.label}</Text>
            </AnimatedView>
          ))}
        </View>

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
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  hello: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  rankLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addCoin: {
    width: 31,
    height: 31,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },
  hero: {
    height: 150,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(255,191,24,0.35)',
  },
  heroCopy: {
    flex: 1,
    zIndex: 2,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  heroWin: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  playNow: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    backgroundColor: colors.coin,
    borderRadius: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  playNowText: {
    color: colors.black,
    fontWeight: '900',
    fontSize: 12,
  },
  heroSoldiers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8,
  },
  heroSparkOne: {
    position: 'absolute',
    right: 10,
    bottom: -25,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 191, 24, 0.16)',
  },
  heroSparkTwo: {
    position: 'absolute',
    left: 10,
    top: 8,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(85, 255, 23, 0.08)',
  },
  coinComingSoon: {
    marginTop: spacing.md,
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  coinIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,191,24,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,191,24,0.2)',
  },
  coinCopy: {
    flex: 1,
    minWidth: 0,
  },
  coinTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  coinSub: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  categoryWrap: {
    flex: 1,
    alignItems: 'center',
  },
  categoryCard: {
    width: '100%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
    marginTop: spacing.xs,
    textAlign: 'center',
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
    fontSize: 13,
    fontWeight: '900',
  },
  gameFilter: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  gamePill: {
    minHeight: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gamePillActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(85,255,23,0.14)',
  },
  gamePillText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  gamePillTextActive: {
    color: colors.primary,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default HomeScreen;
