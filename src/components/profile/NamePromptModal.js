import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ');

const NamePromptModal = ({
  initialName = '',
  loading = false,
  onSubmit,
  onCancel,
  title = 'Set Display Name',
  subtitle = 'This name will appear in contests, leaderboards, and your profile.',
  visible,
}) => {
  const [name, setName] = useState(initialName || '');
  const normalizedName = useMemo(() => normalizeName(name), [name]);
  const validationMessage = useMemo(() => {
    if (!normalizedName) return 'Name is required';
    if (normalizedName.length < 3) return 'Use at least 3 characters';
    if (normalizedName.length > 20) return 'Use 20 characters or fewer';
    return '';
  }, [normalizedName]);

  useEffect(() => {
    if (visible) {
      setName(initialName || '');
    }
  }, [initialName, visible]);

  const handleSubmit = () => {
    if (!validationMessage && !loading) {
      onSubmit(normalizedName);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <GlassCard style={styles.card} glow>
          <View style={styles.iconWrap}>
            <Ionicons name="person-circle" size={38} color={colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            editable={!loading}
            maxLength={28}
            placeholder="Your name"
            placeholderTextColor={colors.textDim}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={styles.input}
          />
          {!!validationMessage && <Text style={styles.error}>{validationMessage}</Text>}
          <Button
            title="Save Name"
            loading={loading}
            disabled={Boolean(validationMessage) || loading}
            onPress={handleSubmit}
            style={styles.button}
          />
          {!!onCancel && (
            <Text onPress={loading ? undefined : onCancel} style={styles.cancelText}>
              Cancel
            </Text>
          )}
        </GlassCard>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screen,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  card: {
    padding: spacing.xl,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  input: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default NamePromptModal;
