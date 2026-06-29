import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import { getMyTeam } from '../../services/contestService';
import { showError } from '../../utils/feedback';

const Stat = ({ label, value, highlight }) => (
  <View style={styles.stat}>
    <Text style={[styles.statValue, highlight && styles.statHighlight]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MyTeamScreen = ({ navigation, route }) => {
  const contestId = route.params?.contestId || route.params?.contest?.id || route.params?.contest?._id;
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyTeam(contestId);
        if (active) setTeam(data);
      } catch (error) {
        if (active) showError('My Team load failed', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [contestId]));

  return (
    <Screen>
      <Header title="My Team" onBack={() => navigation.goBack()} />
      {loading && !team ? <Loader /> : (
        <ScrollView contentContainerStyle={styles.content}>
          <GlassCard style={styles.summary} glow>
            <Text style={styles.teamName}>{team?.selectedTeamName || 'Submitted Team'}</Text>
            <View style={styles.stats}>
              <Stat label="Rank" value={`#${team?.rank || '-'}`} />
              <Stat label="Points" value={team?.points || 0} highlight />
              <Stat label="Winnings" value={team?.winnings || 0} />
            </View>
          </GlassCard>
          <GlassCard style={styles.players}>
            <View style={styles.playersHead}>
              <Text style={styles.playersTitle}>Players</Text>
              <Text style={styles.playersTitle}>Points</Text>
            </View>
            {(team?.players || []).map((player) => (
              <View key={player._id || player.id} style={styles.playerRow}>
                <View style={styles.playerMain}>
                  <Text style={styles.playerName}>{player.name} {player.isCaptain ? '(C)' : player.isViceCaptain ? '(VC)' : ''}</Text>
                  <Text style={styles.playerMeta}>{player.active ? 'Active' : 'Inactive'} · {player.kills || 0} kills · #{player.placement || '-'}</Text>
                </View>
                <Text style={styles.points}>{player.points || 0}</Text>
              </View>
            ))}
          </GlassCard>
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.screen, paddingBottom: 110, gap: spacing.md },
  summary: { padding: spacing.lg, gap: spacing.md, alignItems: 'center' },
  teamName: { color: colors.text, ...typography.h2, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, ...typography.h3 },
  statHighlight: { color: colors.primary },
  statLabel: { color: colors.textMuted, ...typography.micro, marginTop: 2 },
  players: { paddingVertical: spacing.sm },
  playersHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  playersTitle: { color: colors.textMuted, ...typography.caption },
  playerRow: { minHeight: 58, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  playerMain: { flex: 1 },
  playerName: { color: colors.text, ...typography.bodySmall },
  playerMeta: { color: colors.textMuted, ...typography.micro, marginTop: 3 },
  points: { color: colors.coin, ...typography.subtitle },
});

export default MyTeamScreen;
