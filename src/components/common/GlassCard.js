import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import shadows from '../../constants/shadows';

const GlassCard = ({ children, style, glow = false, bordered = true }) => (
  <LinearGradient
    colors={glow ? ['rgba(38, 30, 12, 0.92)', 'rgba(11, 18, 23, 0.98)'] : ['rgba(17, 27, 32, 0.92)', 'rgba(11, 18, 23, 0.98)']}
    style={[
      styles.card,
      glow && styles.glow,
      !bordered && styles.noBorder,
      style,
    ]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.sm,
    overflow: 'hidden',
  },
  glow: {
    borderColor: colors.border,
    ...shadows.glow,
  },
  noBorder: {
    borderWidth: 0,
  },
});

export default GlassCard;
