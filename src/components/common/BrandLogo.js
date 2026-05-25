import { Image, StyleSheet, View } from 'react-native';
import colors from '../../constants/colors';

const logo = require('../../../assets/icon.png');

const BrandLogo = ({ size = 68, glow = false, style }) => (
  <View
    style={[
      styles.wrap,
      {
        width: size,
        height: size,
        borderRadius: Math.max(12, size * 0.22),
      },
      glow && styles.glow,
      style,
    ]}
  >
    <Image source={logo} resizeMode="cover" style={styles.image} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(177,255,0,0.35)',
    backgroundColor: colors.background,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default BrandLogo;
