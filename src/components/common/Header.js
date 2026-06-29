import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BrandLogo from './BrandLogo';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const Header = ({ title, onBack, right, centered = true, branded = false }) => (
  <View style={styles.header}>
    <View style={styles.side}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
      )}
      {!onBack && branded && <BrandLogo size={32} />}
    </View>
    <Text style={[styles.title, !centered && styles.leftTitle]}>{title}</Text>
    <View style={[styles.side, styles.right]}>{right}</View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
  },
  side: {
    width: 48,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.text,
    ...typography.title,
    textAlign: 'center',
  },
  leftTitle: {
    textAlign: 'left',
  },
});

export default Header;
