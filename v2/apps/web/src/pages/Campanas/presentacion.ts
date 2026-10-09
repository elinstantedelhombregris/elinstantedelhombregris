import type { CampanaPublica } from '@v2/shared';

export const SLUG_DEMO_CAMPANA = 'demo-local-aprender-mendoza';
export const esEjemploLocal = (c: Pick<CampanaPublica, 'slug'>) => c.slug === SLUG_DEMO_CAMPANA;
export function fechaCampana(fecha: string) {
  const valor = new Date(fecha + 'T12:00:00');
  return Number.isNaN(valor.getTime())
    ? fecha
    : valor.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function enlaceParticiparCampana(c: Pick<CampanaPublica, 'id' | 'revision'>) {
  return `/el-mapa?campana=${c.id}&edicion=${c.revision}&participar=imaginar#instrumento`;
}
