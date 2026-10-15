import { z } from 'zod';

const rango = (minimo: number) =>
  z
    .object({
      min: z.number().finite().min(minimo).max(1_000_000),
      max: z.number().finite().min(minimo).max(1_000_000),
    })
    .strict()
    .refine((r) => r.max >= r.min, { message: 'El máximo no puede ser menor que el mínimo.' });
const casoSchema = z
  .object({
    horasEquipo: rango(0),
    horasPorActividad: rango(0.001),
    plazasPorActividad: rango(0).refine((r) => Number.isInteger(r.min) && Number.isInteger(r.max), {
      message: 'Indicá cantidades enteras de plazas.',
    }),
    procedencia: z.string().trim().min(10, 'Documentá de dónde sale cada parámetro.').max(2000),
    fecha: z.string().date(),
    origen: z.enum(['observado', 'supuesto']),
  })
  .strict();
export const escenarioDisponibilidadSchema = z
  .object({
    referencia: casoSchema,
    alternativa: casoSchema,
    periodo: z.string().trim().min(5).max(200),
    perjudicados: z.string().trim().min(10).max(2000),
    limites: z.string().trim().min(10).max(2000),
  })
  .strict();
export type EscenarioDisponibilidad = z.infer<typeof escenarioDisponibilidadSchema>;
const actividadesCompletas = (horas: number, porActividad: number) => {
  const cociente = horas / porActividad;
  return Math.floor(cociente + 4 * Number.EPSILON * Math.max(1, cociente));
};
export function estimarDisponibilidad(entrada: EscenarioDisponibilidad) {
  const v = escenarioDisponibilidadSchema.parse(entrada);
  const calcular = (c: EscenarioDisponibilidad['referencia']) => {
    const actividadesMin = actividadesCompletas(c.horasEquipo.min, c.horasPorActividad.max);
    const actividadesMax = actividadesCompletas(c.horasEquipo.max, c.horasPorActividad.min);
    const horasCentrales = (c.horasPorActividad.min + c.horasPorActividad.max) / 2;
    return {
      actividades: { min: actividadesMin, max: actividadesMax },
      plazas: {
        min: Math.floor(actividadesMin * c.plazasPorActividad.min),
        max: Math.floor(actividadesMax * c.plazasPorActividad.max),
      },
      sensibilidad: [
        c.horasEquipo.min,
        (c.horasEquipo.min + c.horasEquipo.max) / 2,
        c.horasEquipo.max,
      ].map((horas) => ({ horas, actividades: actividadesCompletas(horas, horasCentrales) })),
    };
  };
  return { referencia: calcular(v.referencia), alternativa: calcular(v.alternativa) };
}
