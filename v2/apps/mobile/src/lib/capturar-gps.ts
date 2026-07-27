/**
 * GPS de mejor esfuerzo para las capturas (luz ENCENDER y expediciones):
 * pide permiso UNA sola vez en la vida, 3 s de tope, y jamás bloquea el
 * rito — sin coordenadas la estrella nace igual (spec §2, §3.6).
 */

import * as Location from 'expo-location';

import { getSetting, setSetting } from '@/db/repos';
import { CLAVES_DIA } from '@/stores/juego';

export interface UbicacionCapturada {
  point: { lat: number; lng: number };
  horizontalAccuracyM: number | null;
  capturedAt: string;
  source: 'gps_current';
}

export const obtenerUbicacion = async (): Promise<UbicacionCapturada | null> => {
  let expired = false;
  let settled = false;

  return new Promise((resolve) => {
    const finish = (value: UbicacionCapturada | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      resolve(value);
    };
    const deadline = setTimeout(() => {
      expired = true;
      finish(null);
    }, 3000);

    (async () => {
      try {
        let perm = await Location.getForegroundPermissionsAsync();
        if (expired) return;
        if (!perm.granted) {
          if (getSetting(CLAVES_DIA.gpsPedido) !== null) {
            finish(null);
            return;
          }
          setSetting(CLAVES_DIA.gpsPedido, '1');
          perm = await Location.requestForegroundPermissionsAsync();
          if (expired) return;
          if (!perm.granted) {
            finish(null);
            return;
          }
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (expired) return;
        finish({
          point: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          horizontalAccuracyM: typeof pos.coords.accuracy === 'number' && Number.isFinite(pos.coords.accuracy)
            ? Math.max(0, pos.coords.accuracy)
            : null,
          capturedAt: Number.isFinite(pos.timestamp)
            ? new Date(pos.timestamp).toISOString()
            : new Date().toISOString(),
          source: 'gps_current',
        });
      } catch {
        finish(null);
      }
    })();
  });
};

/** Compatibilidad para capturas antiguas que todavía sólo necesitan el par. */
export const obtenerCoords = async (): Promise<{ lat: number; lng: number } | null> =>
  (await obtenerUbicacion())?.point ?? null;
