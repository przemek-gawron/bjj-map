import { Alert, Platform } from 'react-native';

import { currentT } from '@/i18n';

/** Destructive-action confirmation. Alert.alert has no buttons on web, so fall back to window.confirm. */
export function confirm(title: string, message: string, confirmLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: currentT().common.cancel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
