/**
 * Ver — arma la visión de una campaña a partir de los conteos agregados del
 * repositorio (spec 2026-10-19-mi-argentina-ideal-la-pila.md §5).
 *
 * Las reglas de cada sección son las de `leerVision` (`@v2/civic-core`). Acá se
 * hace lo que esas reglas no hacen: **suprimir los números chicos antes de
 * calcular nada** (D-088).
 *   - Una provincia o una región con menos de cinco personas no dice cuántas son
 *     (`personas: null`), y su luz es 1 fijo, sin gradiente, si hay al menos una.
 *   - Un aporte que todavía no entra en la visión no muestra ningún porcentaje:
 *     ni el general, ni el de la región donde anda peor, ni el de cada región.
 *   - Una región con menos de cinco opiniones en un aporte no muestra porcentaje
 *     (eso ya lo hace `leerAporte`).
 *
 * Función pura: recibe la hora de afuera, no mira el reloj.
 */
import {
  esRegion,
  leerVision,
  nivelDeLuzPorHabitante,
  PROVINCIAS_CANONICAS,
  PROVINCIAS_REF,
  REGIONES,
  regionDe,
  type ConteoDeAporte,
  type ConteoRegional,
  type LecturaDeAporte,
  type Region,
} from '@v2/civic-core';

import type { CampanaDeVision, DatosDeVision } from '@v2/db';
import type {
  AporteEnVision,
  PrioridadEnVision,
  ProvinciaEnVision,
  RegionEnVision,
  ValorDeOpinion,
  VisionCampana,
} from '@v2/shared';

/** Debajo de esto, una cantidad de personas no se muestra (D-088). */
export const MINIMO_PERSONAS = 5;
/** «Lo que recién llega»: los que todavía no entran, con menos opiniones primero. */
export const TOPE_RECIEN = 10;

const ISO_POR_NOMBRE = new Map(PROVINCIAS_CANONICAS.map((p) => [p.name, p.isoCode] as const));

const suprimir = (personas: number): number | null =>
  personas >= MINIMO_PERSONAS ? personas : null;

/** La luz de una provincia, calculada sobre el número ya suprimido. */
function nivelDeProvincia(personas: number, nombre: string): number {
  if (personas <= 0) return 0;
  if (personas < MINIMO_PERSONAS) return 1;
  const ref = PROVINCIAS_REF[nombre];
  return ref ? nivelDeLuzPorHabitante(personas, ref.pob * 1000) : 1;
}

/** Los conteos crudos del repositorio, con la forma que leen las reglas. */
function conteosDeAportes(datos: DatosDeVision): ConteoDeAporte[] {
  const porRegion = new Map<string, Partial<Record<Region, ConteoRegional>>>();
  const sinRegion = new Map<string, ConteoRegional>();
  const pasos = new Map<string, number>();
  for (const c of datos.conteos) {
    pasos.set(c.id, (pasos.get(c.id) ?? 0) + c.pasos);
    const conteo = { opiniones: c.opiniones, acuerdos: c.acuerdos };
    if (esRegion(c.region)) {
      const regiones = porRegion.get(c.id) ?? {};
      regiones[c.region] = conteo;
      porRegion.set(c.id, regiones);
    } else {
      const previo = sinRegion.get(c.id) ?? { opiniones: 0, acuerdos: 0 };
      sinRegion.set(c.id, {
        opiniones: previo.opiniones + conteo.opiniones,
        acuerdos: previo.acuerdos + conteo.acuerdos,
      });
    }
  }
  const duelos = new Map(datos.duelos.map((d) => [d.id, d] as const));
  return datos.aportes.map((a) => ({
    id: a.id,
    tema: a.tema,
    publicadaEn: a.publicadaEn,
    porRegion: porRegion.get(a.id) ?? {},
    sinRegion: sinRegion.get(a.id) ?? { opiniones: 0, acuerdos: 0 },
    pasos: pasos.get(a.id) ?? 0,
    comparaciones: duelos.get(a.id)?.comparaciones ?? 0,
    primero: duelos.get(a.id)?.primero ?? 0,
  }));
}

function provinciasYRegiones(
  datos: DatosDeVision,
  cuentaPorRegion: Readonly<Record<Region, number>>,
): { provincias: ProvinciaEnVision[]; regiones: RegionEnVision[]; conAlguien: number } {
  const personas = new Map(datos.personas.map((p) => [p.provinciaId, p.personas] as const));
  const enRegion = new Map<Region, number>();
  const provincias: ProvinciaEnVision[] = [];
  for (const p of datos.provincias) {
    const iso = p.iso ?? ISO_POR_NOMBRE.get(p.nombre) ?? null;
    const region = regionDe(iso);
    if (iso === null || region === null) continue;
    const n = personas.get(p.id) ?? 0;
    enRegion.set(region, (enRegion.get(region) ?? 0) + n);
    provincias.push({
      id: p.id,
      nombre: p.nombre,
      iso,
      region,
      nivel: nivelDeProvincia(n, p.nombre),
      personas: suprimir(n),
    });
  }
  const regiones = REGIONES.map(
    (region): RegionEnVision => ({
      region,
      personas: suprimir(enRegion.get(region) ?? 0),
      cuentaEn: cuentaPorRegion[region],
    }),
  );
  const conAlguien = provincias.filter((p) => p.nivel > 0).length;
  return { provincias, regiones, conAlguien };
}

export function armarVision(
  campana: CampanaDeVision,
  datos: DatosDeVision,
  ahora: Date,
): VisionCampana {
  const conteos = conteosDeAportes(datos);
  const vision = leerVision(conteos);
  const temas = new Map(datos.temas.map((t) => [t.clave, t] as const));
  const aportes = new Map(datos.aportes.map((a) => [a.id, a] as const));
  const comparaciones = new Map(conteos.map((c) => [c.id, c.comparaciones] as const));
  const misOpiniones = new Map<string, ValorDeOpinion>(
    datos.propia.opiniones.map((o) => [o.id, o.valor] as const),
  );

  const enVision = (id: string): AporteEnVision | null => {
    const a = aportes.get(id);
    const l: LecturaDeAporte | undefined = vision.lecturas.get(id);
    if (!a || !l) return null;
    const tema = a.tema === null ? undefined : temas.get(a.tema);
    return {
      id,
      texto: a.texto,
      provincia: a.provincia,
      tema: tema ? { clave: tema.clave, etiqueta: tema.etiqueta } : null,
      opiniones: l.opiniones,
      pasos: l.pasos,
      acuerdo: l.enDiscusion ? l.acuerdo : 0,
      peor: l.enDiscusion ? l.peor : null,
      regiones: l.regiones.map((r) => ({
        region: r.region,
        acuerdo: l.enDiscusion ? r.acuerdo : null,
        cuenta: r.cuenta,
      })),
      miOpinion: misOpiniones.get(id) ?? null,
    };
  };
  const lista = (ids: readonly string[]): AporteEnVision[] =>
    ids.flatMap((id) => {
      const a = enVision(id);
      return a ? [a] : [];
    });
  const primero = lista(vision.primero).map(
    (a): PrioridadEnVision => ({
      ...a,
      comparaciones: comparaciones.get(a.id) ?? 0,
      puntaje: vision.lecturas.get(a.id)?.prioridad ?? 0,
    }),
  );

  const { provincias, regiones, conAlguien } = provinciasYRegiones(datos, vision.cuentaPorRegion);
  const regionPropia = datos.propia.regionDeOpinion;
  const fases = campana.contrato.fases;

  return {
    campana: {
      id: campana.id,
      slug: campana.slug,
      titulo: campana.contrato.titulo,
      edicion: campana.edicion,
      recibeHasta: fases[0]?.fecha ?? null,
      devolucion: campana.contrato.fechaDevolucion,
    },
    cifras: {
      personas: datos.personas.reduce((s, p) => s + p.personas, 0),
      opiniones: [...vision.lecturas.values()].reduce((s, l) => s + l.opiniones, 0),
      provincias: conAlguien,
    },
    enDiscusion: vision.enDiscusion,
    une: lista(vision.une),
    primero,
    divide: lista(vision.divide),
    temas: datos.temas.map((t) => {
      const id = vision.porTema.get(t.clave);
      return {
        clave: t.clave,
        etiqueta: t.etiqueta,
        aporte: id === undefined ? null : enVision(id),
      };
    }),
    regiones,
    provincias,
    recien: lista(vision.recien.slice(0, TOPE_RECIEN)),
    tuyo: datos.propia.tuyo,
    miRegion: esRegion(regionPropia) ? regionPropia : regionDe(datos.propia.isoDeAporte),
    calculadaEn: ahora.toISOString(),
  };
}
