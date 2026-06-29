import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import shadows from '../../constants/shadows';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const variants = {
  primary: {
    gradient: [colors.primary, colors.primaryDark],
    borderColor: colors.primary,
    textColor: colors.textInverse,
    glow: colors.primaryGlow,
  },
  secondary: {
    gradient: [colors.surfaceElevated, colors.surfaceMuted],
    borderColor: colors.borderSoft,
    textColor: colors.text,
    glow: 'transparent',
  },
  ghost: {
    gradient: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)'],
    borderColor: colors.borderSoft,
    textColor: colors.text,
    glow: 'transparent',
  },
  outline: {
    gradient: ['transparent', 'transparent'],
    borderColor: colors.primary,
    textColor: colors.primary,
    glow: 'transparent',
  },
  purple: {
    gradient: [colors.purple, colors.purpleDark],
    borderColor: colors.purple,
    textColor: colors.white,
    glow: 'rgba(124,92,255,0.38)',
  },
};

const Button = ({ title, onPress, disabled, loading, icon, variant = 'primary', fullWidth = true, size = 'md', style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const current = variants[variant] || variants.primary;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: disabled ? 0.98 : 1,
      useNativeDriver: true,
    }).start();
  }, [disabled, scale]);

  const gradient = disabled ? [colors.surfaceMuted, colors.surfaceMuted] : current.gradient;
  const isOutline = variant === 'outline';

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
      >
        <LinearGradient
          colors={gradient}
          style={[
            styles.button,
            styles[size],
            isOutline && styles.outlineButton,
            disabled && styles.buttonDisabled,
            { borderColor: current.borderColor },
          ]}
        >
          {loading ? <ActivityIndicator color={current.textColor} /> : icon}
          {!loading && (
            <Text style={[styles.title, { color: current.textColor }, disabled && styles.disabledTitle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  button: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    ...shadows.glow,
    overflow: 'hidden',
  },
  sm: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  md: {
    minHeight: 52,
  },
  lg: {
    minHeight: 58,
  },
  outlineButton: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    ...shadows.none,
  },
  title: {
    ...typography.button,
    color: colors.textInverse,
    textTransform: 'uppercase',
  },
  disabledTitle: {
    color: colors.textDim,
  },
});

export default Button;
