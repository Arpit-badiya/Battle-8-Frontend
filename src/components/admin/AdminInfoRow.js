import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';

const AdminInfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text numberOfLines={2} style={styles.value}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    minHeight: 42,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    ...typography.caption,
  },
  value: {
    color: colors.text,
    ...typography.bodySmall,
  },
});

export default AdminInfoRow;
