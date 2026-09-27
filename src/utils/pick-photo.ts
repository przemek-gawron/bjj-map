import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/**
 * Lets the user pick a photo and copies it into the app's document directory
 * (the picker's cache copy can be purged by the OS). Returns the persistent uri, or null if cancelled.
 */
export async function pickPositionPhoto(positionId: string): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
  if (result.canceled || !result.assets?.[0]) return null;

  // unique name so expo-image doesn't serve a cached old photo
  const dest = new File(Paths.document, `position-${positionId}-${Date.now()}.jpg`);
  await new File(result.assets[0].uri).copy(dest);
  return dest.uri;
}

/** Deletes a photo previously saved by pickPositionPhoto. */
export function deletePositionPhoto(uri: string) {
  const file = new File(uri);
  if (file.exists) file.delete();
}
