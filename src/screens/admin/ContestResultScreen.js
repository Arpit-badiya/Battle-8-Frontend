import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminInfoRow from '../../components/admin/AdminInfoRow';
import AdminSection from '../../components/admin/AdminSection';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import StatusChip from '../../components/common/StatusChip';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import { getAdminContestResult } from '../../services/adminService';
import { showError } from '../../utils/feedback';

const formatDate = (value) => {
  if (!value) return 'Not completed';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not completed' : date.toLocaleString();
};

const formatAmount = (value) => Number(value || 0).toFixed(0);

const ContestResultScreen = ({ navigation, route }) => {
  const { contests, refreshContests } = useAppData();
  const [selectedContestId, setSelectedContestId] = useState(route.params?.contestId || null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const resultContests = useMemo(
    () =>
      contests
        .filter((contest) => contest.status === 'completed' || contest.resultDeclared || contest.payoutsDistributed)
        .concat(
          contests.filter((contest) => contest.status !== 'completed' && !contest.resultDeclared && !contest.payoutsDistributed)
        ),
    [contests]
  );

  useEffect(() => {
    refreshContests({ silent: contests.length > 0 });
  }, [contests.length, refreshContests]);

  useEffect(() => {
    if (!selectedContestId && resultContests[0]?.id) {
      setSelectedContestId(resultContests[0].id);
    }
  }, [resultContests, selectedContestId]);

  const loadResult = async (contestId = selectedContestId) => {
    if (!contestId) return;

    setLoading(true);
    try {
      setResult(await getAdminContestResult(contestId));
    } catch (error) {
      showError('Unable to load contest result', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResult(selectedContestId);
  }, [selectedContestId]);

  const leaderboard = result?.leaderboard || [];
  const payouts = result?.result?.payouts || [];
  const prizeDistribution = result?.prizeDistribution || [];
  const contest = result?.contest || resultContests.find((item) => item.id === selectedContestId);

  return (
    <Screen>
      <Header title="Contest Results" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminSection title="Contest">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contestList}>
            {resultContests.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setSelectedContestId(item.id)}
                style={[styles.contestPill, selectedContestId === item.id && styles.contestPillActive]}
              >
                <Text numberOfLines={1} style={[styles.contestPillText, selectedContestId === item.id && styles.contestPillTextActive]}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Button
            title="Refresh Result"
            size="sm"
            variant="secondary"
            loading={loading}
            disabled={loading || !selectedContestId}
            onPress={() => loadResult()}
          />
        </AdminSection>

        {loading && !result ? (
          <Loader />
        ) : (
          <>
            <AdminSection title="Summary" glow>
              <View style={styles.headerRow}>
                <Text numberOfLines={1} style={styles.title}>{contest?.title || 'Contest'}</Text>
                <StatusChip label={contest?.status || 'upcoming'} status={contest?.status || 'upcoming'} />
              </View>
              <AdminInfoRow label="Participants" value={String(result?.participants ?? leaderboard.length ?? 0)} />
              <AdminInfoRow label="Completed Time" value={formatDate(result?.completedTime)} />
              <AdminInfoRow label="Prize Pool" value={`${formatAmount(contest?.prizePool || contest?.totalCollection)} coins`} />
            </AdminSection>

            <AdminSection title="Leaderboard">
              {leaderboard.length === 0 ? (
                <Text style={styles.empty}>Leaderboard will appear after teams are created.</Text>
              ) : (
                leaderboard.slice(0, 20).map((row) => (
                  <View key={row.teamId || `${row.rank}-${row.team}`} style={styles.resultRow}>
                    <Text style={styles.rank}>#{row.rank}</Text>
                    <Text numberOfLines={1} style={styles.name}>{row.team || row.userName}</Text>
                    <Text style={styles.points}>{Number(row.points || 0).toFixed(1)} pts</Text>
                    <Text style={styles.win}>+{formatAmount(row.winnings)}</Text>
                  </View>
                ))
              )}
            </AdminSection>

            <AdminSection title="Prize Distribution">
              {prizeDistribution.length === 0 ? (
                <Text style={styles.empty}>No prize distribution configured.</Text>
              ) : (
                prizeDistribution.map((prize) => (
                  <AdminInfoRow
                    key={`rank-${prize.rank}`}
                    label={`Rank ${prize.rank}`}
                    value={`${formatAmount(prize.amount)} coins`}
                  />
                ))
              )}
            </AdminSection>

            <AdminSection title="Payouts">
              {payouts.length === 0 ? (
                <Text style={styles.empty}>Payouts have not been distributed yet.</Text>
              ) : (
                payouts.map((payout) => (
                  <AdminInfoRow
                    key={`${payout.team}-${payout.rank}`}
                    label={`Rank ${payout.rank}`}
                    value={`${formatAmount(payout.amount)} coins`}
                  />
                ))
              )}
            </AdminSection>
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    paddingBottom: 140,
    gap: spacing.md,
  },
  contestList: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  contestPill: {
    maxWidth: 220,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  contestPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  contestPillText: {
    color: colors.textMuted,
    ...typography.caption,
  },
  contestPillTextActive: {
    color: colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    ...typography.subtitle,
  },
  resultRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    gap: spacing.sm,
  },
  rank: {
    width: 42,
    color: colors.coin,
    ...typography.caption,
  },
  name: {
    flex: 1,
    color: colors.text,
    ...typography.bodySmall,
  },
  points: {
    width: 82,
    textAlign: 'right',
    color: colors.text,
    ...typography.caption,
  },
  win: {
    width: 64,
    textAlign: 'right',
    color: colors.success,
    ...typography.caption,
  },
  empty: {
    color: colors.textMuted,
    ...typography.bodySmall,
  },
});

export default ContestResultScreen;
