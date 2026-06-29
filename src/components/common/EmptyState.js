import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import shadows from '../../constants/shadows';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import Button from './Button';

const EmptyState = ({
  icon = 'trophy-outline',
  title = 'Nothing here yet',
  message = 'New matches and contests will appear here when they are available.',
  actionLabel,
  onAction,
  compact = false,
  style,
}) => (
  <View style={[styles.container, compact && styles.compact, style]}>
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={compact ? 24 : 30} color={colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {!!message && <Text style={styles.message}>{message}</Text>}
    {!!actionLabel && !!onAction && (
      <Button title={actionLabel} onPress={onAction} size="sm" style={styles.action} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceGlass,
    ...shadows.sm,
  },
  compact: {
    padding: spacing.xl,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  action: {
    marginTop: spacing.lg,
  },
});

export default EmptyState;
