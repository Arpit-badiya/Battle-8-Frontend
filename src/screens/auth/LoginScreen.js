import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandLogo from '../../components/common/BrandLogo';
import Button from '../../components/common/Button';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAuth from '../../hooks/useAuth';

const LoginScreen = () => {
  const [referralCode, setReferralCode] = useState('');
  const { loginWithGoogle, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(referralCode);
    } catch (error) {
      Alert.alert('Google sign-in failed', error?.message || 'Please try again.');
    }
  };

  return (
    <LinearGradient colors={[colors.background, '#04111c', colors.background]} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.brandMark}>
            <BrandLogo size={82} glow />
          </View>
          <Text style={styles.title}>Join Contests. Win Coins.</Text>
          <Text style={styles.subtitle}>Create your esports squad and enter live coin battles.</Text>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Welcome to Battle-8</Text>
            <Text style={styles.panelSub}>Use your Google account to continue securely.</Text>

            <View style={styles.inputWrap}>
              <Ionicons name="gift" size={20} color={colors.textMuted} />
              <TextInput
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                placeholder="Referral code (optional)"
                placeholderTextColor={colors.textDim}
                style={styles.input}
              />
            </View>

            <Button
              title="Continue with Google"
              loading={loading}
              onPress={handleGoogleLogin}
              icon={<Ionicons name="logo-google" size={18} color={colors.white} />}
            />
          </View>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
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
  panelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  panelSub: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
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
