/**
 * El borde de La Radiografía. Dos mandos y nada más.
 *
 * Spec: `docs/specs/2026-08-12-la-radiografia.md` §4.5, §4.6, R7.
 */
import { z } from 'zod';

/**
 * El umbral inicial es **provisorio** y está marcado como tal por pedido
 * expreso de la spec §4.6: no sale de 1/φ ni de ningún número lindo (R10),
 * sale de dónde los núcleos empiezan a tener sentido con el corpus que hay —
 * y con el corpus de hoy eso no se puede calibrar. Cuando se calibre, se
 * cambia acá y se declara en pantalla junto al número.
 */
export const UMBRAL_POR_DEFECTO = 0.72;

/** Las `k` vecinas por señal del k-NN (spec §4.5.1). */
export const K_POR_DEFECTO = 12;

/**
 * El techo de `k`. El k-NN es O(n²) en comparaciones y `k` sólo decide cuántas
 * de esas comparaciones sobreviven como arista; un `k` desmedido no rompe el
 * cálculo pero sí convierte el grafo en una madeja donde todo está conectado
 * con todo y el umbral deja de decir nada.
 */
export const K_MAXIMO = 50;

/**
 * Una cadena vacía en la query (`?umbral=`) es **ausencia**, no cero.
 * `z.coerce.number()` la convertiría en `0`, y un umbral 0 funde el país
 * entero en un solo núcleo sin que nadie lo haya pedido.
 */
const ausenteEs =
  (defecto: number) =>
  (valor: unknown): unknown =>
    valor === undefined || valor === null || valor === '' ? defecto : valor;

export const consultaRadiografiaSchema = z.object({
  umbral: z.preprocess(
    ausenteEs(UMBRAL_POR_DEFECTO),
    z.coerce
      .number()
      .min(0, 'El umbral tiene que estar entre 0 y 1.')
      .max(1, 'El umbral tiene que estar entre 0 y 1.'),
  ),
  k: z.preprocess(
    ausenteEs(K_POR_DEFECTO),
    z.coerce
      .number()
      .int('k tiene que ser un número entero.')
      .min(1, `k tiene que estar entre 1 y ${String(K_MAXIMO)}.`)
      .max(K_MAXIMO, `k tiene que estar entre 1 y ${String(K_MAXIMO)}.`),
  ),
});

export type ConsultaRadiografia = z.infer<typeof consultaRadiografiaSchema>;
