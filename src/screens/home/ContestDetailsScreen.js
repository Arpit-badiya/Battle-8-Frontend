import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedView from '../../components/common/AnimatedView';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import ContestCard from '../../components/contest/ContestCard';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import { showError } from '../../utils/feedback';

const tabs = ['Upcoming', 'Live', 'Completed'];

const ContestDetailsScreen = ({ navigation }) => {
  const [active, setActive] = useState('Upcoming');
  const { contests, loading, refreshContests, setActiveContestId } = useAppData();
  const filteredContests = useMemo(() => contests.filter((contest) => {
    const status = contest.status || 'upcoming';
    const isMine = contest.userJoined || contest.teamCreated;

    if (!isMine) {
      return false;
    }

    if (active === 'Live') {
      return status === 'live';
    }

    if (active === 'Completed') {
      return status === 'completed' || status === 'cancelled';
    }

    return status === 'upcoming';
  }), [active, contests]);

  useFocusEffect(
    useCallback(() => {
      let activeScreen = true;

      const load = async () => {
        try {
          await refreshContests({ silent: contests.length > 0 });
        } catch (error) {
          if (activeScreen) {
            showError('Unable to load contests', error);
          }
        }
      };

      load();

      return () => {
        activeScreen = false;
      };
    }, [contests.length, refreshContests])
  );

  return (
    <Screen>
      <Header title="My Contests" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GlassCard style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable key={tab} onPress={() => setActive(tab)} style={[styles.tab, active === tab && styles.activeTab]}>
              <Text style={[styles.tabText, active === tab && styles.activeText]}>{tab}</Text>
            </Pressable>
          ))}
        </GlassCard>

        {loading.contests && contests.length === 0 ? (
          <Loader />
        ) : (
          filteredContests.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="trophy-outline" size={40} color={colors.primary} />
              <Text style={styles.emptyTitle}>No contests here yet</Text>
              <Text style={styles.emptyText}>Join a contest from the Home tab to see it here.</Text>
            </View>
          ) : filteredContests.map((contest, index) => (
            <AnimatedView key={contest.id} delay={index * 80}>
              <ContestCard
                contest={contest}
                showChevron
                onPress={() => {
                  setActiveContestId(contest.id);
                  navigation.navigate(contest.teamCreated ? 'MyTeam' : 'TeamBuilder', { contest, contestId: contest.id });
                }}
              />
            </AnimatedView>
          ))
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 110,
  },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textMuted,
    ...typography.caption,
  },
  activeText: {
    color: colors.textInverse,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  emptyTitle: {
    color: colors.text,
    ...typography.title,
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default ContestDetailsScreen;
