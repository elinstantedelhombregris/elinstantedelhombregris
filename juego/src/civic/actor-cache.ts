/**
 * Caché sincrónico de `getActorKey()` (async por SecureStore/AsyncStorage).
 * `repos-protocolo.ts` necesita firmas sync (drizzle .all/.get/.run); esto
 * resuelve la promesa una sola vez, al levantar la app, y la deja lista para
 * lectura sincrónica desde cualquier repo.
 */
import { getActorKey } from './identity';

let clave: string | null = null;

/** Resuelve y cachea la actor key. Llamar una vez, temprano (_layout). */
export const calentarActorKey = async (): Promise<void> => {
  clave = await getActorKey();
};

/** Lee la actor key cacheada. Tira si `calentarActorKey` todavía no corrió. */
export const actorKeyCacheado = (): string => {
  if (clave === null) throw new Error('actor_key_frio');
  return clave;
};

/**
 * Invalida la caché (ej. después de un reset de identidad). Quien invalida
 * debe re-calentar: llamar `calentarActorKey()` antes de la próxima lectura.
 */
export const invalidarActorKey = (): void => {
  clave = null;
};
