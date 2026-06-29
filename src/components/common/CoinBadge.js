import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import { formatCoins } from '../../utils/helpers';

const CoinBadge = ({ amount = 0, compact = false }) => (
  <View style={[styles.badge, compact && styles.compact]}>
    <Ionicons name="wallet" size={compact ? 13 : 15} color={colors.primary} />
    <Text style={[styles.amount, compact && styles.compactText]}>{formatCoins(amount)}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  compact: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  amount: {
    color: colors.text,
    ...typography.subtitle,
  },
  compactText: {
    color: colors.text,
    fontSize: 15,
  },
});

export default CoinBadge;
