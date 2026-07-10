/**
 * GPS de mejor esfuerzo para las capturas (luz ENCENDER y expediciones):
 * pide permiso UNA sola vez en la vida, 3 s de tope, y jamás bloquea el
 * rito — sin coordenadas la estrella nace igual (spec §2, §3.6).
 */

import * as Location from 'expo-location';

import { getSetting, setSetting } from '@/db/repos';
import { CLAVES_DIA } from '@/stores/juego';

export const obtenerCoords = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    let perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted) {
      if (getSetting(CLAVES_DIA.gpsPedido) !== null) return null; // no insistir
      setSetting(CLAVES_DIA.gpsPedido, '1');
      perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return null;
    }
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    return pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : null;
  } catch {
    return null;
  }
};
