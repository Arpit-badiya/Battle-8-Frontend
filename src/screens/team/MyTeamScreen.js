import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { getMyTeam } from '../../services/contestService';
import { showError } from '../../utils/feedback';

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
              <Text style={styles.stat}>Rank #{team?.rank || '-'}</Text>
              <Text style={styles.stat}>{team?.points || 0} pts</Text>
              <Text style={styles.stat}>{team?.winnings || 0} won</Text>
            </View>
          </GlassCard>
          <GlassCard style={styles.players}>
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
  summary: { padding: spacing.lg, gap: spacing.md },
  teamName: { color: colors.text, fontSize: 20, fontWeight: '900' },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, color: colors.primary, fontSize: 13, fontWeight: '900' },
  players: { paddingVertical: spacing.sm },
  playerRow: { minHeight: 58, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  playerMain: { flex: 1 },
  playerName: { color: colors.text, fontSize: 14, fontWeight: '900' },
  playerMeta: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginTop: 3 },
  points: { color: colors.coin, fontSize: 16, fontWeight: '900' },
});

export default MyTeamScreen;
