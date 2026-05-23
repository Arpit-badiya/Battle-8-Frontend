import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import GlassCard from '../common/GlassCard';

const Stat = ({ label, value, highlight, icon }) => (
  <View style={styles.stat}>
    <Text style={styles.label}>{label}</Text>
    {icon ? <Ionicons name={icon} size={32} color={colors.tabInactive} /> : <Text style={[styles.value, highlight && styles.highlight]}>{value}</Text>}
  </View>
);

const TeamHeader = ({ selectedCount, creditsLeft, usedCredits }) => (
  <GlassCard style={styles.container}>
    <Stat label="Players" value={`${selectedCount}/8`} />
    <View style={styles.divider} />
    <Stat label="Credits Left" value={Number(creditsLeft || 0).toFixed(1)} highlight />
    <View style={styles.divider} />
    <Stat label="Used" value={Number(usedCredits || 0).toFixed(1)} />
  </GlassCard>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
  },
  highlight: {
    color: colors.primary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.borderSoft,
  },
});

export default TeamHeader;
