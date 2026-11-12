import { useEffect, useState } from 'react';

/** Forma de `public/atlas/mapa.json` (lo genera «Iniciativas Estratégicas/atlas/construir.mjs»). */
export interface PlanDelMapa {
  code: string;
  slug: string;
  nombre: string;
  tramo: string | null;
  ordinal: number | null;
  palabras: number;
  nombradoPor: number;
  tesis: string | null;
  resumen: string | null;
  desarmonias: { rota: number; revisar: number; nota: number };
}

/** «a RECIBE DE b»: `a` y `b` son índices de `planes`. */
export interface VinculoDelMapa {
  a: number;
  b: number;
  peso: number;
  que: string | null;
}

export interface RelacionAuditadaDelMapa {
  a: number;
  b: number;
  estado: 'documentada' | 'inferida';
  resumen: string;
}

export interface MapaCorpusData {
  generado: string;
  canon: { tematicos: number; documentos: number; palabras: number };
  desarmonias: { rota: number; revisar: number; nota: number };
  planes: PlanDelMapa[];
  vinculos: VinculoDelMapa[];
  relaciones?: RelacionAuditadaDelMapa[];
}

export type EstadoMapa =
  | { estado: 'cargando' }
  | { estado: 'error' }
  | { estado: 'listo'; datos: MapaCorpusData };

const URL_MAPA = '/atlas/mapa.json';

/** Carga `/atlas/mapa.json` una vez por montaje. Nunca deja una promesa rechazada suelta. */
export function useMapaCorpus(): EstadoMapa {
  const [estado, setEstado] = useState<EstadoMapa>({ estado: 'cargando' });

  useEffect(() => {
    const control = new AbortController();
    void (async () => {
      try {
        const res = await fetch(URL_MAPA, { signal: control.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const datos = (await res.json()) as MapaCorpusData;
        if (!Array.isArray(datos.planes) || !Array.isArray(datos.vinculos)) {
          throw new Error('forma inesperada');
        }
        if (!control.signal.aborted) setEstado({ estado: 'listo', datos });
      } catch {
        if (!control.signal.aborted) setEstado({ estado: 'error' });
      }
    })();
    return () => {
      control.abort();
    };
  }, []);

  return estado;
}

/* ───────────── Geometría (port de `posiciones()` y `red()` del atlas estático) ───────────── */

export const LADO = 780;
export const CENTRO = LADO / 2;
export const RADIO = 232;
const HUECO = 0.09;

export const ETIQUETA_TRAMO: Record<string, string> = {
  'tranche-1': 'Tramo 1',
  'tranche-2': 'Tramo 2',
  'tranche-3': 'Tramo 3',
  'research-only': 'Solo investigación',
  protocol: 'Protocolo',
};

/** Grupo de un plan: sin tramo o sin ordinal (el plan meta, fuera de la cuenta) es «Protocolo». */
export function grupoDe(p: Pick<PlanDelMapa, 'tramo' | 'ordinal'>): string {
  return p.tramo === null || p.ordinal === null ? 'protocol' : p.tramo;
}

export interface GrupoLayout {
  grupo: string;
  etiqueta: string;
  t0: number;
  t1: number;
  indices: number[];
}

export interface LayoutMapa {
  /** Ángulo (radianes) de cada plan, por índice de `planes`. */
  angulos: number[];
  /** Índices de `planes` en el orden en que se dibujan alrededor del círculo. */
  orden: number[];
  grupos: GrupoLayout[];
}

export function layoutMapa(planes: readonly PlanDelMapa[]): LayoutMapa {
  const orden = planes
    .map((_, i) => i)
    .sort((a, b) => {
      const pa = planes[a];
      const pb = planes[b];
      if (!pa || !pb) return 0;
      return (
        grupoDe(pa).localeCompare(grupoDe(pb)) ||
        (pa.ordinal ?? 99) - (pb.ordinal ?? 99) ||
        pa.code.localeCompare(pb.code)
      );
    });

  const grupos: GrupoLayout[] = [];
  for (const i of orden) {
    const p = planes[i];
    if (!p) continue;
    const g = grupoDe(p);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.grupo === g) ultimo.indices.push(i);
    else grupos.push({ grupo: g, etiqueta: ETIQUETA_TRAMO[g] ?? g, t0: 0, t1: 0, indices: [i] });
  }

  const n = planes.length;
  const paso = n === 0 ? 0 : (Math.PI * 2 - HUECO * grupos.length) / n;
  let t = -Math.PI / 2 + HUECO / 2;
  const angulos: number[] = new Array<number>(n).fill(0);
  for (const g of grupos) {
    g.t0 = t;
    for (const i of g.indices) {
      angulos[i] = t;
      t += paso;
    }
    g.t1 = t - paso;
    t += HUECO;
  }
  return { angulos, orden, grupos };
}

export function puntoEn(angulo: number, radio: number = RADIO): [number, number] {
  return [CENTRO + radio * Math.cos(angulo), CENTRO + radio * Math.sin(angulo)];
}

/** Curva cuadrática de `b` hacia `a`, tirada hacia el centro (factor 0.42). */
export function trazoDeVinculo(anguloA: number, anguloB: number): string {
  const [x1, y1] = puntoEn(anguloB);
  const [x2, y2] = puntoEn(anguloA);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = CENTRO + (mx - CENTRO) * 0.42;
  const cy = CENTRO + (my - CENTRO) * 0.42;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export const radioDeNodo = (nombradoPor: number): number => 4 + Math.sqrt(nombradoPor) / 3.2;

export const grosorDeVinculo = (peso: number): number =>
  0.7 + Math.min(3.4, Math.log2(1 + peso) * 0.5);

/** Arco exterior de un grupo. */
export function arcoDeGrupo(g: GrupoLayout): {
  d: string;
  xEtiqueta: number;
  yEtiqueta: number;
  ancla: 'start' | 'middle' | 'end';
} {
  const r = RADIO + 118;
  const a0 = g.t0 - 0.05;
  const a1 = g.t1 + 0.05;
  const m = (a0 + a1) / 2;
  const [x0, y0] = puntoEn(a0, r);
  const [x1, y1] = puntoEn(a1, r);
  const [xe, ye] = puntoEn(m, r + 14);
  const cos = Math.cos(m);
  return {
    d: `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`,
    xEtiqueta: xe,
    yEtiqueta: ye + 3,
    ancla: cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle',
  };
}

/** Vínculos de un plan, ordenados por peso: recibe (a === i) y aporta (b === i). */
export function vinculosDe(
  datos: Pick<MapaCorpusData, 'vinculos'>,
  i: number,
): { recibe: VinculoDelMapa[]; aporta: VinculoDelMapa[] } {
  const porPeso = (x: VinculoDelMapa, y: VinculoDelMapa) => y.peso - x.peso;
  return {
    recibe: datos.vinculos.filter((v) => v.a === i).sort(porPeso),
    aporta: datos.vinculos.filter((v) => v.b === i).sort(porPeso),
  };
}
