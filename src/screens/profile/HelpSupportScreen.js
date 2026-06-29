import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Badge from '../../components/common/Badge';
import Header from '../../components/common/Header';
import GlassCard from '../../components/common/GlassCard';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const HelpSupportScreen = ({ navigation }) => (
  <Screen>
    <Header title="Support" onBack={() => navigation.goBack()} />
    <View style={styles.content}>
      <GlassCard style={styles.card} glow>
        <View style={styles.top}>
          <View style={styles.icon}>
            <Ionicons name="headset" size={34} color={colors.primary} />
          </View>
          <Badge label="Coming soon" tone="gold" compact />
        </View>
        <Text style={styles.title}>Support system coming soon</Text>
        <Text style={styles.body}>
          Help desk, ticket tracking and contest dispute support will be available here in the next beta update.
        </Text>
      </GlassCard>
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screen,
  },
  card: {
    alignItems: 'center',
    padding: spacing.xxxl,
    gap: spacing.md,
  },
  top: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  title: {
    color: colors.text,
    ...typography.h3,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    ...typography.bodySmall,
    textAlign: 'center',
  },
});

export default HelpSupportScreen;
