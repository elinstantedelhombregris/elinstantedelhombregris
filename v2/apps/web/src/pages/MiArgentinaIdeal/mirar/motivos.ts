import type { MotivoDeReporte } from '@v2/shared';

/** Cómo se dice cada motivo de reporte en pantalla (spec §4, «Reportar»). */
export const TEXTO_DEL_MOTIVO: Readonly<Record<MotivoDeReporte, string>> = {
  insulta: 'Insulta a alguien',
  datos_personales: 'Tiene datos de una persona',
  fuera_de_tema: 'No tiene que ver con la pregunta',
};
