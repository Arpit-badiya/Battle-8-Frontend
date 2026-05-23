import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';
import colors from '../../constants/colors';

const GameAvatar = ({ name = 'A', size = 44 }) => (
  <LinearGradient
    colors={['#ffbf18', '#ff3d31', '#6b22ff']}
    style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
  >
    <LinearGradient colors={['#172129', '#05090c']} style={[styles.inner, { borderRadius: size / 2 - 3 }]}>
      <Ionicons name="person" size={size * 0.46} color={colors.coin} />
      <Text style={[styles.initial, { fontSize: size * 0.18 }]}>{name[0]?.toUpperCase()}</Text>
    </LinearGradient>
  </LinearGradient>
);

const styles = StyleSheet.create({
  ring: {
    padding: 2,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    position: 'absolute',
    bottom: 5,
    color: colors.text,
    fontWeight: '900',
  },
});

export default GameAvatar;
