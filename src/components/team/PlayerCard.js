import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
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
    <GameAvatar name={player.name} size={44} />
    <View style={styles.info}>
      <Text numberOfLines={1} style={styles.name}>
        {player.name}
      </Text>
      <Text numberOfLines={1} style={styles.meta}>
        {player.team || 'Team'}
      </Text>
    </View>
    <View style={styles.tags}>
      <Text numberOfLines={1} style={styles.role}>
        {player.role}
      </Text>
      <Text style={styles.credits}>
        {Number(player.credits || 0).toFixed(1)} cr
      </Text>
    </View>
    <View style={[styles.addButton, selected && styles.selectedButton]}>
      <Ionicons name={selected ? 'checkmark' : 'add'} size={20} color={selected ? colors.textInverse : colors.black} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: 'rgba(6, 12, 15, 0.4)',
  },
  selectedCard: {
    backgroundColor: 'rgba(232, 181, 58, 0.10)',
    borderBottomColor: colors.border,
  },
  disabledCard: {
    opacity: 0.6,
  },
  pressedCard: {
    opacity: 0.85,
  },
  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing.md,
  },
  name: {
    color: colors.text,
    ...typography.subtitle,
  },
  meta: {
    color: colors.textMuted,
    ...typography.micro,
    marginTop: 2,
  },
  tags: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
    gap: 2,
  },
  role: {
    color: colors.accent,
    ...typography.micro,
  },
  credits: {
    color: colors.primary,
    ...typography.caption,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  selectedButton: {
    backgroundColor: colors.success,
  },
});

export default memo(PlayerCard);
