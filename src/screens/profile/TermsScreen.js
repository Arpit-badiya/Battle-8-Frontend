import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Badge from '../../components/common/Badge';
import Header from '../../components/common/Header';
import GlassCard from '../../components/common/GlassCard';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const sections = [
  ['Fantasy Contest Disclaimer', 'Battle-8 contests are skill-based esports fantasy contests. Team selection, contest entry and winnings depend on player performance, contest rules and fair participation.'],
  ['Fair Play Rules', 'Users must create teams honestly, avoid multiple-account abuse, and must not exploit bugs, automation, collusion or unauthorized access.'],
  ['Wallet Rules', 'Coins are maintained as an in-app wallet balance for contest entry, refunds and winnings. Failed joins are rolled back where technically possible.'],
  ['Refund Conditions', 'Refunds may be issued for cancelled contests, invalid result processing, or platform-side failures. Completed contests are not refunded after payouts are distributed.'],
  ['Anti-Cheat Policy', 'Suspicious activity, duplicate accounts, payment abuse, fake referrals, or result manipulation may lead to wallet holds and account review.'],
  ['Account Suspension', 'Battle-8 can restrict accounts that violate fair play, security, or platform integrity rules.'],
  ['Winnings Disclaimer', 'Winnings are calculated from official contest results, fantasy scoring rules, rank ties, and configured prize distribution.'],
  ['Esports Participation', 'Only contest-listed BGMI players are valid for team creation and result processing. Admin-imported result files are validated before payouts.'],
];

const TermsScreen = ({ navigation }) => (
  <Screen>
    <Header title="Terms" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>Battle-8 beta rules for fantasy esports participation.</Text>
        <Badge label="Policy" tone="gold" compact />
      </View>
      {sections.map(([title, body]) => (
        <GlassCard key={title} style={styles.card}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </GlassCard>
      ))}
    </ScrollView>
  </Screen>
);

const styles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    paddingBottom: 96,
    gap: spacing.md,
  },
  hero: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.h2,
  },
  subtitle: {
    color: colors.textMuted,
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.primary,
    ...typography.subtitle,
  },
  body: {
    color: colors.textMuted,
    ...typography.bodySmall,
  },
});

export default TermsScreen;
