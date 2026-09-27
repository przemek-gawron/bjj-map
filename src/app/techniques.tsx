import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useStore } from '@/data/store';

// Placeholder — built in etap 1.
export default function TechniquesScreen() {
  const techniques = useStore((s) => s.techniques);
  return (
    <Screen title="Techniki">
      <ThemedText themeColor="textSecondary">{techniques.length} technik w bazie. Lista pojawi się w etapie 1.</ThemedText>
    </Screen>
  );
}
