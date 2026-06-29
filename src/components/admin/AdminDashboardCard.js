import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GlassCard from '../common/GlassCard';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const AdminDashboardCard = ({ title, subtitle, icon, tone = colors.primary, onPress }) => (
  <Pressable onPress={onPress} style={styles.pressable}>
    <GlassCard style={styles.card}>
      <View style={[styles.iconWrap, { borderColor: tone, backgroundColor: `${tone}22` }]}>
        <Ionicons name={icon} size={22} color={tone} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </GlassCard>
  </Pressable>
);

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    minHeight: 84,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    ...typography.subtitle,
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.caption,
    marginTop: spacing.xs,
  },
});

export default AdminDashboardCard;
