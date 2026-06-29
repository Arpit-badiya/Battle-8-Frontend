import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const tones = {
  default: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSoft,
    color: colors.textMuted,
  },
  gold: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderStrong,
    color: colors.primary,
  },
  blue: {
    backgroundColor: colors.accentSoft,
    borderColor: 'rgba(79, 163, 255, 0.34)',
    color: colors.accent,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(50, 213, 131, 0.34)',
    color: colors.success,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(255, 77, 85, 0.34)',
    color: colors.danger,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: 'rgba(255, 176, 32, 0.34)',
    color: colors.warning,
  },
  purple: {
    backgroundColor: colors.purpleSoft,
    borderColor: 'rgba(124, 92, 255, 0.34)',
    color: colors.purple,
  },
};

const Badge = ({ label, icon, tone = 'default', compact = false, style, textStyle }) => {
  const palette = tones[tone] || tones.default;

  return (
    <View style={[styles.badge, palette, compact && styles.compact, style]}>
      {!!icon && <Ionicons name={icon} size={compact ? 11 : 13} color={palette.color} />}
      <Text numberOfLines={1} style={[styles.text, { color: palette.color }, compact && styles.compactText, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minHeight: 26,
    maxWidth: '100%',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  compact: {
    minHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  text: {
    ...typography.micro,
    textTransform: 'uppercase',
  },
  compactText: {
    fontSize: 9,
  },
});

export default Badge;
