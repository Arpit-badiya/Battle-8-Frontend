import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminInfoRow from '../../components/admin/AdminInfoRow';
import AdminSection from '../../components/admin/AdminSection';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import StatusChip from '../../components/common/StatusChip';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import { showSuccess } from '../../utils/feedback';

const ScraperManagementScreen = ({ navigation }) => {
  const [status, setStatus] = useState({
    provider: '16Score',
    currentStatus: 'Idle',
    lastSync: 'Never',
    lastSuccess: 'Never',
    lastError: '-',
    htmlSize: '0 bytes',
    matchesFound: '0',
  });

  const markAction = (label) => {
    const now = new Date().toLocaleString();
    setStatus((current) => ({
      ...current,
      currentStatus: label,
      lastSync: now,
      lastSuccess: label === 'Test Connection' ? now : current.lastSuccess,
      lastError: '-',
    }));
    showSuccess(label);
  };

  return (
    <Screen>
      <Header title="Scraper Management" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminSection glow>
          <View style={styles.headerRow}>
            <View style={styles.providerBadge}>
              <Text style={styles.providerText}>{status.provider}</Text>
            </View>
            <StatusChip label={status.currentStatus} status="upcoming" />
          </View>
          <Text style={styles.copy}>
            Provider controls are restored for visibility and operator workflow. Scraping and parsing logic is not implemented here.
          </Text>
        </AdminSection>

        <AdminSection title="Provider Status">
          <AdminInfoRow label="Provider" value={status.provider} />
          <AdminInfoRow label="Current Status" value={status.currentStatus} />
          <AdminInfoRow label="Last Sync" value={status.lastSync} />
          <AdminInfoRow label="Last Success" value={status.lastSuccess} />
          <AdminInfoRow label="Last Error" value={status.lastError} />
          <AdminInfoRow label="HTML Size" value={status.htmlSize} />
          <AdminInfoRow label="Matches Found" value={status.matchesFound} />
        </AdminSection>

        <AdminSection title="Actions">
          <Button title="Sync Tournament" onPress={() => markAction('Sync Tournament')} />
          <Button title="Refresh" variant="outline" onPress={() => markAction('Refresh')} />
          <Button title="Test Connection" variant="secondary" onPress={() => markAction('Test Connection')} />
        </AdminSection>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  providerBadge: {
    minHeight: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  providerText: {
    color: colors.primary,
    ...typography.subtitle,
  },
  copy: {
    color: colors.textMuted,
    ...typography.bodySmall,
  },
});

export default ScraperManagementScreen;
