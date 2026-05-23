import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAuth from '../../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { sendOtp, loading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid email', 'Enter a valid email to continue.');
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await sendOtp(normalizedEmail);
      navigation.navigate('Otp', { email: normalizedEmail });
    } catch (error) {
      Alert.alert('OTP failed', error.message);
    }
  };

  return (
    <LinearGradient colors={[colors.background, '#04111c', colors.background]} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
          <View style={styles.brandMark}>
            <Ionicons name="game-controller" size={42} color={colors.primary} />
          </View>
          <Text style={styles.title}>Join Contests. Win Coins.</Text>
          <Text style={styles.subtitle}>Create your esports squad and enter live coin battles.</Text>

          <View style={styles.panel}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail" size={20} color={colors.textMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter Your Email"
                placeholderTextColor={colors.textDim}
                style={styles.input}
              />
            </View>
            <Button title="Send OTP" loading={loading} onPress={handleLogin} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
  },
  brandMark: {
    width: 82,
    height: 82,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    maxWidth: 320,
    textTransform: 'uppercase',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
    maxWidth: 300,
    lineHeight: 22,
  },
  panel: {
    padding: spacing.xl,
    borderRadius: spacing.radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  inputWrap: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LoginScreen;
