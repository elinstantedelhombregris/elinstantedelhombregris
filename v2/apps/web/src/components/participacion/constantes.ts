import type { EstadoCampana } from '@v2/shared';

export const CAMPO =
  'bg-papel-crudo border-tinta mt-2 min-h-11 w-full border p-3 text-base font-normal leading-relaxed';
/**
 * Acciones en pila: una columna, todas del mismo ancho. Seis botones de seis anchos distintos
 * se leían como seis cosas igual de importantes; con un solo ancho el orden dice cuál es la
 * principal. `ACCION_DE_PILA` va en cada botón o enlace de la pila.
 */
export const PILA_DE_ACCIONES = 'flex max-w-[26rem] flex-col gap-3';
export const ACCION_DE_PILA = 'w-full justify-center text-center';
/** Un enlace de texto, sin forma de botón, con altura táctil. */
export const ENLACE_DE_TEXTO = 'text-violeta inline-flex min-h-11 items-center underline';
export const FASES_ROTULO: Readonly<Record<string, string>> = {
  borrador: 'En preparación',
  reuniendo: 'Juntando gente',
  por_revisar: 'En revisión',
  programada: 'Programada',
  abierta: 'Abierta a participar',
  pausada: 'Pausada',
  en_devolucion: 'Preparando la devolución',
  cerrada: 'Cerrada',
};
/** El rótulo de un estado; si el servidor manda uno que no conocemos, lo deja como llegó. */
export const rotuloDeEstado = (estado: string) => FASES_ROTULO[estado] ?? estado;
/**
 * A qué estados puede pasar una campaña desde cada uno. Es el espejo de `PASOS` en
 * `apps/api/src/features/campanas/routes.ts`, que es la que manda: si el servidor cambia el
 * recorrido, hay que cambiar esta tabla también. Con esto la pantalla ofrece solo los pasos que
 * el servidor va a aceptar. Quién da cada paso es otra regla: `PASOS_DE_QUIEN_IMPULSA` y
 * `PASOS_DE_LA_REVISION` en `@v2/shared`. `reuniendo → por_revisar` no figura porque lo da el
 * sistema al llegar al umbral, no una persona.
 */
export const PASOS_CAMPANA: Readonly<Record<EstadoCampana, readonly EstadoCampana[]>> = {
  borrador: ['reuniendo', 'programada', 'abierta'],
  reuniendo: ['borrador'],
  por_revisar: ['abierta', 'programada', 'reuniendo'],
  programada: ['abierta', 'pausada'],
  abierta: ['pausada', 'en_devolucion'],
  pausada: ['abierta', 'en_devolucion'],
  en_devolucion: ['abierta', 'cerrada'],
  cerrada: [],
};
