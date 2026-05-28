import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
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

  const playerIds = useMemo(
    () => [...new Set(selectedPlayerIds.map(String))],
    [selectedPlayerIds]
  );
  const hasValidSelection = playerIds.length === MAX_PLAYERS && selectedPlayers.length === MAX_PLAYERS;

  useEffect(() => {
    if (!contestId || !hasValidSelection) {
      Alert.alert('Complete team first', `Select exactly ${MAX_PLAYERS} players before choosing captain and vice-captain.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
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
      <GlassCard style={styles.summary}>
        <Text style={styles.title}>{contest?.title || 'Contest Team'}</Text>
        <Text style={styles.meta}>{selectedTeamName || 'Selected Players'} | {Number(totalCredits || 0).toFixed(1)} credits</Text>
      </GlassCard>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {selectedPlayers.map((player) => {
          const playerId = String(player.id || player._id);
          const isCaptain = captain === playerId;
          const isViceCaptain = viceCaptain === playerId;

          return (
            <GlassCard key={playerId} style={styles.playerRow}>
              <View style={styles.playerMain}>
                <Text numberOfLines={1} style={styles.playerName}>{player.name}</Text>
                <Text numberOfLines={1} style={styles.playerMeta}>{player.team} | {player.role}</Text>
              </View>
              <Pressable
                onPress={() => {
                  setCaptain(playerId);
                  if (viceCaptain === playerId) setViceCaptain('');
                }}
                style={[styles.pickButton, isCaptain && styles.pickButtonActive]}
              >
                <Text style={[styles.pickText, isCaptain && styles.pickTextActive]}>C</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setViceCaptain(playerId);
                  if (captain === playerId) setCaptain('');
                }}
                style={[styles.pickButton, isViceCaptain && styles.pickButtonActive]}
              >
                <Text style={[styles.pickText, isViceCaptain && styles.pickTextActive]}>VC</Text>
              </Pressable>
            </GlassCard>
          );
        })}
        <View style={styles.footerSpace} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirm Team"
          loading={creatingTeam}
          disabled={creatingTeam || !hasValidSelection || !captain || !viceCaptain || captain === viceCaptain}
          onPress={confirmTeam}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  summary: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    padding: spacing.screen,
    gap: spacing.sm,
    paddingBottom: 112,
  },
  playerRow: {
    minHeight: 62,
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
    fontSize: 14,
    fontWeight: '900',
  },
  playerMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  pickButton: {
    width: 42,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  pickButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(85,255,23,0.14)',
  },
  pickText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  pickTextActive: {
    color: colors.primary,
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
