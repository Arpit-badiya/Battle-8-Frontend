import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import { getMyTeam } from '../../services/contestService';
import { showError } from '../../utils/feedback';

const REQUIRED_TEAMS = 8;
const CAPTAIN_MULTIPLIER = '2x';
const VICE_CAPTAIN_MULTIPLIER = '1.5x';

const STEP_SELECT = 'select';
const STEP_CAPTAIN = 'captain';
const STEP_CONFIRM = 'confirm';

const TeamContestBuilderScreen = ({ navigation, route }) => {
  const routeContest = route.params?.contest;
  const { contests, creatingTeam, createTeamContestEntry, setActiveContestId } = useAppData();

  const contest =
    contests.find((item) => (item.id || item._id) === (routeContest?.id || routeContest?._id)) ||
    routeContest;
  const contestId = contest?.id || contest?._id;

  const contestTeams = useMemo(
    () => (contest?.contestTeams || []).map((t) => String(t).trim()).filter(Boolean),
    [contest?.contestTeams]
  );

  const [step, setStep] = useState(STEP_SELECT);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [captainTeam, setCaptainTeam] = useState('');
  const [viceCaptainTeam, setViceCaptainTeam] = useState('');
  const [myEntry, setMyEntry] = useState(null);
  const [loadingEntry, setLoadingEntry] = useState(false);

  const isContestLocked = ['live', 'completed', 'cancelled'].includes(contest?.status);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!contestId || !contest?.teamCreated) return;

        try {
          setLoadingEntry(true);
          const team = await getMyTeam(contestId).catch(() => null);
          if (active) setMyEntry(team);
        } catch {
          // silently ignore
        } finally {
          if (active) setLoadingEntry(false);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [contest?.teamCreated, contestId])
  );

  const toggleTeam = useCallback((teamName) => {
    if (creatingTeam || isContestLocked) return;

    setSelectedTeams((current) => {
      if (current.includes(teamName)) {
        if (captainTeam === teamName) setCaptainTeam('');
        if (viceCaptainTeam === teamName) setViceCaptainTeam('');
        return current.filter((t) => t !== teamName);
      }

      if (current.length >= REQUIRED_TEAMS) {
        Alert.alert(
          `${REQUIRED_TEAMS} teams max`,
          `You can only select ${REQUIRED_TEAMS} teams. Deselect one to pick another.`
        );
        return current;
      }

      return [...current, teamName];
    });
  }, [captainTeam, creatingTeam, isContestLocked, viceCaptainTeam]);

  const goToCaptain = useCallback(() => {
    if (selectedTeams.length !== REQUIRED_TEAMS) {
      Alert.alert(
        `Select ${REQUIRED_TEAMS} teams`,
        `You have selected ${selectedTeams.length} of ${REQUIRED_TEAMS} required teams.`
      );
      return;
    }
    setStep(STEP_CAPTAIN);
  }, [selectedTeams.length]);

  const goToConfirm = useCallback(() => {
    if (!captainTeam || !viceCaptainTeam) {
      Alert.alert('Captain required', 'Select both a captain team and a vice-captain team.');
      return;
    }

    if (captainTeam === viceCaptainTeam) {
      Alert.alert('Different teams required', 'Captain team and vice-captain team must be different.');
      return;
    }

    setStep(STEP_CONFIRM);
  }, [captainTeam, viceCaptainTeam]);

  const confirmEntry = useCallback(async () => {
    if (!contestId) {
      Alert.alert('Contest missing', 'Go back and select a contest again.');
      return;
    }

    if (selectedTeams.length !== REQUIRED_TEAMS) {
      Alert.alert(`Select ${REQUIRED_TEAMS} teams`, 'Complete your team selection before confirming.');
      return;
    }

    if (!captainTeam || !viceCaptainTeam || captainTeam === viceCaptainTeam) {
      Alert.alert('Invalid captain selection', 'Select different captain and vice-captain teams.');
      return;
    }

    try {
      const response = await createTeamContestEntry({
        contestId,
        selectedTeams,
        captainTeam,
        viceCaptainTeam,
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
      showError('Entry creation failed', error);
    }
  }, [captainTeam, contest?.entryFee, contestId, createTeamContestEntry, navigation, selectedTeams, setActiveContestId, viceCaptainTeam]);

  const handleBack = useCallback(() => {
    if (step === STEP_CAPTAIN) {
      setStep(STEP_SELECT);
      return;
    }

    if (step === STEP_CONFIRM) {
      setStep(STEP_CAPTAIN);
      return;
    }

    navigation.goBack();
  }, [navigation, step]);

  const stepTitle =
    step === STEP_SELECT
      ? `Select Teams (${selectedTeams.length}/${REQUIRED_TEAMS})`
      : step === STEP_CAPTAIN
      ? 'Captain & Vice-Captain'
      : 'Confirm Entry';

  if (myEntry && !loadingEntry) {
    return (
      <Screen>
        <Header title="My Entry" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.summaryCard} glow>
            <Text style={styles.summaryTitle}>{contest?.title || 'Team Contest'}</Text>
            <Text style={styles.summaryMeta}>
              Rank #{myEntry.rank || '-'} | {myEntry.points || 0} pts
            </Text>
          </GlassCard>

          <GlassCard style={styles.panel}>
            <Text style={styles.panelTitle}>Selected Teams</Text>
            {(myEntry.selectedTeams || []).map((teamName) => {
              const isCaptain = teamName === myEntry.captainTeam;
              const isViceCaptain = teamName === myEntry.viceCaptainTeam;
              return (
                <View key={teamName} style={styles.teamRow}>
                  <Text style={styles.teamRowName}>{teamName}</Text>
                  {isCaptain && (
                    <View style={[styles.badge, styles.captainBadge]}>
                      <Text style={styles.badgeText}>C {CAPTAIN_MULTIPLIER}</Text>
                    </View>
                  )}
                  {isViceCaptain && (
                    <View style={[styles.badge, styles.vcBadge]}>
                      <Text style={styles.badgeText}>VC {VICE_CAPTAIN_MULTIPLIER}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </GlassCard>
        </ScrollView>
      </Screen>
    );
  }

  if (step === STEP_SELECT) {
    return (
      <Screen>
        <Header title={stepTitle} onBack={handleBack} />
        <GlassCard style={styles.summaryCard} glow>
          <Text style={styles.summaryTitle}>{contest?.title || 'Team Contest'}</Text>
          <Text style={styles.summaryMeta}>
            Select exactly {REQUIRED_TEAMS} teams from the {contestTeams.length} participating teams
          </Text>
        </GlassCard>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {contestTeams.length === 0 ? (
            <Text style={styles.emptyText}>No teams configured for this contest yet.</Text>
          ) : (
            contestTeams.map((teamName) => {
              const selected = selectedTeams.includes(teamName);
              return (
                <Pressable
                  key={teamName}
                  onPress={() => toggleTeam(teamName)}
                  style={[styles.teamCard, selected && styles.teamCardActive]}
                  disabled={creatingTeam || isContestLocked}
                >
                  <Text style={[styles.teamCardName, selected && styles.teamCardNameActive]}>
                    {teamName}
                  </Text>
                  {selected && (
                    <View style={styles.checkMark}>
                      <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
          <View style={styles.footerSpace} />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={
              selectedTeams.length === REQUIRED_TEAMS
                ? 'Next: Pick Captain'
                : `Select Teams (${selectedTeams.length}/${REQUIRED_TEAMS})`
            }
            disabled={selectedTeams.length !== REQUIRED_TEAMS || creatingTeam || isContestLocked}
            onPress={goToCaptain}
          />
        </View>
      </Screen>
    );
  }

  if (step === STEP_CAPTAIN) {
    return (
      <Screen>
        <Header title={stepTitle} onBack={handleBack} />
        <GlassCard style={styles.summaryCard} glow>
          <Text style={styles.summaryTitle}>Pick Captain & Vice-Captain</Text>
          <Text style={styles.summaryMeta}>
            Captain team gets {CAPTAIN_MULTIPLIER} | Vice-captain gets {VICE_CAPTAIN_MULTIPLIER} on aggregate score
          </Text>
        </GlassCard>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTeams.map((teamName) => {
            const isCaptain = captainTeam === teamName;
            const isViceCaptain = viceCaptainTeam === teamName;

            return (
              <GlassCard key={teamName} style={styles.captainRow}>
                <Text style={styles.captainTeamName}>{teamName}</Text>
                <View style={styles.picks}>
                  <Pressable
                    onPress={() => {
                      setCaptainTeam(teamName);
                      if (viceCaptainTeam === teamName) setViceCaptainTeam('');
                    }}
                    style={[styles.pickButton, isCaptain && styles.pickButtonActiveCaptain]}
                  >
                    <Text style={[styles.pickText, isCaptain && styles.pickTextActive]}>
                      C {CAPTAIN_MULTIPLIER}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setViceCaptainTeam(teamName);
                      if (captainTeam === teamName) setCaptainTeam('');
                    }}
                    style={[styles.pickButton, isViceCaptain && styles.pickButtonActiveVc]}
                  >
                    <Text style={[styles.pickText, isViceCaptain && styles.pickTextActive]}>
                      VC {VICE_CAPTAIN_MULTIPLIER}
                    </Text>
                  </Pressable>
                </View>
              </GlassCard>
            );
          })}
          <View style={styles.footerSpace} />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Next: Confirm"
            disabled={!captainTeam || !viceCaptainTeam || captainTeam === viceCaptainTeam}
            onPress={goToConfirm}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={stepTitle} onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.summaryCard} glow>
          <Text style={styles.summaryTitle}>{contest?.title || 'Team Contest'}</Text>
          <Text style={styles.summaryMeta}>
            Entry Fee: {contest?.entryFee || 0} coins · {REQUIRED_TEAMS} teams selected
          </Text>
        </GlassCard>

        <GlassCard style={styles.panel}>
          <Text style={styles.panelTitle}>Your {REQUIRED_TEAMS} Teams</Text>
          {selectedTeams.map((teamName) => {
            const isCaptain = teamName === captainTeam;
            const isViceCaptain = teamName === viceCaptainTeam;
            return (
              <View key={teamName} style={styles.teamRow}>
                <Text style={styles.teamRowName}>{teamName}</Text>
                {isCaptain && (
                  <View style={[styles.badge, styles.captainBadge]}>
                    <Text style={styles.badgeText}>C {CAPTAIN_MULTIPLIER}</Text>
                  </View>
                )}
                {isViceCaptain && (
                  <View style={[styles.badge, styles.vcBadge]}>
                    <Text style={styles.badgeText}>VC {VICE_CAPTAIN_MULTIPLIER}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </GlassCard>

        <GlassCard style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Scoring Rules</Text>
          <Text style={styles.rulesText}>
            - Each team earns points based on their players' kills and placement
          </Text>
          <Text style={styles.rulesText}>
            - Captain team score is multiplied by {CAPTAIN_MULTIPLIER}
          </Text>
          <Text style={styles.rulesText}>
            - Vice-captain team score is multiplied by {VICE_CAPTAIN_MULTIPLIER}
          </Text>
          <Text style={styles.rulesText}>
            - All other selected teams count at 1x
          </Text>
        </GlassCard>

        <View style={styles.footerSpace} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirm & Join"
          loading={creatingTeam}
          disabled={creatingTeam}
          onPress={confirmEntry}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    gap: spacing.sm,
    paddingBottom: 112,
  },
  summaryCard: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  summaryTitle: {
    color: colors.text,
    ...typography.title,
  },
  summaryMeta: {
    color: colors.textMuted,
    ...typography.caption,
  },
  panel: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  panelTitle: {
    color: colors.text,
    ...typography.subtitle,
    marginBottom: spacing.xs,
  },
  teamCard: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  teamCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  teamCardName: {
    flex: 1,
    color: colors.textMuted,
    ...typography.bodySmall,
  },
  teamCardNameActive: {
    color: colors.primary,
  },
  checkMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  captainTeamName: {
    flex: 1,
    color: colors.text,
    ...typography.bodySmall,
  },
  picks: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickButton: {
    minWidth: 58,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
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
    ...typography.micro,
  },
  pickTextActive: {
    color: colors.textInverse,
  },
  teamRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    gap: spacing.sm,
  },
  teamRowName: {
    flex: 1,
    color: colors.text,
    ...typography.bodySmall,
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captainBadge: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.coin,
  },
  vcBadge: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  badgeText: {
    color: colors.text,
    ...typography.micro,
  },
  rulesCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rulesTitle: {
    color: colors.text,
    ...typography.subtitle,
    marginBottom: spacing.xs,
  },
  rulesText: {
    color: colors.textMuted,
    ...typography.caption,
    lineHeight: 18,
  },
  emptyText: {
    color: colors.textMuted,
    ...typography.bodySmall,
    textAlign: 'center',
    paddingVertical: spacing.xl,
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

export default TeamContestBuilderScreen;
