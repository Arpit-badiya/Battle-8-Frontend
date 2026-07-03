import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminDashboardCard from '../../components/admin/AdminDashboardCard';
import AdminInfoRow from '../../components/admin/AdminInfoRow';
import AdminSection from '../../components/admin/AdminSection';
import BrandLogo from '../../components/common/BrandLogo';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import StatusChip from '../../components/common/StatusChip';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import { getSchedulerStatus, startScheduler, stopScheduler } from '../../services/adminService';
import { showError, showSuccess } from '../../utils/feedback';

const adminCards = [
  { title: 'Tournament Management', subtitle: 'Create, edit, sync and manage tournament sources', icon: 'trophy', route: 'TournamentManagement', tone: colors.primary },
  { title: 'Match Management', subtitle: 'Review match timing, links and current status', icon: 'game-controller', route: 'MatchManagement', tone: colors.accent },
  { title: 'Contest Management', subtitle: 'Open contest creation, controls and imports', icon: 'podium', route: 'ContestManagement', tone: colors.coin },
  { title: 'Player Management', subtitle: 'Create players, import rosters and delete safely', icon: 'person-add', route: 'PlayerManagement', tone: colors.success },
  { title: 'Team Management', subtitle: 'Create teams, assign players and maintain team data', icon: 'people', route: 'TeamManagement', tone: colors.purple },
  { title: 'Result Management', subtitle: 'Import results, complete matches and monitor payouts', icon: 'analytics', route: 'ResultManagement', tone: colors.warning },
  { title: 'Scraper Management', subtitle: 'Provider status, sync telemetry and connection checks', icon: 'cloud-download', route: 'ScraperManagement', tone: colors.accent },
  { title: 'Wallet Management', subtitle: 'Withdrawals, refunds and economy controls', icon: 'wallet', route: 'WalletManagement', tone: colors.primary },
  { title: 'Users', subtitle: 'User actions, premium access and account controls', icon: 'people-circle', route: 'UsersManagement', tone: colors.success },
  { title: 'Settings', subtitle: 'Admin preferences and operational settings', icon: 'settings', route: 'AdminSettings', tone: colors.textMuted },
];

const formatSyncTime = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Never' : date.toLocaleString();
};

const AdminDashboardScreen = ({ navigation }) => {
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);

  const loadSchedulerStatus = async ({ silent = false } = {}) => {
    if (!silent) {
      setSchedulerLoading(true);
    }

    try {
      setSchedulerStatus(await getSchedulerStatus());
    } catch (error) {
      showError('Scheduler status failed', error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  useEffect(() => {
    loadSchedulerStatus({ silent: true });
  }, []);

  const runSchedulerAction = async (action) => {
    setSchedulerLoading(true);

    try {
      const nextStatus = action === 'start' ? await startScheduler() : await stopScheduler();
      setSchedulerStatus(nextStatus);
      showSuccess(action === 'start' ? 'Scheduler started' : 'Scheduler stopped');
    } catch (error) {
      showError(action === 'start' ? 'Scheduler start failed' : 'Scheduler stop failed', error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  return (
    <Screen>
      <Header title="Admin" branded centered={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BrandLogo size={46} glow />
          <View style={styles.heroCopy}>
            <Text style={styles.title}>Battle-8 Control</Text>
            <Text style={styles.subtitle}>Tournaments, contests, players, results and operations</Text>
          </View>
        </View>

        <AdminSection title="Match Scheduler" glow>
          <View style={styles.schedulerHeader}>
            <Text style={styles.schedulerTitle}>Automatic Match Monitoring</Text>
            <StatusChip
              label={schedulerStatus?.running ? 'Running' : 'Stopped'}
              status={schedulerStatus?.running ? 'live' : 'cancelled'}
            />
          </View>
          <AdminInfoRow label="Pending Matches" value={String(schedulerStatus?.pendingMatches ?? 0)} />
          <AdminInfoRow label="Completed Matches" value={String(schedulerStatus?.completedMatches ?? 0)} />
          <AdminInfoRow label="Last Sync" value={formatSyncTime(schedulerStatus?.lastSyncTime)} />
          <View style={styles.schedulerActions}>
            <Button
              title="Start Scheduler"
              size="sm"
              loading={schedulerLoading && !schedulerStatus?.running}
              disabled={schedulerLoading || schedulerStatus?.running}
              onPress={() => runSchedulerAction('start')}
            />
            <Button
              title="Stop Scheduler"
              size="sm"
              variant="outline"
              disabled={schedulerLoading || !schedulerStatus?.running}
              onPress={() => runSchedulerAction('stop')}
            />
            <Button
              title="Refresh Status"
              size="sm"
              variant="secondary"
              loading={schedulerLoading}
              disabled={schedulerLoading}
              onPress={() => loadSchedulerStatus()}
            />
          </View>
        </AdminSection>

        <View style={styles.grid}>
          {adminCards.map((card) => (
            <AdminDashboardCard
              key={card.route}
              title={card.title}
              subtitle={card.subtitle}
              icon={card.icon}
              tone={card.tone}
              onPress={() => navigation.navigate(card.route)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    paddingBottom: 140,
    gap: spacing.lg,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    ...typography.h3,
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs,
  },
  grid: {
    gap: spacing.md,
  },
  schedulerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  schedulerTitle: {
    flex: 1,
    color: colors.text,
    ...typography.subtitle,
  },
  schedulerActions: {
    gap: spacing.sm,
  },
});

export default AdminDashboardScreen;
