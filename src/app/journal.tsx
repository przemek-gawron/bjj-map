import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useStore } from '@/data/store';

// Placeholder — built in etap 2.
export default function JournalScreen() {
  const techniques = useStore((s) => s.techniques);
  return (
    <Screen title="Dziennik">
      <ThemedText themeColor="textSecondary">{techniques.length} technik w bazie. Dziennik pojawi się w etapie 2.</ThemedText>
    </Screen>
  );
}
