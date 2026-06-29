import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import Loader from './Loader';

const LoadingState = ({ label = 'Loading arena', compact = false, style }) => (
  <View style={[styles.container, compact && styles.compact, style]}>
    <Loader label="" />
    {!!label && <Text style={styles.label}>{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  compact: {
    padding: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default LoadingState;
