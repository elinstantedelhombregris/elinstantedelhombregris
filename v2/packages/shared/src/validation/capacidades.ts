import { z } from 'zod';

const texto = (max: number) => z.string().trim().min(1, 'Completá este dato.').max(max);
const dia = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T00:00:00Z');
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, 'Ingresá una fecha válida.');
const cantidad = z
  .number()
  .int('Usá una unidad menor para expresar fracciones.')
  .min(1)
  .max(1_000_000);
export const capacidadSchema = z
  .object({
    idLocal: z.string().uuid(),
    senalId: z.string().uuid(),
    titulo: texto(120),
    tipo: z.enum(['tiempo', 'espacio', 'equipo', 'material', 'servicio']),
    unidad: texto(60),
    cantidad: cantidad.nullable(),
    desde: dia,
    hasta: dia,
    territorioId: z.number().int().positive().nullable(),
    zona: texto(300),
    restricciones: texto(1500),
    firma: texto(120),
    autorizoOferta: z.literal(true, {
      errorMap: () => ({ message: 'Confirmá que podés ofrecer esta capacidad.' }),
    }),
  })
  .strict()
  .refine((v) => v.desde <= v.hasta, {
    path: ['hasta'],
    message: 'El cierre debe ser posterior al inicio.',
  });
export type NuevaCapacidad = z.infer<typeof capacidadSchema>;
export const solicitudCapacidadSchema = z
  .object({
    idLocal: z.string().uuid(),
    fichaId: z.string().uuid(),
    cantidad: cantidad.nullable(),
    paraFecha: dia,
    necesidad: texto(1000),
    compatibilidad: texto(1000),
    aceptaCondiciones: z.literal(true, {
      errorMap: () => ({ message: 'Confirmá que revisaste las condiciones.' }),
    }),
  })
  .strict();
export type SolicitudCapacidad = z.infer<typeof solicitudCapacidadSchema>;
export const accionReservaSchema = z
  .object({
    accion: z.enum([
      'aceptar',
      'rechazar',
      'cancelar',
      'declarar_entrega',
      'confirmar_recepcion',
      'discrepar',
    ]),
    nota: z.string().trim().max(1500).default(''),
  })
  .strict()
  .refine((v) => !['declarar_entrega', 'discrepar'].includes(v.accion) || v.nota.length > 0, {
    path: ['nota'],
    message: 'Contá qué se entregó o qué falta resolver, sin datos personales.',
  });
export type AccionReserva = z.infer<typeof accionReservaSchema>;
export const accionCapacidadSchema = z.object({ accion: z.enum(['confirmar', 'cerrar']) }).strict();
export const consultaCapacidadesSchema = z.object({
  senalId: z.string().uuid().optional(),
  fichaId: z.string().uuid().optional(),
  territorioId: z.coerce.number().int().positive().optional(),
  propias: z.enum(['si']).optional(),
  despues: z.string().uuid().optional(),
});
export type ConsultaCapacidades = z.infer<typeof consultaCapacidadesSchema>;
export type EstadoReserva =
  | 'propuesta'
  | 'reservada'
  | 'entrega_declarada'
  | 'entregada'
  | 'discrepancia'
  | 'cancelada'
  | 'rechazada';
export interface CapacidadPublica {
  id: string;
  senalId: string;
  titulo: string;
  tipo: NuevaCapacidad['tipo'];
  unidad: string;
  cantidad: number | null;
  reservada: number | null;
  entregada: number | null;
  disponible: number | null;
  desde: string;
  hasta: string;
  territorioId: number | null;
  zona: string;
  restricciones: string;
  firma: string;
  confirmadaEn: string;
  cerrada: boolean;
  vigente: boolean;
  esMia: boolean;
}
export interface ReservaCapacidad {
  id: string;
  fichaId: string;
  cantidad: number | null;
  paraFecha: string;
  necesidad: string;
  compatibilidad: string;
  estado: EstadoReserva;
  notaEntrega: string | null;
  discrepancia: string | null;
  creadaEn: string;
  actualizadaEn: string;
  soySolicitante: boolean;
}
export interface LecturaCapacidad {
  capacidad: CapacidadPublica;
  reservas: ReservaCapacidad[];
  siguiente: string | null;
}
export interface ListaCapacidades {
  capacidades: CapacidadPublica[];
  siguiente: string | null;
}
