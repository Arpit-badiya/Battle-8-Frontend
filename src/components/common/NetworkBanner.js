import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';

const NetworkBanner = ({ network }) => {
  if (network?.isConnected !== false && network?.isInternetReachable !== false) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No internet connection. Actions will be available after reconnecting.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 61, 49, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 61, 49, 0.32)',
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default NetworkBanner;
