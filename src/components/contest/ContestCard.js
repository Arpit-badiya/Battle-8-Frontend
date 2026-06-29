import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from '../common/Badge';
import Button from '../common/Button';
import CoinBadge from '../common/CoinBadge';
import GlassCard from '../common/GlassCard';
import StatusChip from '../common/StatusChip';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import { getJoinProgress } from '../../utils/helpers';

const ContestCard = ({
  contest,
  onJoin,
  onPress,
  cta = 'Build Team',
  showChevron = false,
  loading = false,
  disabled = false,
}) => {
  const [now, setNow] = useState(Date.now());
  const startAtMs = useMemo(() => {
    const value = contest.startTime || contest.startsAt;
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [contest.startTime, contest.startsAt]);

  useEffect(() => {
    if (!startAtMs || contest.status !== 'upcoming') {
      return undefined;
    }

    const interval = setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= startAtMs) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contest.status, startAtMs]);

  const totalSpots = Number(contest.totalSpots || contest.players || 0);
  const joinedSpots = Number(contest.joined || 0);
  const remainingSlots = contest.remainingSlots ?? Math.max(totalSpots - joinedSpots, 0);
  const progress = getJoinProgress(contest.joined, contest.totalSpots || contest.players);

  const effectiveStatus =
    contest.status === 'upcoming' && startAtMs && now >= startAtMs
      ? 'live'
      : contest.status || 'upcoming';

  const isClosed = ['live', 'completed', 'cancelled'].includes(effectiveStatus);
  const isFull = remainingSlots <= 0;
  const isDisabled = disabled || (!contest.userJoined && isFull) || isClosed;
  const buttonTitle = contest.teamCreated
    ? 'View Team'
    : effectiveStatus === 'live'
    ? 'Live'
    : contest.userJoined
    ? cta
    : isClosed
    ? 'Closed'
    : isFull
    ? 'Full'
    : cta;

  const countdown = useMemo(() => {
    if (!startAtMs || effectiveStatus !== 'upcoming') {
      return contest.timeLeft || '00:00:00';
    }

    const totalSeconds = Math.max(Math.floor((startAtMs - now) / 1000), 0);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }, [contest.timeLeft, effectiveStatus, now, startAtMs]);

  const statusTone =
    effectiveStatus === 'completed'
      ? 'completed'
      : effectiveStatus === 'live'
      ? 'live'
      : remainingSlots < 20
      ? 'hot'
      : 'upcoming';

  const firstPrize = Math.round(Number(contest.prizePool || 0) * 0.5 * 100) / 100;

  return (
    <GlassCard style={styles.card}>
      <Pressable onPress={onPress} style={styles.pressable}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text numberOfLines={2} style={styles.title}>
              {contest.title || `${contest.players} Players Contest`}
            </Text>
            <View style={styles.badges}>
              <Badge label={contest.game || contest.gameName || 'Battle-8'} tone="gold" compact />
              {remainingSlots < 20 && <Badge label="HOT" tone="danger" compact />}
              {contest.guaranteed && <Badge label="GUARANTEED" tone="blue" compact />}
            </View>
          </View>
          <StatusChip status={statusTone} compact />
        </View>

        <View style={styles.prizeRow}>
            <View style={styles.prizeBlock}>
              <Text style={styles.prizeLabel}>Prize Pool</Text>
              <CoinBadge amount={contest.prizePool} compact />
            </View>
            <View style={styles.prizeBlock}>
              <Text style={styles.prizeLabel}>1st Prize</Text>
              <Text style={styles.prizeValue}>{firstPrize}</Text>
            </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.spotsText}>
            {joinedSpots}/{totalSpots} spots filled
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.entryWrap}>
            <Text style={styles.entryLabel}>Entry</Text>
            <CoinBadge amount={contest.entryFee} compact />
          </View>

          {!showChevron ? (
            <Button
              title={buttonTitle}
              onPress={onJoin}
              style={styles.joinButton}
              fullWidth={false}
              loading={loading}
              disabled={isDisabled}
            />
          ) : (
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          )}
        </View>
      </Pressable>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  pressable: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  prizeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prizeLabel: {
    color: colors.textMuted,
    ...typography.micro,
  },
  prizeValue: {
    color: colors.primary,
    ...typography.subtitle,
  },
  progressWrap: {
    gap: spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  spotsText: {
    color: colors.textSubtle,
    ...typography.micro,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  entryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryLabel: {
    color: colors.textMuted,
    ...typography.caption,
  },
  joinButton: {
    minWidth: 120,
  },
});

export default ContestCard;
