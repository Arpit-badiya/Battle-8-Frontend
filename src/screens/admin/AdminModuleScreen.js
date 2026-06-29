import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminInfoRow from '../../components/admin/AdminInfoRow';
import AdminSection from '../../components/admin/AdminSection';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import StatusChip from '../../components/common/StatusChip';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const moduleContent = {
  ContestManagement: {
    title: 'Contest Management',
    icon: 'podium',
    status: 'Live Controls',
    rows: [
      ['Create Contest', 'Available in Admin Operations'],
      ['Contest Controls', 'Live, cancel, rehost, complete, refund and restart'],
      ['Imports', 'Player imports and result imports are preserved'],
    ],
  },
  PlayerManagement: {
    title: 'Player Management',
    icon: 'person-add',
    status: 'Roster Tools',
    rows: [
      ['Single Player', 'Create individual players'],
      ['Team Players', 'Bulk team player creation'],
      ['Delete Player', 'Safe player removal controls'],
    ],
  },
  TeamManagement: {
    title: 'Team Management',
    icon: 'people',
    status: 'Team Tools',
    rows: [
      ['Create Team', 'Bulk team creation remains available'],
      ['Delete Team', 'Safe team removal and contest cleanup controls'],
      ['Team Selection', 'Contest team picker preserved'],
    ],
  },
  ResultManagement: {
    title: 'Result Management',
    icon: 'analytics',
    status: 'Result Tools',
    rows: [
      ['Complete Match', 'Manual fantasy result entry'],
      ['Complete Team Match', 'Team contest result entry'],
      ['Import Result File', 'CSV/XLS/XLSX result import remains available'],
    ],
  },
  WalletManagement: {
    title: 'Wallet Management',
    icon: 'wallet',
    status: 'Economy',
    rows: [
      ['Withdrawals', 'Approve, mark paid or reject requests'],
      ['Refunds', 'Contest refund control preserved'],
      ['Premium', 'Premium activation controls remain available'],
    ],
  },
  UsersManagement: {
    title: 'Users',
    icon: 'people-circle',
    status: 'Users',
    rows: [
      ['Dashboard Stats', 'User counts remain visible'],
      ['Premium Access', 'Admin premium user actions preserved'],
      ['Audit Safety', 'Existing backend protections unchanged'],
    ],
  },
  AdminSettings: {
    title: 'Settings',
    icon: 'settings',
    status: 'Ready',
    rows: [
      ['Theme', 'Battle-8 theme unchanged'],
      ['Navigation', 'Admin stack restored under the existing Admin tab'],
      ['Operations', 'Existing admin API integrations preserved'],
    ],
  },
};

const AdminModuleScreen = ({ navigation, route }) => {
  const config = moduleContent[route.name] || moduleContent.AdminSettings;

  return (
    <Screen>
      <Header title={config.title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AdminSection glow>
          <View style={styles.heroRow}>
            <View style={styles.iconWrap}>
              <Ionicons name={config.icon} size={26} color={colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>{config.title}</Text>
              <StatusChip label={config.status} status="upcoming" />
            </View>
          </View>
          <Text style={styles.copy}>
            This module restores the Admin Panel structure while keeping the existing backend-integrated controls intact.
          </Text>
        </AdminSection>

        <AdminSection title="Available Controls">
          {config.rows.map(([label, value]) => (
            <AdminInfoRow key={label} label={label} value={value} />
          ))}
          <Button title="Open Admin Operations" onPress={() => navigation.navigate('AdminOperations')} />
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.h3,
  },
  copy: {
    color: colors.textMuted,
    ...typography.bodySmall,
  },
});

export default AdminModuleScreen;
