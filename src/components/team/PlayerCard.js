import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import GameAvatar from '../common/GameAvatar';

const PlayerCard = ({ player, selected, disabled, onToggle }) => (
  <Pressable
    disabled={disabled}
    onPress={onToggle}
    style={({ pressed }) => [
      styles.card,
      selected && styles.selectedCard,
      disabled && styles.disabledCard,
      pressed && styles.pressedCard,
    ]}
  >
    <GameAvatar name={player.name} size={42} />
    <View style={styles.info}>
      <Text numberOfLines={1} style={styles.name}>
        {player.name}
      </Text>
      <Text numberOfLines={1} style={styles.meta}>
        {player.team || 'Team'}
      </Text>
    </View>
    <Text numberOfLines={1} style={styles.role}>
      {player.role}
    </Text>
    <Text style={styles.credits}>
      {Number(player.credits || 0).toFixed(1)}
    </Text>
    <View style={[styles.addButton, selected && styles.selectedButton]}>
      <Ionicons name={selected ? 'remove' : 'add'} size={22} color={colors.black} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 66,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: 'rgba(6, 12, 15, 0.54)',
  },
  selectedCard: {
    backgroundColor: 'rgba(85, 255, 23, 0.11)',
  },
  disabledCard: {
    opacity: 0.72,
  },
  pressedCard: {
    opacity: 0.86,
  },
  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  role: {
    width: 76,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  credits: {
    width: 48,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
    marginRight: spacing.md,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  selectedButton: {
    backgroundColor: colors.coin,
  },
});

export default memo(PlayerCard);
