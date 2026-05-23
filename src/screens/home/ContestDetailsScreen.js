import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedView from '../../components/common/AnimatedView';
import GlassCard from '../../components/common/GlassCard';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import ContestCard from '../../components/contest/ContestCard';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
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
      <Text style={styles.title}>My Contests</Text>
      <GlassCard style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable key={tab} onPress={() => setActive(tab)} style={[styles.tab, active === tab && styles.activeTab]}>
            <Text style={[styles.tabText, active === tab && styles.activeText]}>{tab}</Text>
          </Pressable>
        ))}
      </GlassCard>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading.contests && contests.length === 0 ? (
          <Loader />
        ) : (
          filteredContests.length === 0 ? (
            <Text style={styles.emptyText}>No contests here yet.</Text>
          ) : filteredContests.map((contest, index) => (
            <AnimatedView key={contest.id} delay={index * 80}>
              <ContestCard
                contest={contest}
                showChevron
                onPress={() => {
                  setActiveContestId(contest.id);
                  navigation.navigate('TeamBuilder', { contest });
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
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    padding: 4,
    borderRadius: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: colors.primaryDark,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
  },
  activeText: {
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    paddingBottom: 110,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});

export default ContestDetailsScreen;
