import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { formatCoins } from '../../utils/helpers';

const CoinBadge = ({ amount = 0, compact = false }) => (
  <View style={[styles.badge, compact && styles.compact]}>
    <View style={[styles.coin, compact && styles.compactCoin]}>
      <Ionicons name="logo-bitcoin" size={compact ? 11 : 15} color={colors.coinDark} />
    </View>
    <Text style={[styles.amount, compact && styles.compactText]}>{formatCoins(amount)}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 18,
    backgroundColor: colors.coinSoft,
  },
  compact: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  coin: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coin,
    borderWidth: 2,
    borderColor: '#ffe071',
  },
  compactCoin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
  },
  amount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  compactText: {
    color: colors.text,
    fontSize: 15,
  },
});

export default CoinBadge;
