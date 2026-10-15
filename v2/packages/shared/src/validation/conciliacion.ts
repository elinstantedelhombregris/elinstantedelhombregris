import { z } from 'zod';

export const nivelConciliacionSchema = z.enum([
  'province',
  'department',
  'municipality',
  'locality',
]);
export const consultaConciliacionSchema = z.object({
  nivel: nivelConciliacionSchema.default('province'),
  provincia: z
    .string()
    .regex(/^\d{2}$/, 'Indicá un código de provincia de dos cifras.')
    .optional(),
  diferencias: z.enum(['si', 'no']).default('no'),
  pagina: z.coerce.number().int().min(0).max(500).default(0),
});
export type ConsultaConciliacion = z.infer<typeof consultaConciliacionSchema>;
export interface UnidadCensal {
  nivel: string;
  codigo: string;
  nombre: string;
  provincia: string;
  departamento: string | null;
  gobiernoLocal: string | null;
  aglomerado: string | null;
  categoria: string | null;
  residual: boolean;
  fila: number;
}
export interface FilaConciliacion {
  clave: string;
  codigo: string | null;
  censo: UnidadCensal | null;
  geometria: string | null;
  operativo: { id: number; nombre: string; vigente: boolean } | null;
  incidencias: string[];
}
export interface ConciliacionTerritorial {
  fecha: string;
  versionCenso: string;
  versionGeo: string;
  fuentes: { nivel: string; archivo: string; url: string; sha256: string; registros: number }[];
  filas: FilaConciliacion[];
  total: number;
  conDiferencias: number;
  sinCodigoSinAsignar: number;
  filtradas: number;
  siguiente: number | null;
  consulta: ConsultaConciliacion;
}

export interface NomencladorCensal {
  version: string;
  consultada: string;
  referencia: string;
  fuentes: ConciliacionTerritorial['fuentes'];
  unidades: UnidadCensal[];
}
