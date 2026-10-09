import { SLUG_CAMPANA_NACIONAL } from '@v2/shared';

import type { CampanaPublica } from '@v2/shared';

export const SLUG_DEMO_CAMPANA = 'demo-local-aprender-mendoza';
export const esEjemploLocal = (c: Pick<CampanaPublica, 'slug'>) => c.slug === SLUG_DEMO_CAMPANA;
/** La campaña nacional permanente, adonde van los aportes que no eligen otra. */
export const esCampanaNacional = (c: Pick<CampanaPublica, 'slug'>) =>
  c.slug === SLUG_CAMPANA_NACIONAL;
export function fechaCampana(fecha: string) {
  const valor = new Date(fecha + 'T12:00:00');
  return Number.isNaN(valor.getTime())
    ? fecha
    : valor.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function enlaceParticiparCampana(c: Pick<CampanaPublica, 'id' | 'revision'>) {
  return `/el-mapa?campana=${c.id}&edicion=${c.revision}&participar=imaginar#instrumento`;
}
/** Cómo se puede participar, en palabras de quien lee. */
export const CANALES_ROTULO: Record<string, string> = {
  web: 'Por la web',
  encuentro: 'En encuentros',
  asistido: 'Con ayuda de una persona',
};
export const textoCanales = (canales: readonly string[]) =>
  canales.map((c) => CANALES_ROTULO[c] ?? c).join(' · ');
export const textoAportes = (n: number) =>
  n === 0
    ? 'Todavía no llegaron aportes.'
    : n === 1
      ? '1 aporte publicado.'
      : `${n.toLocaleString('es-AR')} aportes publicados.`;
/** Se está leyendo una edición que ya tiene otra más nueva. */
export const esEdicionAnterior = (c: Pick<CampanaPublica, 'revision' | 'historial'>) =>
  c.historial.some((h) => h.revision > c.revision);
