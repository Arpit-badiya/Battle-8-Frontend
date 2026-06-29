import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
            <View style={styles.balanceCopy}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceValue}>{wallet.mainCoins ?? wallet.balance ?? 0}</Text>
              <View style={styles.winningWrap}>
                <Text style={styles.winningLabel}>Winnings</Text>
                <Text style={styles.winningValue}>{wallet.winningCoins || 0}</Text>
              </View>
            </View>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={80} color={colors.primary} />
            </View>
          </GlassCard>

          <View style={styles.actionGrid}>
            <Pressable style={styles.actionCard} onPress={() => navigation.navigate('EarnCoins')}>
              <Ionicons name="videocam" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>Earn Coins</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Withdrawal')}>
              <Ionicons name="cash-outline" size={24} color={colors.purple} />
              <Text style={styles.actionLabel}>Withdraw</Text>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Premium')}>
              <Ionicons name="diamond" size={24} color={colors.accent} />
              <Text style={styles.actionLabel}>Premium</Text>
            </Pressable>
          </View>

          <Text style={styles.historyTitle}>Transaction History</Text>
          <GlassCard style={styles.historyCard}>
            {wallet.transactions.map((item, index) => (
              <View key={item.id || `${item.title}-${index}`} style={styles.transaction}>
                <View style={styles.txIconWrap}>
                  <Ionicons
                    name={item.amount > 0 ? 'arrow-down' : 'arrow-up'}
                    size={16}
                    color={item.amount > 0 ? colors.success : colors.danger}
                  />
                </View>
                <View style={styles.txMain}>
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
    minHeight: 140,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceCopy: {
    flex: 1,
  },
  balanceLabel: {
    color: colors.textMuted,
    ...typography.caption,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  winningWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  winningLabel: {
    color: colors.textMuted,
    ...typography.micro,
  },
  winningValue: {
    color: colors.success,
    ...typography.caption,
  },
  walletIcon: {
    opacity: 0.35,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  actionLabel: {
    color: colors.text,
    ...typography.micro,
    textAlign: 'center',
  },
  historyTitle: {
    color: colors.text,
    ...typography.h3,
    marginTop: spacing.sm,
  },
  historyCard: {
    paddingVertical: spacing.sm,
  },
  transaction: {
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  txIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  txMain: {
    flex: 1,
  },
  txTitle: {
    color: colors.text,
    ...typography.bodySmall,
  },
  txTime: {
    color: colors.textMuted,
    ...typography.micro,
    marginTop: 2,
  },
  txAmount: {
    color: colors.success,
    ...typography.subtitle,
  },
  debitText: {
    color: colors.danger,
  },
});

export default WalletScreen;
