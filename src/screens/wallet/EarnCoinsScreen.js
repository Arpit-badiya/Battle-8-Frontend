import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import CoinBadge from '../../components/common/CoinBadge';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import { getAdSummary, recordAdReward } from '../../services/adRewardService';
import { showRewardedAd } from '../../services/adMobService';
import { showError, showSuccess } from '../../utils/feedback';

const ProgressBar = ({ value }) => (
  <View style={styles.track}>
    <Animated.View style={[styles.fill, { width: `${Math.max(0, Math.min(value, 1)) * 100}%` }]} />
  </View>
);

const EarnCoinsScreen = ({ navigation, route }) => {
  const neededCoins = Number(route.params?.neededCoins || 0);
  const { refreshWallet } = useAppData();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(false);
  const [lastReward, setLastReward] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await getAdSummary());
    } catch (error) {
      showError('Reward status failed', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const standardProgress = useMemo(() => {
    if (!summary?.standardReward) return 0;
    return summary.standardReward.progress / summary.standardReward.target;
  }, [summary]);
  const milestoneProgress = useMemo(() => {
    if (!summary?.milestoneReward) return 0;
    return summary.milestoneReward.progress / summary.milestoneReward.target;
  }, [summary]);

  const watchAd = async () => {
    if (summary?.premiumActive) {
      Alert.alert('Premium active', 'Premium players get an ad-free experience.');
      return;
    }

    setWatching(true);
    setLastReward(null);
    try {
      const adResult = await showRewardedAd({ placement: 'earn_coins' });
      const response = await recordAdReward(adResult);
      setSummary(response.summary);
      setLastReward(response.reward?.totalRewardAmount || 0);
      await refreshWallet({ silent: true });
      showSuccess(response.reward?.totalRewardAmount ? 'Coins added' : 'Ad counted');
    } catch (error) {
      showError('Ad reward failed', error);
    } finally {
      setWatching(false);
    }
  };

  return (
    <Screen>
      <Header title="Earn Coins" onBack={() => navigation.goBack()} />
      {loading && !summary ? (
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.hero} glow>
            <View>
              <Text style={styles.eyebrow}>WATCH ADS EARN COINS</Text>
              <Text style={styles.title}>Fuel your next battle</Text>
              <Text style={styles.sub}>
                {neededCoins > 0 ? `${neededCoins} more coins needed to join.` : 'Earn main coins for contest entry.'}
              </Text>
            </View>
            <CoinBadge amount={summary?.coins || 0} compact />
          </GlassCard>

          {lastReward !== null && (
            <GlassCard style={styles.rewardPopup}>
              <Ionicons name="flash" size={28} color={colors.coin} />
              <Text style={styles.rewardText}>{lastReward > 0 ? `+${lastReward} coins unlocked` : 'Ad progress updated'}</Text>
            </GlassCard>
          )}

          <GlassCard style={styles.panel}>
            <View style={styles.row}>
              <Text style={styles.panelTitle}>3-Ad Reward</Text>
              <Text style={styles.panelValue}>+{summary?.standardReward?.amount || 10}</Text>
            </View>
            <ProgressBar value={standardProgress} />
            <Text style={styles.meta}>{summary?.standardReward?.progress || 0} / {summary?.standardReward?.target || 3} ads watched</Text>
          </GlassCard>

          <GlassCard style={styles.panel}>
            <View style={styles.row}>
              <Text style={styles.panelTitle}>10-Ad Milestone</Text>
              <Text style={styles.panelValue}>{summary?.milestoneReward?.claimed ? 'Claimed' : `+${summary?.milestoneReward?.amount || 50}`}</Text>
            </View>
            <ProgressBar value={milestoneProgress} />
            <Text style={styles.meta}>{summary?.milestoneReward?.progress || 0} / {summary?.milestoneReward?.target || 10} total ads</Text>
          </GlassCard>

          <Button title={watching ? 'Loading Ad' : 'Watch Rewarded Ad'} loading={watching} disabled={watching || summary?.premiumActive} onPress={watchAd} />

          <Text style={styles.historyTitle}>Reward History</Text>
          <GlassCard style={styles.history}>
            {(summary?.rewards || []).slice(0, 8).map((item) => (
              <View key={item.id || item.adEventId} style={styles.historyRow}>
                <Text style={styles.historyText}>Ad #{item.adsWatchedAfter}</Text>
                <Text style={styles.historyCoins}>+{item.totalRewardAmount || 0}</Text>
              </View>
            ))}
            {(summary?.rewards || []).length === 0 && <Text style={styles.empty}>No rewards yet.</Text>}
          </GlassCard>
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.screen, paddingBottom: 110, gap: spacing.md },
  hero: { minHeight: 132, padding: spacing.lg, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
  eyebrow: { color: colors.coin, ...typography.caption, textTransform: 'uppercase' },
  title: { color: colors.text, ...typography.h2, marginTop: spacing.xs },
  sub: { color: colors.textMuted, ...typography.caption, marginTop: spacing.sm },
  rewardPopup: { minHeight: 56, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rewardText: { color: colors.text, ...typography.body },
  panel: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { color: colors.text, ...typography.subtitle },
  panelValue: { color: colors.coin, ...typography.subtitle },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  meta: { color: colors.textMuted, ...typography.micro },
  historyTitle: { color: colors.text, ...typography.h3, marginTop: spacing.sm },
  history: { paddingVertical: spacing.sm },
  historyRow: { minHeight: 42, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  historyText: { color: colors.text, ...typography.bodySmall },
  historyCoins: { color: colors.primary, ...typography.bodySmall },
  empty: { color: colors.textMuted, ...typography.bodySmall, padding: spacing.lg, textAlign: 'center' },
});

export default EarnCoinsScreen;
