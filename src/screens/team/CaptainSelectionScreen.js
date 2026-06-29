import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import StatusChip from '../../components/common/StatusChip';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import { showError } from '../../utils/feedback';

const MAX_PLAYERS = 8;

const CaptainSelectionScreen = ({ navigation, route }) => {
  const {
    contest,
    contestId,
    selectedPlayerIds = [],
    selectedPlayers = [],
    selectedTeamName = '',
    totalCredits = 0,
  } = route.params || {};

  const { createTeam, creatingTeam, setActiveContestId } = useAppData();
  const [captain, setCaptain] = useState('');
  const [viceCaptain, setViceCaptain] = useState('');

  const validatedRef = useRef(false);
  const playerIds = useMemo(() => [...new Set(selectedPlayerIds.map(String))], [selectedPlayerIds]);
  const hasValidSelection =
    playerIds.length === MAX_PLAYERS && selectedPlayers.length === MAX_PLAYERS;

  useEffect(() => {
    if (validatedRef.current) return;
    validatedRef.current = true;

    if (!contestId || !hasValidSelection) {
      Alert.alert(
        'Complete team first',
        `Select exactly ${MAX_PLAYERS} players before choosing captain and vice-captain.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [contestId, hasValidSelection, navigation]);

  const confirmTeam = async () => {
    if (!contestId || !hasValidSelection) {
      Alert.alert('Complete team first', `Select exactly ${MAX_PLAYERS} players before confirming.`);
      return;
    }
    if (!captain || !viceCaptain) {
      Alert.alert('Captain required', 'Select both captain and vice-captain.');
      return;
    }
    if (captain === viceCaptain) {
      Alert.alert('Choose different players', 'Captain and vice-captain must be different players.');
      return;
    }

    try {
      const response = await createTeam({
        contestId,
        players: playerIds,
        totalCredits,
        captain,
        viceCaptain,
      });

      if (!response) return;

      setActiveContestId(contestId);
      navigation.navigate('MainTabs', { screen: 'Leaderboard', params: { contestId } });
    } catch (error) {
      if (String(error?.message || '').toLowerCase().includes('insufficient')) {
        navigation.navigate('EarnCoins', {
          neededCoins: Number(error?.neededCoins || contest?.entryFee || 0),
        });
        return;
      }
      showError('Team creation failed', error);
    }
  };

  return (
    <Screen>
      <Header title="Captain & Vice-Captain" onBack={() => navigation.goBack()} />

      <GlassCard style={styles.infoCard} glow>
        <View style={styles.infoRow}>
          <View style={[styles.multiplierBadge, styles.captainBadge]}>
            <Text style={styles.multiplierText}>C</Text>
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>Captain gets 2x points</Text>
            <Text style={styles.infoSub}>Pick your most reliable performer</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.multiplierBadge, styles.vcBadge]}>
            <Text style={styles.multiplierText}>VC</Text>
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>Vice-Captain gets 1.5x points</Text>
            <Text style={styles.infoSub}>Your second best choice</Text>
          </View>
        </View>
        <StatusChip status={contest?.status || 'upcoming'} style={styles.statusChip} />
      </GlassCard>

      <View style={styles.tipBanner}>
        <Ionicons name="bulb-outline" size={18} color={colors.primary} />
        <Text style={styles.tipText}>Captain and Vice-Captain must be different players.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {selectedPlayers.map((player) => {
          const playerId = String(player.id || player._id);
          const isCaptain = captain === playerId;
          const isViceCaptain = viceCaptain === playerId;

          return (
            <GlassCard key={playerId} style={styles.playerRow}>
              <View style={styles.playerMain}>
                <Text numberOfLines={1} style={styles.playerName}>
                  {player.name}
                </Text>
                <Text numberOfLines={1} style={styles.playerMeta}>
                  {player.team || selectedTeamName} · {player.role}
                </Text>
              </View>

              <View style={styles.picks}>
                <Pressable
                  onPress={() => {
                    setCaptain(playerId);
                    if (viceCaptain === playerId) setViceCaptain('');
                  }}
                  style={[styles.pickButton, isCaptain && styles.pickButtonActiveCaptain]}
                >
                  <Text style={[styles.pickText, isCaptain && styles.pickTextActive]}>C</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setViceCaptain(playerId);
                    if (captain === playerId) setCaptain('');
                  }}
                  style={[styles.pickButton, isViceCaptain && styles.pickButtonActiveVc]}
                >
                  <Text style={[styles.pickText, isViceCaptain && styles.pickTextActive]}>VC</Text>
                </Pressable>
              </View>
            </GlassCard>
          );
        })}
        <View style={styles.footerSpace} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Preview Team"
          loading={creatingTeam}
          disabled={
            creatingTeam ||
            !hasValidSelection ||
            !captain ||
            !viceCaptain ||
            captain === viceCaptain
          }
          onPress={confirmTeam}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  multiplierBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  captainBadge: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  vcBadge: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  multiplierText: {
    ...typography.subtitle,
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    color: colors.text,
    ...typography.bodySmall,
  },
  infoSub: {
    color: colors.textMuted,
    ...typography.micro,
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipText: {
    color: colors.text,
    ...typography.caption,
  },
  content: {
    padding: spacing.screen,
    paddingBottom: 112,
    gap: spacing.sm,
  },
  playerRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  playerMain: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    color: colors.text,
    ...typography.subtitle,
  },
  playerMeta: {
    color: colors.textMuted,
    ...typography.micro,
    marginTop: 2,
  },
  picks: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pickButtonActiveCaptain: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pickButtonActiveVc: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  pickText: {
    color: colors.textMuted,
    ...typography.caption,
  },
  pickTextActive: {
    color: colors.textInverse,
  },
  footerSpace: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    bottom: spacing.xxl,
  },
});

export default CaptainSelectionScreen;
