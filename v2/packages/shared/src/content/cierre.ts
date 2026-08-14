import { sonGemelos } from './similitud.js';

export type EstadoCierre = 'pendiente' | 'puente' | 'completo';

export interface Cierre {
  caso: string | null;
  palanca: string | null;
  puente: string | null;
}

export const RANGOS = { caso: [60, 190], palanca: [35, 140], puenteLineas: 4 } as const;

export const IMPERATIVOS_VOSEO = [
  'pedí',
  'entrá',
  'buscá',
  'anotá',
  'llamá',
  'escribí',
  'mirá',
  'fijate',
  'andá',
  'presentá',
  'compará',
  'preguntá',
  'sumate',
  'armá',
  'guardá',
  'revisá',
  'mandá',
  'elegí',
  'empezá',
  'dibujá',
  'marcá',
  'probá',
  'medí',
  'registrá',
  'conversá',
  'compartí',
  'hacé',
  'definí',
] as const;

export const EVIDENCIA_NOMBRADA =
  /\b(ley|decreto|resolución|ordenanza|artículo|expediente|INDEC|AGN|ARCA|ANSES|BCRA|SIGEN|Boletín Oficial|Congreso|Corte Suprema|Constitución)\b/i;

function seccion(cuerpo: string, titulo: string): string | null {
  const re = new RegExp(`^#{2,3} *${titulo} *$`, 'mi');
  const m = re.exec(cuerpo);
  if (m === null) return null;
  const desde = m.index + m[0].length;
  const siguiente = /^#{1,6} /m.exec(cuerpo.slice(desde));
  const hasta = siguiente === null ? cuerpo.length : desde + siguiente.index;
  const texto = cuerpo.slice(desde, hasta).trim();
  return texto.length === 0 ? null : texto;
}

export function parsearCierre(cuerpo: string): Cierre {
  return {
    caso: seccion(cuerpo, 'El caso'),
    palanca: seccion(cuerpo, 'La palanca'),
    puente: seccion(cuerpo, 'El puente'),
  };
}

const palabras = (s: string): number => s.split(/\s+/).filter(Boolean).length;

export function validarCierre(
  cierre: Cierre,
  estado: EstadoCierre,
  contexto: { slugsValidos: Set<string>; tieneFuentes: boolean; summary?: string },
): string[] {
  if (estado === 'pendiente') return [];
  const errores: string[] = [];

  if (cierre.puente === null) {
    errores.push('falta «El puente»');
  } else {
    const lineas = cierre.puente.split('\n').filter((l) => l.trim().length > 0).length;
    if (lineas > RANGOS.puenteLineas) errores.push(`«El puente» tiene ${String(lineas)} líneas`);
    if (![...contexto.slugsValidos].some((s) => cierre.puente?.includes(s))) {
      errores.push('«El puente» no nombra contenido existente');
    }
  }

  if (estado === 'completo') {
    if (cierre.caso === null) errores.push('falta «El caso»');
    else {
      const n = palabras(cierre.caso);
      if (n < RANGOS.caso[0] || n > RANGOS.caso[1])
        errores.push(`«El caso» tiene ${String(n)} palabras`);
      if (!contexto.tieneFuentes) errores.push('«El caso» exige fuentes');
      if (!/\d/.test(cierre.caso) && !EVIDENCIA_NOMBRADA.test(cierre.caso))
        errores.push('«El caso» no nombra evidencia verificable');
    }

    if (cierre.palanca === null) errores.push('falta «La palanca»');
    else {
      const n = palabras(cierre.palanca);
      if (n < RANGOS.palanca[0] || n > RANGOS.palanca[1])
        errores.push(`«La palanca» tiene ${String(n)} palabras`);
      const ultima = cierre.palanca.trimEnd().split('\n').at(-1)?.trim().toLowerCase() ?? '';
      if (!IMPERATIVOS_VOSEO.some((v) => ultima.startsWith(v)))
        errores.push('«La palanca» no cierra con un imperativo en voseo');
    }
  }

  if (contexto.summary !== undefined) {
    for (const nombre of ['caso', 'palanca', 'puente'] as const) {
      const texto = cierre[nombre];
      if (texto !== null && sonGemelos(texto, contexto.summary, 0.7))
        errores.push(`«${nombre}» repite el summary`);
    }
  }
  return errores;
}
