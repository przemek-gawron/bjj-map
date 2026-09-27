import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useStore } from '@/data/store';

// Placeholder — built in etap 4.
export default function MapScreen() {
  const techniques = useStore((s) => s.techniques);
  return (
    <Screen title="Mapa">
      <ThemedText themeColor="textSecondary">{techniques.length} technik w bazie. Mapa pojawi się w etapie 4.</ThemedText>
    </Screen>
  );
}
