import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandLogo from '../../components/common/BrandLogo';
import Button from '../../components/common/Button';
import GlassCard from '../../components/common/GlassCard';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAuth from '../../hooks/useAuth';

const SocialButton = ({ icon, label, onPress, loading }) => (
  <Pressable onPress={onPress} disabled={loading} style={[styles.socialButton, loading && styles.socialDisabled]}>
    {icon}
    <Text style={[styles.socialLabel, loading && styles.socialDisabledText]}>{loading ? 'Please wait...' : label}</Text>
  </Pressable>
);

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
            <BrandLogo size={96} glow />
          </View>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>
              Battle<Text style={styles.titleAccent}>8</Text>
            </Text>
            <Text style={styles.subtitle}>Join contests. Build teams. Win coins.</Text>
          </View>

          <GlassCard style={styles.panel} glow>
            <Text style={styles.panelTitle}>Welcome back</Text>
            <Text style={styles.panelSub}>Sign in securely with your Google account to continue.</Text>

            <SocialButton
              icon={<Ionicons name="logo-google" size={20} color={colors.text} />}
              label="Continue with Google"
              onPress={handleGoogleLogin}
              loading={loading}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.referralBox}>
              <Ionicons name="gift-outline" size={18} color={colors.primary} />
              <TextInput
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                placeholder="Referral code (optional)"
                placeholderTextColor={colors.textDim}
                style={styles.referralInput}
              />
            </View>
          </GlassCard>

          <Text style={styles.footerNote}>Secure sign-in powered by Google</Text>
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
    alignItems: 'center',
  },
  brandMark: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.display,
    color: colors.text,
    textTransform: 'uppercase',
  },
  titleAccent: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  panel: {
    width: '100%',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  panelTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  panelSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  socialButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  socialDisabled: {
    opacity: 0.6,
  },
  socialDisabledText: {
    color: colors.textDim,
  },
  socialLabel: {
    ...typography.button,
    color: colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  referralBox: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  referralInput: {
    flex: 1,
    color: colors.text,
    ...typography.body,
    paddingVertical: spacing.sm,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textDim,
    marginTop: spacing.xl,
  },
});

export default LoginScreen;
