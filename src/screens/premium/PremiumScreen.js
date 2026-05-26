import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
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
            <Ionicons name="diamond" size={48} color={colors.coin} />
            <Text style={styles.title}>{status?.active ? 'Premium Active' : 'Battle Pass Premium'}</Text>
            <Text style={styles.sub}>Manual dummy subscription now. Ready for Play Billing or payout gateways later.</Text>
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
  hero: { minHeight: 180, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  title: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: 13, fontWeight: '800', textAlign: 'center', lineHeight: 19 },
  panel: { padding: spacing.lg, gap: spacing.md },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitText: { color: colors.text, fontSize: 15, fontWeight: '900' },
});

export default PremiumScreen;
