import {
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';

const normalizeMessage = (
  value
) => {
  if (!value) {
    return 'Something went wrong.';
  }

  if (
    typeof value ===
    'string'
  ) {
    return value;
  }

  return (
    value?.message ||
    'Something went wrong.'
  );
};

export const showSuccess = (
  message
) => {
  const text =
    normalizeMessage(
      message
    );

  if (
    Platform.OS ===
    'android'
  ) {
    ToastAndroid.show(
      text,
      ToastAndroid.SHORT
    );

    return;
  }

  Alert.alert(
    'Success',
    text
  );
};

export const showError = (
  title,
  error
) => {
  const message =
    normalizeMessage(
      error
    );

  if (
    Platform.OS ===
    'android'
  ) {
    ToastAndroid.show(
      `${title}: ${message}`,
      ToastAndroid.SHORT
    );

    return;
  }

  Alert.alert(
    title,
    message
  );
};