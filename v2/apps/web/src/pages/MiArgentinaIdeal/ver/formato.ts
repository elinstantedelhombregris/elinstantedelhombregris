/**
 * Cómo se dicen los números de Ver. Todo lo que se calcula llega hecho del servidor
 * (`GET /api/v1/vision`); acá sólo se lo pone en palabras.
 */
import { REGIONES, REGION_CON_ARTICULO, esRegion, regionDe, type Region } from '@v2/civic-core';

import { nombreCorto } from '../comun/lugar';

import type { AporteEnVision, ProvinciaEnVision, RegionEnAporte, ValorDeOpinion } from '@v2/shared';

export const IMAGINAR_HREF = '/mi-argentina-ideal/imaginar';
export const MIRAR_HREF = '/mi-argentina-ideal/mirar';

/** «8 de cada 10»: un acuerdo de 0 a 1, redondeado a décimos. */
export const deCadaDiez = (x: number) => Math.round(x * 10);

export const numero = (n: number) => n.toLocaleString('es-AR');

/** Para las columnas angostas de «Donde no coincidimos». */
export const REGION_CORTA: Readonly<Record<Region, string>> = {
  NOA: 'NOA',
  NEA: 'NEA',
  Cuyo: 'Cuyo',
  Centro: 'Centro',
  'Buenos Aires': 'Bs. As.',
  Patagonia: 'Patag.',
};

export const conArticulo = (region: string) =>
  esRegion(region) ? REGION_CON_ARTICULO[region] : region;

/** Las seis regiones de un aporte, siempre en el mismo orden. La que no vino, falta. */
export function regionesDe(a: AporteEnVision): (RegionEnAporte & { region: Region })[] {
  return REGIONES.map((region) => {
    const r = a.regiones.find((x) => x.region === region);
    return { region, acuerdo: r?.cuenta ? r.acuerdo : null, cuenta: r?.cuenta ?? false };
  });
}

/** «NOA: 8 de cada 10; NEA: faltan opiniones; …», para lectores de pantalla. */
export function lecturaDeRegiones(a: AporteEnVision): string {
  return regionesDe(a)
    .map(
      (r) =>
        `${r.region}: ${r.acuerdo === null ? 'faltan opiniones' : `${deCadaDiez(r.acuerdo)} de cada 10`}`,
    )
    .join('; ');
}

/** La región que más quiere un aporte y la que menos, entre las que cuentan. */
export function extremos(
  a: AporteEnVision,
): { alto: { region: Region; acuerdo: number }; bajo: { region: Region; acuerdo: number } } | null {
  const con = regionesDe(a).flatMap((r) =>
    r.acuerdo === null ? [] : [{ region: r.region, acuerdo: r.acuerdo }],
  );
  const [primera] = con;
  if (!primera || con.length < 2) return null;
  let alto = primera;
  let bajo = primera;
  for (const r of con) {
    if (r.acuerdo > alto.acuerdo) alto = r;
    if (r.acuerdo < bajo.acuerdo) bajo = r;
  }
  return { alto, bajo };
}

const DIA = 86_400_000;

/** Días que faltan hasta `fecha`, redondeando para arriba; `null` si no hay fecha válida. */
export function diasHasta(fecha: string | null, ahora: number): number | null {
  if (!fecha) return null;
  const fin = Date.parse(fecha);
  if (Number.isNaN(fin)) return null;
  return Math.max(0, Math.ceil((fin - ahora) / DIA));
}

/** «faltan 132 días», «falta 1 día», «ya no recibe aportes»; `null` si la edición no tiene fecha. */
export function fraseDeFecha(dias: number | null): string | null {
  if (dias === null) return null;
  if (dias === 0) return 'ya no recibe aportes';
  return dias === 1 ? 'falta 1 día' : `faltan ${numero(dias)} días`;
}

const MI_OPINION: Readonly<Record<ValorDeOpinion, string>> = {
  acuerdo: 'yo también',
  desacuerdo: 'yo no',
  paso: 'pasaste',
};

export const fraseMiOpinion = (v: ValorDeOpinion | null | undefined) =>
  v ? `Vos: ${MI_OPINION[v]}` : null;

/** «29 de 41 que opinaron también lo quieren · 5 pasaron». */
export function fraseDeTuAporte(t: { opiniones: number; acuerdos: number; pasos: number }): string {
  if (t.opiniones === 0 && t.pasos === 0)
    return 'Todavía nadie lo vio en Mirar. Los aportes con menos opiniones aparecen antes en la pila de los demás.';
  const partes: string[] = [];
  if (t.opiniones > 0)
    partes.push(
      `${numero(t.acuerdos)} de ${numero(t.opiniones)} que ${t.opiniones === 1 ? 'opinó' : 'opinaron'} también lo ${t.acuerdos === 1 ? 'quiere' : 'quieren'}`,
    );
  if (t.pasos > 0) partes.push(t.pasos === 1 ? '1 pasó' : `${numero(t.pasos)} pasaron`);
  return partes.join(' · ');
}

/** «23 personas», «menos de cinco», «todavía nadie». */
export function frasePersonas(personas: number | null): string {
  if (personas === null) return 'menos de cinco personas';
  if (personas === 0) return 'todavía nadie';
  return personas === 1 ? '1 persona' : `${numero(personas)} personas`;
}

/** «En el NEA, 8 de cada 10. En Buenos Aires, 4.» */
export function fraseDeDistancia(a: AporteEnVision): string {
  const e = extremos(a);
  if (!e) return `En total, ${deCadaDiez(a.acuerdo)} de cada 10.`;
  return `En ${conArticulo(e.alto.region)}, ${deCadaDiez(e.alto.acuerdo)} de cada 10. En ${conArticulo(e.bajo.region)}, ${deCadaDiez(e.bajo.acuerdo)}.`;
}

/** Mirar con la prioridad puesta en una región: el servidor sólo la honra si es la de quien mira. */
export const completarHref = (region: string) =>
  `${MIRAR_HREF}?${new URLSearchParams({ region }).toString()}`;

/** Lo que dice una provincia del mapa al tocarla: cuánta gente y de qué región. */
export function fraseDeProvincia(
  nombre: string,
  iso: string,
  p: ProvinciaEnVision | undefined,
): string {
  const personas = p ? p.personas : 0;
  const region = p?.region ?? regionDe(iso);
  const donde = region && esRegion(region) ? `, en ${REGION_CON_ARTICULO[region]}` : '';
  const silencio = personas === 0 ? ' El silencio también es un dato.' : '';
  return `${nombreCorto(nombre)}${donde}: ${frasePersonas(personas)}.${silencio}`;
}
