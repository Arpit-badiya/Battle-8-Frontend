import { StyleSheet, Text } from 'react-native';
import GlassCard from '../common/GlassCard';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const AdminSection = ({ title, children, glow = false, style }) => (
  <GlassCard glow={glow} style={[styles.section, style]}>
    {!!title && <Text style={styles.title}>{title}</Text>}
    {children}
  </GlassCard>
);

const styles = StyleSheet.create({
  section: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.subtitle,
  },
});

export default AdminSection;
