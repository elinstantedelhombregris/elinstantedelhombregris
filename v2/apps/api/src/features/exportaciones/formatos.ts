import type { DatosParticipacionRepository } from '@v2/db';
import type { SolicitudExportacion } from '@v2/shared';

type Registro = Awaited<ReturnType<DatosParticipacionRepository['pagina']>>['registros'][number];
const CAMPOS: (keyof Registro)[] = [
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
  'precisionOrigen',
  'precisionExportada',
  'creadaEn',
  'campanaId',
  'edicion',
  'modo',
];
function celda(valor: string | number | null) {
  let s = valor == null ? '' : String(valor);
  if (typeof valor === 'string' && /^\s*[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
}
export function inicioRegistros(formato: SolicitudExportacion['formato']) {
  return formato === 'csv'
    ? '\ufeff' + CAMPOS.join(',') + '\r\n'
    : formato === 'geojson'
      ? '{"type":"FeatureCollection","features":['
      : '';
}
export function paginaRegistros(
  formato: SolicitudExportacion['formato'],
  registros: Registro[],
  anteriores: number,
  final: boolean,
) {
  if (formato === 'csv')
    return registros.map((r) => CAMPOS.map((k) => celda(r[k])).join(',') + '\r\n').join('');
  if (formato === 'jsonl') return registros.map((r) => JSON.stringify(r) + '\n').join('');
  return (
    (anteriores && registros.length ? ',' : '') +
    registros
      .map((r) =>
        JSON.stringify({
          type: 'Feature',
          geometry:
            r.lat === null || r.lng === null
              ? null
              : { type: 'Point', coordinates: [r.lng, r.lat] },
          properties: r,
        }),
      )
      .join(',') +
    (final ? ']}' : '')
  );
}
