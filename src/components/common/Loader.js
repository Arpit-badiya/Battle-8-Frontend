import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import BrandLogo from './BrandLogo';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const Loader = ({ label = 'Loading arena', fullScreen = false }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <Animated.View style={[styles.glow, { opacity, transform: [{ scale }] }]} />
      <Animated.View style={{ transform: [{ scale }] }}>
        <BrandLogo size={80} glow />
      </Animated.View>
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
    position: 'relative',
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
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(232, 181, 58, 0.12)',
  },
});

export default Loader;
