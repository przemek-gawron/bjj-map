import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useRef, useState } from 'react';

import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

/**
 * Asks before a form with unsaved changes closes (Cancel, swipe down on iOS, back on Android).
 * `values` are the form's fields; the form counts as changed once they differ from the first render.
 * Returns a function to call right before closing on purpose (after saving or deleting).
 */
export function useConfirmDiscard(values: unknown) {
  const tr = useT();
  const navigation = useNavigation();
  const current = JSON.stringify(values);
  const [initial] = useState(current);
  const leaving = useRef(false);

  usePreventRemove(current !== initial, ({ data }) => {
    if (leaving.current) {
      navigation.dispatch(data.action);
      return;
    }
    confirm(tr.common.discardTitle, tr.common.discardMessage, tr.common.discard, () => navigation.dispatch(data.action), true, tr.common.keepEditing);
  });

  return () => {
    leaving.current = true;
  };
}
