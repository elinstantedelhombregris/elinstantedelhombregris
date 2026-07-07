/**
 * Guardado del refresh token: SecureStore en el teléfono, AsyncStorage en web
 * (la web es solo preview de desarrollo — la app real vive en iOS/Android).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const tokenStore = {
  get: (key: string): Promise<string | null> =>
    isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key).catch(() => null),
  set: (key: string, value: string): Promise<void> =>
    isWeb
      ? AsyncStorage.setItem(key, value)
      : SecureStore.setItemAsync(key, value).catch(() => {}),
  delete: (key: string): Promise<void> =>
    isWeb
      ? AsyncStorage.removeItem(key)
      : SecureStore.deleteItemAsync(key).catch(() => {}),
};
