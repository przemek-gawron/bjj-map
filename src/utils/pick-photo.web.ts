import * as ImagePicker from 'expo-image-picker';

/**
 * Web: no file system, so the photo is kept as a small base64 data URL inside the persisted store.
 */
export async function pickPositionPhoto(_positionId: string): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.5, base64: true });
  const asset = result.assets?.[0];
  if (result.canceled || !asset?.base64) return null;
  return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
}

export function deletePositionPhoto(_uri: string) {
  // nothing stored outside the store on web
}
