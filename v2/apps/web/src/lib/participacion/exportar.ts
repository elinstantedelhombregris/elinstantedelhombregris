import type { ManifiestoExportacion } from '@v2/shared';

import { api } from '~/lib/api';

export interface RegistroExportable {
  id: string;
  tipo: string;
  clase: string;
  estado: string;
  tema: string | null;
  texto: string | null;
  textoOmitido: string | null;
  provinceId: number | null;
  cityId: number | null;
  lat: number | null;
  lng: number | null;
  precisionOrigen: string;
  precisionExportada: string;
  creadaEn: string;
  campanaId: string | null;
  edicion: number | null;
  modo: string | null;
}
const CAMPOS: (keyof RegistroExportable)[] = [
  'id',
  'tipo',
  'clase',
  'estado',
  'tema',
  'texto',
  'textoOmitido',
  'provinceId',
  'cityId',
  'lat',
  'lng',
  'precisionExportada',
  'creadaEn',
  'campanaId',
  'edicion',
  'modo',
];
export function celdaCsv(valor: string | number | boolean | null | undefined): string {
  let s = valor == null ? '' : String(valor);
  if (typeof valor === 'string' && /^\s*[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
}
export function aCsv(registros: RegistroExportable[]): string {
  return (
    '\ufeff' +
    CAMPOS.join(',') +
    '\r\n' +
    registros.map((r) => CAMPOS.map((k) => celdaCsv(r[k])).join(',')).join('\r\n')
  );
}
export function filtrosPublicos(q: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(q).filter(
      ([k, v]) =>
        ['campana', 'edicion', 'territorio', 'tema', 'desde', 'hasta', 'tipo', 'estado'].includes(
          k,
        ) && v,
    ),
  );
}
export async function reunirRegistro(
  consulta: Record<string, string>,
  signal: AbortSignal,
  progreso: (n: number, total: number) => void,
) {
  const filtros = filtrosPublicos(consulta);
  const registros: RegistroExportable[] = [];
  let siguiente: string | null = null;
  let corte = '';
  let manifiesto: ManifiestoExportacion | undefined;
  const cursores = new Set<string>();
  do {
    if (signal.aborted) throw new Error('Cancelaste la descarga.');
    const q: URLSearchParams = new URLSearchParams({
      ...filtros,
      limite: '100',
      ...(siguiente ? { cursor: siguiente } : {}),
      ...(corte ? { corte } : {}),
    });
    const p: {
      registros: RegistroExportable[];
      total: number;
      siguiente: string | null;
      manifiesto: ManifiestoExportacion;
    } = await api.get<{
      registros: RegistroExportable[];
      total: number;
      siguiente: string | null;
      manifiesto: ManifiestoExportacion;
    }>(`/api/v1/exportaciones/publica?${q.toString()}`, { signal });
    if (corte && p.manifiesto.corte !== corte)
      throw new Error('El corte cambió durante la descarga. Volvé a empezar.');
    corte = p.manifiesto.corte;
    manifiesto = p.manifiesto;
    registros.push(...p.registros);
    progreso(registros.length, p.total);
    siguiente = p.siguiente;
    if (siguiente && cursores.has(siguiente))
      throw new Error(
        'La continuación se repitió. No vamos a llamar completo a un archivo incompleto.',
      );
    if (siguiente) cursores.add(siguiente);
  } while (siguiente);
  return {
    registros,
    manifiesto: {
      ...manifiesto,
      completo: true,
      filtros,
      conteos: { ...manifiesto.conteos, entregados: registros.length },
      sha256: Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(JSON.stringify(registros)),
          ),
        ),
      )
        .map((n) => n.toString(16).padStart(2, '0'))
        .join(''),
    },
  };
}
/** ZIP sin compresión ni dependencia adicional. Cada entrada tiene CRC32. */
export function paqueteZip(archivos: { nombre: string; contenido: string }[]): Blob {
  const encoder = new TextEncoder();
  const partes: Uint8Array[] = [];
  const centrales: Uint8Array[] = [];
  let offset = 0;
  const crc = (data: Uint8Array) => {
    let c = 0xffffffff;
    for (const b of data) {
      c ^= b;
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  };
  for (const archivo of archivos) {
    const nombre = encoder.encode(archivo.nombre);
    const data = encoder.encode(archivo.contenido);
    const suma = crc(data);
    const local = new Uint8Array(30 + nombre.length);
    const l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true);
    l.setUint16(4, 20, true);
    l.setUint16(6, 0x800, true);
    l.setUint16(12, 33, true);
    l.setUint32(14, suma, true);
    l.setUint32(18, data.length, true);
    l.setUint32(22, data.length, true);
    l.setUint16(26, nombre.length, true);
    local.set(nombre, 30);
    partes.push(local, data);
    const central = new Uint8Array(46 + nombre.length);
    const v = new DataView(central.buffer);
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 20, true);
    v.setUint16(8, 0x800, true);
    v.setUint16(14, 33, true);
    v.setUint32(16, suma, true);
    v.setUint32(20, data.length, true);
    v.setUint32(24, data.length, true);
    v.setUint16(28, nombre.length, true);
    v.setUint32(42, offset, true);
    central.set(nombre, 46);
    centrales.push(central);
    offset += local.length + data.length;
  }
  const fin = new Uint8Array(22);
  const v = new DataView(fin.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, archivos.length, true);
  v.setUint16(10, archivos.length, true);
  v.setUint32(
    12,
    centrales.reduce((n, p) => n + p.length, 0),
    true,
  );
  v.setUint32(16, offset, true);
  return new Blob(
    [...partes, ...centrales, fin].map((p) => new Uint8Array(p).buffer),
    { type: 'application/zip' },
  );
}
export function entregarArchivo(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
