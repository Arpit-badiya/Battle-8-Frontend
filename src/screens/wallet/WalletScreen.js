import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import CoinBadge from '../../components/common/CoinBadge';
import GlassCard from '../../components/common/GlassCard';
import Header from '../../components/common/Header';
import Loader from '../../components/common/Loader';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import useAppData from '../../hooks/useAppData';
import { showError } from '../../utils/feedback';

const WalletScreen = ({ navigation }) => {
  const { loading, refreshWallet, wallet } = useAppData();
  const hasWallet = Boolean(wallet);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          await refreshWallet({ silent: hasWallet });
        } catch (error) {
          if (active) {
            showError('Unable to load wallet', error);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [hasWallet, refreshWallet])
  );

  return (
    <Screen>
      <Header title="Wallet" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} centered={false} />
      {loading.wallet && !wallet ? (
        <Loader />
      ) : wallet ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.balanceCard} glow>
            <View>
              <Text style={styles.balanceLabel}>Main Coins</Text>
              <CoinBadge amount={wallet.mainCoins ?? wallet.balance} compact />
              <Text style={styles.winningText}>Winning: {wallet.winningCoins || 0}</Text>
            </View>
            <Ionicons name="wallet-outline" size={86} color={colors.primary} style={styles.walletIcon} />
          </GlassCard>

          <View style={styles.actionStack}>
            <Button title="Earn Coins" variant="primary" onPress={() => navigation.navigate('EarnCoins')} />
            <Button title="Withdraw Winnings" variant="purple" onPress={() => navigation.navigate('Withdrawal')} />
            <Button title="Premium" variant="purple" onPress={() => navigation.navigate('Premium')} />
          </View>

          <Text style={styles.historyTitle}>Transaction History</Text>
          <GlassCard style={styles.historyCard}>
            {wallet.transactions.map((item, index) => (
              <View key={item.id || `${item.title}-${index}`} style={styles.transaction}>
                <View>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  <Text style={styles.txTime}>{item.time}</Text>
                </View>
                <Text style={[styles.txAmount, item.amount < 0 && styles.debitText]}>
                  {item.amount > 0 ? `+${item.amount}` : item.amount}
                </Text>
              </View>
            ))}
          </GlassCard>
        </ScrollView>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    paddingBottom: 112,
    gap: spacing.md,
  },
  balanceCard: {
    minHeight: 116,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  walletIcon: {
    opacity: 0.75,
  },
  addButton: {
    marginBottom: spacing.md,
  },
  actionStack: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  winningText: {
    color: colors.coin,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  historyCard: {
    paddingVertical: spacing.sm,
  },
  transaction: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  txTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  txTime: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  txAmount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  debitText: {
    color: colors.danger,
  },
});

export default WalletScreen;
