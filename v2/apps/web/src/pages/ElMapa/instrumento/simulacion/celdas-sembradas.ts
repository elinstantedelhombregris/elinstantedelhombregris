import { CLASES_SENAL } from '@v2/civic-core';

import type { ClaseSenal, Retrato } from '@v2/civic-core';
import type { CeldaDeSenales } from '~/components/mapa/pintor-senales';
import type { RectanguloGeo } from '~/components/mapa/rectangulo-inscripto';

/**
 * Del retrato simulado a las celdas que sabe dibujar el pintor compartido.
 *
 * ## Lo que este archivo puede y no puede afirmar
 *
 * El retrato trae `voces` por territorio y **nada más**: ni una coordenada, ni
 * un reparto por clase. Así que acá se toman exactamente dos decisiones, y las
 * dos se declaran en pantalla:
 *
 * 1. **Dónde cae el punto**: adentro del rectángulo de la provincia, repartido
 *    por `sembrarCelda`. Es dibujo, no dato — `DECLARACION_DEL_SEMBRADO` lo
 *    dice con todas las letras y `DeclaracionDelSembrado.tsx` lo pone arriba
 *    del panel, donde ninguna cortina lo puede tapar. Que sea dibujo no lo
 *    exime de ser verdadero: el rectángulo va **inscripto** en la provincia
 *    (`~/components/mapa/rectangulo-inscripto`), así que «adentro del
 *    rectángulo» implica «adentro de la provincia», y la declaración de
 *    pantalla no promete nada que el punto no cumpla.
 *
 * 2. **De qué clase es cada voz**: del reparto DECLARADO, `Palancas.composicion`
 *    —hoy parejo entre las cuatro—, y de ningún otro lado.
 *
 * La segunda merece su párrafo, porque es donde se podía repetir el pecado de
 * la demo del 11 de agosto en otra dimensión. El motor **no** reparte por
 * clase: `retratoSimulado` no lee `composicion`, y el panel lo dice con esas
 * palabras. Entonces hay dos caminos, y sólo uno es honesto:
 *
 * - darle a toda la provincia una sola clase, y que la lista accesible del
 *   pintor —«Buenos Aires: 33.000 voces de clase hecho»— afirme algo que nadie
 *   declaró ni midió;
 * - repartir por la mezcla declarada, y que esa misma línea diga la verdad:
 *   tantas de esa clase **porque la palanca lo declara**, con el mismo estatuto
 *   que el conteo total tiene por venir de `participacion`.
 *
 * Se toma el segundo. Una celda por (provincia, clase) hace que el color y el
 * texto del lector de pantalla digan lo mismo, y que el día que las campañas
 * muevan la composición el mapa lo muestre solo.
 *
 * El costo es tinta: el techo de `sembrado.ts` está calibrado para UNA celda
 * por provincia —«quinientos círculos ya cubren cerca de la mitad de esa
 * superficie»— y cuatro celdas la cuadruplicarían. Por eso sale
 * `clasesPorTerritorio`: el radio de la marca se divide por su raíz y la tinta
 * por provincia queda donde el autor del pintor la dejó.
 *
 * Módulo puro: sin React y sin mapa, para que la aritmética del reparto se
 * pueda verificar sin montar nada.
 */

export interface Sembrado {
  readonly celdas: readonly CeldaDeSenales[];
  /**
   * Territorios que el retrato cuenta y el mapa no sabe dónde dibujar.
   *
   * Se dicen, no se tragan: una provincia que desaparece del dibujo Y de la
   * lista de conteos sin que nada lo mencione es una voz perdida en silencio,
   * que es el defecto que `sinDato` viene arreglando en el motor.
   */
  readonly sinDibujo: readonly string[];
  /** Cuántas celdas lleva cada provincia. Es lo que fija el radio de la marca. */
  readonly clasesPorTerritorio: number;
}

/**
 * Las clases con parte declarada. Si la mezcla viniera toda en cero —el
 * contrato dice que suma 1, pero el contrato no es una garantía de tipo— se
 * reparte parejo, que es el único reparto que no prefiere una clase sobre otra.
 */
function pesosDe(composicion: Readonly<Record<ClaseSenal, number>>): number[] {
  const pesos = CLASES_SENAL.map((clase) => Math.max(0, composicion[clase]));
  const suma = pesos.reduce((total, peso) => total + peso, 0);
  return suma > 0 ? pesos : CLASES_SENAL.map(() => 1);
}

export function clasesConParte(composicion: Readonly<Record<ClaseSenal, number>>): number {
  return pesosDe(composicion).filter((peso) => peso > 0).length;
}

/**
 * Las voces de una provincia repartidas entre las clases, **sin perder una**.
 *
 * Restos mayores, no redondeo suelto: con cuatro cuartos de 1.234 el redondeo
 * ingenuo devuelve 1.236, y ese par de voces de más aparecerían en el dibujo y
 * en la lista de conteos sin que ninguna palanca las haya producido. La suma
 * del reparto es exactamente el total, siempre; el desempate es el orden
 * canónico de `CLASES_SENAL`, así que el resultado no depende del orden en que
 * se recorra un objeto.
 */
export function repartirEnClases(
  voces: number,
  composicion: Readonly<Record<ClaseSenal, number>>,
): Map<ClaseSenal, number> {
  const reparto = new Map<ClaseSenal, number>();
  const total = Number.isFinite(voces) ? Math.max(0, Math.floor(voces)) : 0;
  if (total === 0) return reparto;

  const pesos = pesosDe(composicion);
  const suma = pesos.reduce((acumulado, peso) => acumulado + peso, 0);
  const restos: { clase: ClaseSenal; resto: number; orden: number }[] = [];
  let asignadas = 0;

  CLASES_SENAL.forEach((clase, i) => {
    const exacto = (total * (pesos[i] ?? 0)) / suma;
    const piso = Math.floor(exacto);
    reparto.set(clase, piso);
    asignadas += piso;
    restos.push({ clase, resto: exacto - piso, orden: i });
  });

  restos.sort((a, b) => b.resto - a.resto || a.orden - b.orden);
  let sobrantes = total - asignadas;
  for (const resto of restos) {
    if (sobrantes <= 0) break;
    reparto.set(resto.clase, (reparto.get(resto.clase) ?? 0) + 1);
    sobrantes -= 1;
  }

  return reparto;
}

/**
 * El retrato simulado, listo para el pintor.
 *
 * El `nombre` de la celda lleva la clase adentro porque el pintor rinde dos
 * textos con él —el aviso de saturación y la lista para lectores de pantalla— y
 * cuatro renglones idénticos que dicen «Buenos Aires» se leen como un error.
 * El `id` es otro: es lo que revuelve la semilla en `semillaDeCelda`, así que
 * las cuatro clases de una provincia caen en lugares distintos en vez de
 * apilarse en los mismos quinientos puntos.
 */
export function sembrarRetrato(
  retrato: Retrato,
  rectangulos: ReadonlyMap<string, RectanguloGeo>,
  composicion: Readonly<Record<ClaseSenal, number>>,
): Sembrado {
  const celdas: CeldaDeSenales[] = [];
  const sinDibujo: string[] = [];

  for (const [territorioId, territorio] of retrato.porTerritorio) {
    const voces = Math.max(0, Math.round(territorio.voces.valor));
    if (voces === 0) continue;

    const rectangulo = rectangulos.get(territorioId);
    if (rectangulo === undefined) {
      sinDibujo.push(territorioId);
      continue;
    }

    for (const [clase, cuantas] of repartirEnClases(voces, composicion)) {
      if (cuantas <= 0) continue;
      celdas.push({
        id: `${territorioId}|${clase}`,
        nombre: `${territorioId} · ${clase}`,
        clase,
        voces: cuantas,
        lng: rectangulo.lng,
        lat: rectangulo.lat,
        anchoGrados: rectangulo.anchoGrados,
        altoGrados: rectangulo.altoGrados,
      });
    }
  }

  return { celdas, sinDibujo, clasesPorTerritorio: clasesConParte(composicion) };
}
