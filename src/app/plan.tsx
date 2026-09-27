import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useStore } from '@/data/store';

// Placeholder — built in etap 3.
export default function PlanScreen() {
  const techniques = useStore((s) => s.techniques);
  return (
    <Screen title="Plan">
      <ThemedText themeColor="textSecondary">{techniques.length} technik w bazie. Plan tygodnia pojawi się w etapie 3.</ThemedText>
    </Screen>
  );
}
