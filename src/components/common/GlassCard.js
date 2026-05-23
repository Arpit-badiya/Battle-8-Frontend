import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const GlassCard = ({ children, style, glow = false }) => (
  <LinearGradient
    colors={glow ? ['rgba(20, 48, 18, 0.88)', 'rgba(7, 14, 17, 0.95)'] : ['rgba(16, 25, 30, 0.88)', 'rgba(5, 10, 13, 0.95)']}
    style={[styles.card, glow && styles.glow, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowColor: colors.black,
    shadowOpacity: 0.42,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    overflow: 'hidden',
  },
  glow: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.26,
  },
});

export default GlassCard;
