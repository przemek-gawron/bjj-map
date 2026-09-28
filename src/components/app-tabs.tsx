import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useT } from '@/i18n';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const tr = useT();

  return (
    <NativeTabs
      tintColor={colors.accent}
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelVisibilityMode="labeled"
      minimizeBehavior="never">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{tr.tabs.map}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="point.3.connected.trianglepath.dotted" md="hub" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="techniques">
        <NativeTabs.Trigger.Label>{tr.tabs.techniques}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" md="list" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>{tr.tabs.plan}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="target" md="track_changes" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Label>{tr.tabs.journal}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="calendar_month" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
