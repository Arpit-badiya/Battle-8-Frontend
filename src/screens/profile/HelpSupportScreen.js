import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../components/common/Header';
import GlassCard from '../../components/common/GlassCard';
import Screen from '../../components/common/Screen';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const HelpSupportScreen = ({ navigation }) => (
  <Screen>
    <Header title="Support" onBack={() => navigation.goBack()} />
    <View style={styles.content}>
      <GlassCard style={styles.card} glow>
        <View style={styles.icon}>
          <Ionicons name="headset" size={34} color={colors.primary} />
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
  icon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(177,255,0,0.08)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default HelpSupportScreen;
