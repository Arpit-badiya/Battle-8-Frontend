import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';

const teamColors = {
  default: ['#E8B53A', '#B98416'],
  blue: ['#4FA3FF', '#1F5EA8'],
  red: ['#FF4D55', '#A82A2F'],
  purple: ['#7C5CFF', '#3D2A92'],
  green: ['#32D583', '#1A8C55'],
};

const getTeamColor = (name) => {
  if (!name) return teamColors.default;
  const key = String(name).toLowerCase();
  if (key.includes('sen') || key.includes('cloud') || key.includes('c9')) return teamColors.blue;
  if (key.includes('faze') || key.includes('t1') || key.includes('red')) return teamColors.red;
  if (key.includes('liquid') || key.includes('purple')) return teamColors.purple;
  if (key.includes('optic') || key.includes('green')) return teamColors.green;
  return teamColors.default;
};

const GameAvatar = ({ name = 'A', size = 44 }) => {
  const gradient = getTeamColor(name);
  return (
    <LinearGradient
      colors={gradient}
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <View style={[styles.inner, { borderRadius: size / 2 - 3, width: size - 6, height: size - 6 }]}>
        <Ionicons name="person" size={size * 0.42} color={colors.text} />
      </View>
      <Text style={[styles.initial, { fontSize: size * 0.16 }]}>{name[0]?.toUpperCase()}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundRaised,
  },
  initial: {
    position: 'absolute',
    bottom: 4,
    color: colors.text,
    fontWeight: '900',
  },
});

export default GameAvatar;
