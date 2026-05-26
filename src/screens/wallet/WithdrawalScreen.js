import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import useAppData from '../../hooks/useAppData';
import { getWithdrawalOverview, requestWithdrawal } from '../../services/withdrawalService';
import { showError, showSuccess } from '../../utils/feedback';

const WithdrawalScreen = ({ navigation }) => {
  const { refreshWallet } = useAppData();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amountCoins, setAmountCoins] = useState('1000');
  const [upiId, setUpiId] = useState('');
  const [accountName, setAccountName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOverview(await getWithdrawalOverview());
    } catch (error) {
      showError('Withdrawal status failed', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const submit = async () => {
    setSaving(true);
    try {
      const next = await requestWithdrawal({ amountCoins: Number(amountCoins), upiId, accountName });
      setOverview(next);
      setUpiId('');
      setAccountName('');
      await refreshWallet({ silent: true });
      showSuccess('Withdrawal requested');
    } catch (error) {
      showError('Withdrawal failed', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="Withdraw" onBack={() => navigation.goBack()} />
      {loading && !overview ? (
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.balance} glow>
            <View style={styles.balanceRow}>
              <Stat label="Main Coins" value={overview?.mainCoins || 0} muted />
              <Stat label="Winning Coins" value={overview?.winningCoins || 0} />
            </View>
            <Text style={styles.inr}>Estimated value: ₹{overview?.estimatedInr || 0}</Text>
            <Text style={styles.eligibility}>
              {overview?.eligible ? 'Eligible for withdrawal' : `Need ${overview?.minimumCoins || 1000} winning coins and 1 paid contest join`}
            </Text>
          </GlassCard>

          <GlassCard style={styles.form}>
            <Text style={styles.title}>Request Payout</Text>
            <TextInput style={styles.input} value={amountCoins} onChangeText={setAmountCoins} keyboardType="number-pad" placeholder="Winning coins" placeholderTextColor={colors.textDim} />
            <TextInput style={styles.input} value={upiId} onChangeText={setUpiId} autoCapitalize="none" placeholder="UPI ID" placeholderTextColor={colors.textDim} />
            <TextInput style={styles.input} value={accountName} onChangeText={setAccountName} placeholder="Name" placeholderTextColor={colors.textDim} />
            <Button title="Request Withdrawal" loading={saving} disabled={saving} onPress={() => {
              Alert.alert('Confirm withdrawal', 'Only winning coins will be held for manual payment verification.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Request', onPress: submit },
              ]);
            }} />
          </GlassCard>

          <Text style={styles.historyTitle}>Withdrawal History</Text>
          <GlassCard style={styles.history}>
            {(overview?.withdrawals || []).map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyText}>{item.amountCoins} coins · ₹{item.amountInr}</Text>
                  <Text style={styles.historyMeta}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.historyMeta}>{item.upiId}</Text>
              </View>
            ))}
            {(overview?.withdrawals || []).length === 0 && <Text style={styles.empty}>No withdrawal requests yet.</Text>}
          </GlassCard>
        </ScrollView>
      )}
    </Screen>
  );
};

const Stat = ({ label, value, muted }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, muted && styles.muted]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: { padding: spacing.screen, paddingBottom: 110, gap: spacing.md },
  balance: { padding: spacing.lg, gap: spacing.md },
  balanceRow: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1 },
  statLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  statValue: { color: colors.coin, fontSize: 24, fontWeight: '900', marginTop: spacing.xs },
  muted: { color: colors.primary },
  inr: { color: colors.text, fontSize: 15, fontWeight: '900' },
  eligibility: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  form: { padding: spacing.lg, gap: spacing.md },
  title: { color: colors.text, fontSize: 17, fontWeight: '900' },
  input: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.borderSoft, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800', backgroundColor: colors.surface },
  historyTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  history: { paddingVertical: spacing.sm },
  historyRow: { minHeight: 58, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  historyText: { color: colors.text, fontWeight: '900' },
  historyMeta: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginTop: 3 },
  empty: { color: colors.textMuted, padding: spacing.lg, textAlign: 'center' },
});

export default WithdrawalScreen;
