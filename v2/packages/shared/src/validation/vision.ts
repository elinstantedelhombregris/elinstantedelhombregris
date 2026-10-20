/**
 * Ver y los aportes parecidos (spec 2026-10-19-mi-argentina-ideal-la-pila.md §5 y §3).
 *
 * Los contratos de respuesta están en `participacion/vision.ts`; acá va lo que
 * entra por el borde.
 */
import { z } from 'zod';

/** Lo que se busca para ofrecer parecidos: lo que la persona está escribiendo, entero o la línea. */
export const MINIMO_PARA_PARECIDOS = 10;
export const MAXIMO_PARA_PARECIDOS = 2000;
/** Cuántos aportes parecidos se ofrecen, como mucho. */
export const TOPE_PARECIDOS = 3;

/**
 * `GET /api/v1/vision?campana=<slug>`. Sin `campana`, la nacional. No es
 * estricto a propósito: un parámetro de más (un rompe-caché, por ejemplo) no
 * tiene por qué romper la lectura.
 */
export const pedidoVisionSchema = z.object({
  campana: z
    .string()
    .regex(/^[A-Za-z0-9_-]{1,120}$/, 'No reconocemos esa campaña.')
    .optional(),
});

/**
 * `POST /api/v1/vision/parecidos`. POST y no GET: lo que alguien está
 * escribiendo no viaja en la URL, que queda en historiales y registros.
 */
export const pedidoParecidosSchema = z
  .object({
    texto: z
      .string({
        required_error: 'Escribí algo para buscar aportes parecidos.',
        invalid_type_error: 'Escribí algo para buscar aportes parecidos.',
      })
      .trim()
      .min(
        MINIMO_PARA_PARECIDOS,
        `Escribí al menos ${String(MINIMO_PARA_PARECIDOS)} letras para buscar aportes parecidos.`,
      )
      .max(MAXIMO_PARA_PARECIDOS, `El límite es ${String(MAXIMO_PARA_PARECIDOS)} caracteres.`),
  })
  .strict();

export type PedidoVision = z.infer<typeof pedidoVisionSchema>;
export type PedidoParecidos = z.infer<typeof pedidoParecidosSchema>;
