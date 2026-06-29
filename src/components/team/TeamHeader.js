import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import GlassCard from '../common/GlassCard';

const Stat = ({ label, value, highlight }) => (
  <View style={styles.stat}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, highlight && styles.highlight]}>{value}</Text>
  </View>
);

const TeamHeader = ({ selectedCount, creditsLeft, usedCredits, maxPlayers = 8 }) => (
  <GlassCard style={styles.container} glow>
    <Stat label="Players" value={`${selectedCount}/${maxPlayers}`} />
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
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    ...typography.caption,
  },
  value: {
    color: colors.text,
    fontSize: 24,
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
