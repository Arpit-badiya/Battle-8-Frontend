import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../common/Button';
import CoinBadge from '../common/CoinBadge';
import GlassCard from '../common/GlassCard';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { getJoinProgress } from '../../utils/helpers';

const ContestCard = ({
  contest,
  onJoin,
  onPress,
  cta = 'Join',
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

  const progress = getJoinProgress(
    contest.joined,
    contest.totalSpots || contest.players
  );

  const totalSpots = Number(contest.totalSpots || contest.players || 0);
  const joinedSpots = Number(contest.joined || 0);

  const remainingSlots =
    contest.remainingSlots ??
    Math.max(
      totalSpots -
        joinedSpots,
      0
    );

  const isFull = remainingSlots <= 0;
  const effectiveStatus =
    contest.status === 'upcoming' && startAtMs && now >= startAtMs
      ? 'live'
      : contest.status || 'upcoming';
  const isClosed = ['live', 'completed', 'cancelled'].includes(effectiveStatus);
  const isDisabled = disabled || contest.teamCreated || isFull || isClosed;
  const buttonTitle = contest.teamCreated
    ? 'Team Created'
    : effectiveStatus === 'live'
    ? 'Live'
    : contest.userJoined
    ? 'Create Team'
    : isClosed
    ? 'Closed'
    : isFull
    ? 'Full'
    : cta;
  const msRemaining = Math.max(startAtMs - now, 0);
  const countdown = useMemo(() => {
    if (!startAtMs || effectiveStatus !== 'upcoming') {
      return contest.timeLeft || '00:00:00';
    }

    const totalSeconds = Math.floor(msRemaining / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }, [contest.timeLeft, effectiveStatus, msRemaining, startAtMs]);
  const statusBadge =
    effectiveStatus === 'completed'
      ? 'Completed'
      : effectiveStatus === 'live'
      ? 'Live'
      : remainingSlots < 20
      ? 'Filling Fast'
      : 'Hot';

  return (
    <GlassCard style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>
          {contest.title ||
            `${contest.players} Players Contest`}
        </Text>

        <Text
          style={[
            styles.badge,
            effectiveStatus === 'live' && styles.liveBadge,
            effectiveStatus === 'completed' && styles.completedBadge,
            effectiveStatus === 'upcoming' && remainingSlots < 20 && styles.fastBadge,
          ]}
        >
          {statusBadge}
        </Text>

        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.textDim}
            onPress={onPress}
          />
        )}
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.label}>
            Entry
          </Text>

          <CoinBadge
            amount={contest.entryFee}
            compact
          />
        </View>

        <View style={[styles.metricBlock, styles.spotsBlock]}>
          <Text style={styles.label}>
            Spots
          </Text>

          <Text style={styles.metric}>
            <Text style={styles.gold}>
              {joinedSpots}
            </Text>

            {' / '}

            {totalSpots}
          </Text>

          <Text style={styles.slots}>
            {joinedSpots} / {totalSpots} Spots
          </Text>
        </View>

        <View style={styles.metricBlock}>
          <Text style={styles.label}>
            Prize Pool
          </Text>

          <CoinBadge
            amount={contest.prizePool}
            compact
          />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${
                progress * 100
              }%`,
            },
          ]}
        />
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.time}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.text}
          />

          <Text style={styles.timeText}>
            {effectiveStatus === 'live'
              ? 'Match Live'
              : effectiveStatus === 'completed'
              ? 'Completed'
              : `${countdown} Left`}
          </Text>
        </View>

        {!showChevron && (
          <Button
          title={
              buttonTitle
            }
            onPress={onJoin}
            style={styles.joinButton}
            loading={loading}
            disabled={isDisabled}
          />
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },

  badge: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor:
      colors.danger,
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal:
      spacing.sm,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },

  fastBadge: {
    backgroundColor: '#0752b8',
  },

  liveBadge: {
    backgroundColor: colors.primaryDark,
  },

  completedBadge: {
    backgroundColor: colors.textMuted,
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },

  metricBlock: {
    flex: 1,
    minWidth: 0,
  },

  spotsBlock: {
    alignItems: 'center',
  },

  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  metric: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },

  gold: {
    color: colors.coin,
  },

  slots: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
    textAlign: 'center',
  },

  progressTrack: {
    height: 2,
    borderRadius: 2,
    backgroundColor:
      'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: spacing.lg,
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor:
      colors.primary,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginTop: spacing.lg,
  },

  time: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  timeText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
  },

  joinButton: {
    width: 118,
  },
});

export default ContestCard;
