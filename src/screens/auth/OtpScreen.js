import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandLogo from '../../components/common/BrandLogo';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import useAuth from '../../hooks/useAuth';

const OtpScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const { verifyOtp, pendingEmail, loading } = useAuth();
  const email = pendingEmail || route.params?.email;
  const referralCode = route.params?.referralCode;

  const handleChange = (value, index) => {
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('OTP required', 'Enter the OTP sent to your email.');
      return;
    }

    try {
      await verifyOtp(code, email, referralCode);
    } catch (error) {
      Alert.alert('Verification failed', error.message);
    }
  };

  return (
    <LinearGradient colors={[colors.background, '#06111d', colors.background]} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Header title="" onBack={() => navigation.goBack()} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
          <View style={styles.icon}>
            <BrandLogo size={74} glow />
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Code sent to {email || 'your email'}</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={String(index)}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleChange(value, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpBox}
              />
            ))}
          </View>
          <Button title="Verify & Enter" loading={loading} onPress={handleVerify} style={styles.button} />
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
    paddingHorizontal: spacing.screen,
    justifyContent: 'center',
  },
  icon: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.sm,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.xxxl,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
});

export default OtpScreen;
