import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const Button = ({ title, onPress, disabled, loading, icon, variant = 'primary', style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: disabled ? 0.99 : 1,
      useNativeDriver: true,
    }).start();
  }, [disabled, scale]);

  useEffect(() => {
    if (disabled || variant !== 'primary') {
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [disabled, pulse, variant]);

  const gradient =
    variant === 'purple'
      ? [colors.purple, '#4d1cb8']
      : disabled
        ? ['#20262c', '#11161b']
        : [colors.primary, colors.primaryDark];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {!disabled && variant === 'primary' && (
        <Animated.View
          style={[
            styles.pulse,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.65] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }) }],
            },
          ]}
        />
      )}
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
      >
        <LinearGradient colors={gradient} style={styles.button}>
          <View style={styles.innerGlow} />
          {loading ? <ActivityIndicator color={colors.white} /> : icon}
          {!loading && <Text style={[styles.title, disabled && styles.disabledTitle]}>{title}</Text>}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
    overflow: 'hidden',
  },
  pulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(85, 255, 23, 0.08)',
  },
  innerGlow: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: -9,
    height: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  disabledTitle: {
    color: colors.textDim,
  },
});

export default Button;
