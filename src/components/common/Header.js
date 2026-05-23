import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const Header = ({ title, onBack, right, centered = true }) => (
  <View style={styles.header}>
    <View style={styles.side}>
      {onBack && (
        <Pressable onPress={onBack} hitSlop={12} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
      )}
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
    width: 56,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  leftTitle: {
    textAlign: 'left',
  },
});

export default Header;
