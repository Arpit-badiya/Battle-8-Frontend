import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import StatusChip from '../../components/common/StatusChip';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAppData from '../../hooks/useAppData';
import { claimPremiumDailyBonus, getPremiumStatus } from '../../services/premiumService';
import { showError, showSuccess } from '../../utils/feedback';

const benefits = ['No ads', 'Faster contest join', 'Daily +5 coins', 'Premium profile badge'];

const PremiumScreen = ({ navigation }) => {
  const { refreshWallet } = useAppData();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await getPremiumStatus());
    } catch (error) {
      showError('Premium status failed', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const claimBonus = async () => {
    setClaiming(true);
    try {
      const response = await claimPremiumDailyBonus();
      setStatus(response.status);
      await refreshWallet({ silent: true });
      showSuccess('Premium bonus claimed');
    } catch (error) {
      showError('Daily bonus failed', error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Screen>
      <Header title="Premium" onBack={() => navigation.goBack()} />
      {loading && !status ? (
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.hero} glow>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>Premium access</Text>
                <Text style={styles.title}>{status?.active ? 'Premium Active' : 'Battle Pass Premium'}</Text>
                <Text style={styles.sub}>
                  Unlock an ad-free experience, faster joins, and daily bonus coins.
                </Text>
              </View>
              <StatusChip status={status?.active ? 'completed' : 'upcoming'} />
            </View>
            <View style={styles.badges}>
              <Badge label="No ads" tone="gold" compact />
              <Badge label="Daily bonus" tone="blue" compact />
            </View>
          </GlassCard>

          <GlassCard style={styles.panel}>
            {benefits.map((benefit) => (
              <View key={benefit} style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </GlassCard>

          <Button title={status?.active ? 'Claim Daily +5' : 'Admin Activation Required'} loading={claiming} disabled={!status?.active || claiming} onPress={claimBonus} />
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.screen, paddingBottom: 110, gap: spacing.md },
  hero: { minHeight: 180, padding: spacing.xl, gap: spacing.md },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primary, ...typography.caption, textTransform: 'uppercase' },
  title: { color: colors.text, ...typography.h1 },
  sub: { color: colors.textMuted, ...typography.caption, lineHeight: 18, marginTop: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  panel: { padding: spacing.lg, gap: spacing.md },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  benefitText: { color: colors.text, ...typography.body },
});

export default PremiumScreen;
