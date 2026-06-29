import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';

const Particle = ({ style, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0.1)).current;
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.5, duration: 2200, delay, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.1, duration: 2200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(translate, { toValue: -8, duration: 2800, delay, useNativeDriver: true }),
          Animated.timing(translate, { toValue: 0, duration: 2800, useNativeDriver: true }),
        ]),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [delay, opacity, translate]);

  return <Animated.View style={[styles.particle, style, { opacity, transform: [{ translateY: translate }] }]} />;
};

const Screen = ({ children, contentStyle }) => (
  <LinearGradient colors={['#020405', '#061015', '#020405']} style={styles.root}>
    <View style={styles.glowTop} />
    <View style={styles.glowBottom} />
    <Particle style={styles.p1} />
    <Particle style={styles.p2} delay={500} />
    <Particle style={styles.p3} delay={900} />
    <SafeAreaView style={[styles.safe, contentStyle]}>{children}</SafeAreaView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(232, 181, 58, 0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 191, 24, 0.06)',
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  p1: {
    top: '18%',
    left: '12%',
  },
  p2: {
    top: '42%',
    right: '14%',
    backgroundColor: colors.coin,
  },
  p3: {
    bottom: '24%',
    left: '58%',
  },
});

export default Screen;
