import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../../constants/colors';
import radius from '../../constants/radius';
import shadows from '../../constants/shadows';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const variants = {
  filled: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  elevated: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
  },
  ghost: {
    borderColor: 'transparent',
    backgroundColor: colors.surfaceMuted,
  },
  search: {
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
  },
};

const Input = forwardRef(
  (
    {
      label,
      value,
      error,
      hint,
      icon,
      rightIcon,
      onRightPress,
      variant = 'filled',
      disabled = false,
      containerStyle,
      inputStyle,
      style,
      ...props
    },
    ref
  ) => {
    const variantStyle = variants[variant] || variants.filled;

    return (
      <View style={[styles.container, containerStyle]}>
        {!!label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputWrap,
            variantStyle,
            error && styles.inputError,
            disabled && styles.disabled,
            style,
          ]}
        >
          {!!icon && <Ionicons name={icon} size={18} color={colors.textMuted} />}
          <TextInput
            ref={ref}
            value={value}
            editable={!disabled}
            placeholderTextColor={colors.textDim}
            style={[styles.input, inputStyle]}
            {...props}
          />
          {!!rightIcon && (
            <Pressable onPress={onRightPress} disabled={!onRightPress} hitSlop={8}>
              <Ionicons name={rightIcon} size={20} color={error ? colors.danger : colors.textMuted} />
            </Pressable>
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!error && !!hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    minWidth: 0,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    ...typography.body,
    paddingVertical: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
});

Input.displayName = 'Input';

export default Input;
