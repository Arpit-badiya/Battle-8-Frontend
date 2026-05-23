import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import CoinBadge from '../common/CoinBadge';

const PrizeCard = ({ label, value, icon = 'trophy' }) => (
  <LinearGradient colors={['#101c2b', '#0a1320']} style={styles.card}>
    <View style={styles.icon}>
      <Ionicons name={icon} size={22} color={colors.primary} />
    </View>
    <Text style={styles.label}>{label}</Text>
    {typeof value === 'number' ? <CoinBadge amount={value} compact /> : <Text style={styles.value}>{value}</Text>}
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 116,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
});

export default PrizeCard;
