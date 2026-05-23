import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const Loader = ({ label = 'Loading arena', fullScreen = false }) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator color={colors.primary} size="large" />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Loader;
