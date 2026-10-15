import type { FilaConciliacion, UnidadCensal } from '@v2/shared';

export interface UnidadOperativa {
  id: number;
  codigo: string;
  nombre: string;
  vigente: boolean;
}
export interface UnidadGeometrica {
  codigo: string | null;
  nombre: string;
  nivel: string;
}
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Unión exterior por código dentro del mismo nivel. Nunca aproxima nombres ni reparte cifras. */
export function compararUnidades(
  censo: UnidadCensal[],
  geo: UnidadGeometrica[],
  operativo: UnidadOperativa[],
  nivel: string,
): FilaConciliacion[] {
  const filas = new Map<string, FilaConciliacion>();
  const obtener = (clave: string, codigo: string | null) => {
    let fila = filas.get(clave);
    if (!fila) {
      fila = { clave, codigo, censo: null, geometria: null, operativo: null, incidencias: [] };
      filas.set(clave, fila);
    }
    return fila;
  };
  for (const u of censo) obtener(u.codigo, u.codigo).censo = u;
  geo.forEach((u, i) => {
    obtener(u.codigo ?? `sin-codigo-${i}`, u.codigo).geometria = u.nombre;
  });
  for (const u of operativo)
    obtener(u.codigo, u.codigo).operativo = { id: u.id, nombre: u.nombre, vigente: u.vigente };
  for (const f of filas.values()) {
    if (!f.censo) f.incidencias.push('No figura en este nomenclador censal');
    if (f.censo?.residual)
      f.incidencias.push('Categoría residual: no es un gobierno local identificable');
    if (!f.geometria)
      f.incidencias.push(
        nivel === 'locality'
          ? 'Sin capa de localidades incorporada'
          : 'Sin geometría en el recorte IGN',
      );
    if (!f.codigo) f.incidencias.push('Geometría sin código utilizable');
    if (!f.operativo) f.incidencias.push('Sin unidad del mismo nivel en el catálogo operativo');
    if (f.operativo && !f.operativo.vigente)
      f.incidencias.push('Unidad operativa marcada como no vigente');
    const nombres = [f.censo?.nombre, f.geometria, f.operativo?.nombre]
      .filter((n): n is string => Boolean(n))
      .map(normalizar);
    if (new Set(nombres).size > 1)
      f.incidencias.push('Denominaciones distintas: revisar documentación');
  }
  return [...filas.values()].sort((a, b) => a.clave.localeCompare(b.clave));
}
