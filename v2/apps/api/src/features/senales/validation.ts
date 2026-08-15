/**
 * Los parámetros de lectura.
 *
 * El contrato de ESCRITURA no está acá: vive en `@v2/shared` (`validation/
 * senal.ts`), porque la web y el móvil lo comparten y una segunda copia sería
 * la sexta lista paralela del sistema. Acá quedan sólo los filtros de consulta,
 * que son de la API y de nadie más.
 */
import { CLASES_SENAL, TIPOS_SENAL } from '@v2/civic-core';
import { z } from 'zod';

/** `?clases=hecho,acto` → `['hecho','acto']`. Vacío es «todas». */
const listaSeparadaPorComas = (validos: readonly string[]) =>
  z
    .string()
    .optional()
    .transform((s) =>
      s === undefined || s.trim() === ''
        ? []
        : s
            .split(',')
            .map((x) => x.trim().toLowerCase().normalize('NFC'))
            .filter((x) => validos.includes(x)),
    );

export const consultaDeSenalesSchema = z.object({
  clases: listaSeparadaPorComas(CLASES_SENAL),
  tipos: listaSeparadaPorComas(TIPOS_SENAL),
  provinceId: z.coerce.number().int().positive().optional(),
  /** El mapa sólo puede dibujar lo que tiene coordenada. */
  soloConPunto: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  /**
   * El techo real lo pone el repositorio (500). Acá se acota igual para que un
   * `?limite=abc` sea un 400 con nombre y no un `NaN` que el repositorio
   * termine leyendo como «el default».
   */
  limite: z.coerce.number().int().min(1).max(500).default(100),
});

export type ConsultaDeSenales = z.infer<typeof consultaDeSenalesSchema>;

/** El cuerpo de «esta señal responde esa pregunta». */
export const respuestaSchema = z.object({
  /** El id público del HECHO que contesta. La pregunta va en la ruta. */
  senalId: z.string().uuid('El `senalId` tiene que ser el id público de una señal.'),
});
