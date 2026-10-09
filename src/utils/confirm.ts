import { Alert, Platform } from 'react-native';

import { currentT } from '@/i18n';

/**
 * Confirmation before an action. The confirm button is red unless `destructive` is false (e.g. adding data);
 * `cancelLabel` replaces the default "Cancel".
 * Alert.alert has no buttons on web, so fall back to window.confirm.
 */
export function confirm(title: string, message: string, confirmLabel: string, onConfirm: () => void, destructive = true, cancelLabel?: string) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel ?? currentT().common.cancel, style: 'cancel' },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
