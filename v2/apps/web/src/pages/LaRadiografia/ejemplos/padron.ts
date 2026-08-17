import { claseDe } from '@v2/civic-core';

import type { Corroboracion, Dicho, DichoConFecha, Voz } from './tipos';
import type { Territorio } from '@v2/civic-core';

/**
 * El padrón — lo único que los tres escenarios comparten, y lo comparten entero.
 *
 * Acá viven **quién habló, desde dónde y cuándo**. No vive una sola palabra de
 * lo que dijo nadie: eso está en los tres archivos de escenario, y es lo único
 * que cambia entre ellos.
 *
 * Esa separación es el experimento. La legitimidad sale de `alcance ×
 * persistencia`, y el motor que la calcula (`retratoMedido` de `civic-core`)
 * recibe exactamente tres campos por voz: `territorioId`, `fecha` y `tipo` — y
 * de los tres **no lee el tipo**. Como los tres escenarios entregan el mismo
 * padrón, la legitimidad no puede diferir. No es una promesa del texto: es
 * álgebra, y hay un test que la afirma.
 *
 * **Los lugares son inventados.** Los barrios, las calles, las escuelas y los
 * centros de salud de este ejemplo no existen. Las **provincias** sí son las
 * reales, porque la cobertura tiene que poder decir algo cierto sobre un mapa
 * cierto: «de Formosa no habló nadie» no significa nada si Formosa es inventada.
 */

/* ── Los meses ────────────────────────────────────────────────────────────── */

/**
 * El reloj entra por constante y no por `Date.now()`.
 *
 * Un ejemplo que lee el reloj cambia de números todos los días y deja de ser
 * un ejemplo: la captura de pantalla de ayer contradice la de hoy sin que haya
 * cambiado un dato. Misma disciplina que `EstadoMedido.ahora` en `civic-core`,
 * que existe por esto mismo.
 */
export const AHORA = Date.UTC(2026, 7, 16, 12, 0, 0);

/** El 12 de cada mes, a mediodía UTC. Doce anclas separadas por un mes limpio. */
const dia12 = (anio: number, mes: number): number => Date.UTC(anio, mes - 1, 12, 12, 0, 0);

const M0 = dia12(2026, 8);
const M1 = dia12(2026, 7);
const M2 = dia12(2026, 6);
const M3 = dia12(2026, 5);
const M4 = dia12(2026, 4);
const M5 = dia12(2026, 3);
const M6 = dia12(2026, 2);
const M7 = dia12(2026, 1);
const M8 = dia12(2025, 12);
const M9 = dia12(2025, 11);
const M10 = dia12(2025, 10);
const M11 = dia12(2025, 9);

/* ── Los territorios ──────────────────────────────────────────────────────── */

export interface TerritorioDelEjemplo extends Territorio {
  /** Nombre canónico, de `PROVINCIAS_CANONICAS`. La provincia sí es real. */
  readonly provincia: string;
}

/**
 * Ocho territorios, y los ocho hacen falta.
 *
 * El piso del canon es `PISO_MANDATO` = 100 voces cada 100.000 habitantes —una
 * de cada mil— sostenidas `MINIMO_PERIODOS` = 3 meses. Con eso, estos ocho
 * cubren los cuatro veredictos posibles, que es lo que hace que la tabla
 * enseñe en vez de decorar:
 *
 * | territorio | voces | umbral | meses | veredicto |
 * |---|---|---|---|---|
 * | El Timbó | 14 | 8,4 | 6 | tiene mandato |
 * | Los Tarcos | 11 | 6,2 | 5 | tiene mandato |
 * | Los Ceibos | 13 | 12,5 | 6 | tiene mandato, por medio voto |
 * | La Cañada Vieja | 9 | 9,1 | 4 | **le falta el piso, por una décima** |
 * | Alto de la Cruz | 7 | 5,8 | 3 | tiene mandato, justo |
 * | San Ramón Chico | 5 | 3,4 | 2 | **cruzó el piso y no lo sostuvo** |
 * | El Zanjón | 4 | 4,9 | 4 | lo sostuvo y no cruzó el piso |
 * | Once Quebrachos | 0 | 7,2 | 0 | **la provincia muda** |
 *
 * La Cañada Vieja pierde el mandato por 0,1 voces y El Zanjón lo sostuvo cuatro
 * meses sin alcanzarlo nunca: son las dos formas distintas de no tener mandato,
 * y quien las mira necesita consejos distintos. Once Quebrachos es Formosa, de
 * donde no habló nadie — está en el padrón justamente para que la cobertura
 * tenga algo que declarar en vez de un denominador que se acomoda solo.
 */
const T = {
  t1: {
    id: 't1',
    nombre: 'Barrio El Timbó, Resistencia',
    provincia: 'Chaco',
    poblacion: 8400,
    km2: 1.4,
  },
  t2: {
    id: 't2',
    nombre: 'Villa Los Tarcos, San Miguel de Tucumán',
    provincia: 'Tucumán',
    poblacion: 6200,
    km2: 0.9,
  },
  t3: {
    id: 't3',
    nombre: 'Barrio Los Ceibos del Oeste, La Matanza',
    provincia: 'Buenos Aires',
    poblacion: 12500,
    km2: 2.1,
  },
  t4: {
    id: 't4',
    nombre: 'Barrio La Cañada Vieja, Rosario',
    provincia: 'Santa Fe',
    poblacion: 9100,
    km2: 1.6,
  },
  t5: {
    id: 't5',
    nombre: 'Barrio Alto de la Cruz, Villa María',
    provincia: 'Córdoba',
    poblacion: 5800,
    km2: 1.1,
  },
  t6: {
    id: 't6',
    nombre: 'Colonia San Ramón Chico, Oberá',
    provincia: 'Misiones',
    poblacion: 3400,
    km2: 24,
  },
  t7: { id: 't7', nombre: 'Villa El Zanjón, Salta', provincia: 'Salta', poblacion: 4900, km2: 0.8 },
  t8: {
    id: 't8',
    nombre: 'Barrio Once Quebrachos, Formosa',
    provincia: 'Formosa',
    poblacion: 7200,
    km2: 1.3,
  },
} as const satisfies Record<string, TerritorioDelEjemplo>;

/**
 * Los ocho, indexados por id. Es un objeto y no un `Map` a propósito: indexar
 * con un id que sale del padrón devuelve un territorio **y no
 * `Territorio | undefined`**, así que no hace falta un `?? ''` que convierta
 * «no sé de dónde es» en «de ningún lado» sin que nada lo diga.
 */
export const TERRITORIOS_POR_ID = T;

/** Los ocho, en orden, como los quiere el motor de legitimidad. */
export const TERRITORIOS: readonly TerritorioDelEjemplo[] = Object.values(T);

/**
 * La provincia de la que **no habló nadie**, y está en el padrón a propósito.
 *
 * Sin ella la cobertura sería 8 de 8 y no diría nada; con ella es 7 de 8 y
 * obliga a la pantalla a escribir una frase incómoda: el núcleo más grande del
 * escenario 1 dice «el país está mal» y no tiene una sola voz de acá.
 */
export const PROVINCIA_MUDA = 'Formosa';

/* ── Las 63 voces ─────────────────────────────────────────────────────────── */

/**
 * Quién habló, desde dónde y cuándo. Sin una palabra de lo que dijo.
 *
 * `actor` se repite: 44 personas para 63 señales. **Las señales no son
 * personas** —la página ya lo dice en la bajada— y la única forma de que eso
 * se pueda demostrar en la tabla es que el corpus tenga repetidores de verdad.
 * Una persona repite siempre dentro de su territorio, porque vive ahí.
 */
export const PADRON = [
  // t1 · Barrio El Timbó (Chaco) — agua, la salita, la calle
  { id: 'v01', actor: 'a01', territorio: 't1', dicha: M5 },
  { id: 'v02', actor: 'a02', territorio: 't1', dicha: M5 },
  { id: 'v03', actor: 'a03', territorio: 't1', dicha: M4 },
  { id: 'v04', actor: 'a04', territorio: 't1', dicha: M4 },
  { id: 'v05', actor: 'a05', territorio: 't1', dicha: M3 },
  { id: 'v06', actor: 'a06', territorio: 't1', dicha: M2 },
  { id: 'v07', actor: 'a07', territorio: 't1', dicha: M1 },
  { id: 'v08', actor: 'a01', territorio: 't1', dicha: M0 },
  { id: 'v09', actor: 'a08', territorio: 't1', dicha: M4 },
  { id: 'v10', actor: 'a09', territorio: 't1', dicha: M2 },
  { id: 'v11', actor: 'a10', territorio: 't1', dicha: M0 },
  { id: 'v12', actor: 'a08', territorio: 't1', dicha: M5 },
  { id: 'v13', actor: 'a11', territorio: 't1', dicha: M3 },
  { id: 'v14', actor: 'a04', territorio: 't1', dicha: M1 },

  // t2 · Villa Los Tarcos (Tucumán) — la salita, la luz, el agua
  { id: 'v15', actor: 'a12', territorio: 't2', dicha: M6 },
  { id: 'v16', actor: 'a13', territorio: 't2', dicha: M6 },
  { id: 'v17', actor: 'a14', territorio: 't2', dicha: M5 },
  { id: 'v18', actor: 'a15', territorio: 't2', dicha: M3 },
  { id: 'v19', actor: 'a16', territorio: 't2', dicha: M2 },
  { id: 'v20', actor: 'a12', territorio: 't2', dicha: M0 },
  { id: 'v21', actor: 'a17', territorio: 't2', dicha: M5 },
  { id: 'v22', actor: 'a18', territorio: 't2', dicha: M3 },
  { id: 'v23', actor: 'a17', territorio: 't2', dicha: M2 },
  { id: 'v24', actor: 'a14', territorio: 't2', dicha: M6 },
  { id: 'v25', actor: 'a19', territorio: 't2', dicha: M0 },

  // t3 · Barrio Los Ceibos del Oeste (Buenos Aires) — el colectivo, la basura, la luz
  { id: 'v26', actor: 'a20', territorio: 't3', dicha: M9 },
  { id: 'v27', actor: 'a21', territorio: 't3', dicha: M8 },
  { id: 'v28', actor: 'a22', territorio: 't3', dicha: M6 },
  { id: 'v29', actor: 'a23', territorio: 't3', dicha: M4 },
  { id: 'v30', actor: 'a24', territorio: 't3', dicha: M2 },
  { id: 'v31', actor: 'a25', territorio: 't3', dicha: M0 },
  { id: 'v32', actor: 'a20', territorio: 't3', dicha: M0 },
  { id: 'v33', actor: 'a26', territorio: 't3', dicha: M8 },
  { id: 'v34', actor: 'a27', territorio: 't3', dicha: M6 },
  { id: 'v35', actor: 'a28', territorio: 't3', dicha: M4 },
  { id: 'v36', actor: 'a23', territorio: 't3', dicha: M2 },
  { id: 'v37', actor: 'a26', territorio: 't3', dicha: M9 },
  { id: 'v38', actor: 'a29', territorio: 't3', dicha: M0 },

  // t4 · Barrio La Cañada Vieja (Santa Fe) — la salita de 4, el agua, la calle
  { id: 'v39', actor: 'a30', territorio: 't4', dicha: M7 },
  { id: 'v40', actor: 'a31', territorio: 't4', dicha: M7 },
  { id: 'v41', actor: 'a32', territorio: 't4', dicha: M5 },
  { id: 'v42', actor: 'a30', territorio: 't4', dicha: M3 },
  { id: 'v43', actor: 'a33', territorio: 't4', dicha: M1 },
  { id: 'v44', actor: 'a34', territorio: 't4', dicha: M5 },
  { id: 'v45', actor: 'a34', territorio: 't4', dicha: M1 },
  { id: 'v46', actor: 'a35', territorio: 't4', dicha: M3 },
  { id: 'v47', actor: 'a35', territorio: 't4', dicha: M1 },

  // t5 · Barrio Alto de la Cruz (Córdoba) — la luz, el agua, la changa
  { id: 'v48', actor: 'a36', territorio: 't5', dicha: M6 },
  { id: 'v49', actor: 'a37', territorio: 't5', dicha: M4 },
  { id: 'v50', actor: 'a38', territorio: 't5', dicha: M4 },
  { id: 'v51', actor: 'a36', territorio: 't5', dicha: M1 },
  { id: 'v52', actor: 'a38', territorio: 't5', dicha: M6 },
  { id: 'v53', actor: 'a39', territorio: 't5', dicha: M4 },
  { id: 'v54', actor: 'a39', territorio: 't5', dicha: M1 },

  // t6 · Colonia San Ramón Chico (Misiones) — el camino, la escuela
  { id: 'v55', actor: 'a40', territorio: 't6', dicha: M10 },
  { id: 'v56', actor: 'a41', territorio: 't6', dicha: M10 },
  { id: 'v57', actor: 'a40', territorio: 't6', dicha: M8 },
  { id: 'v58', actor: 'a42', territorio: 't6', dicha: M10 },
  { id: 'v59', actor: 'a42', territorio: 't6', dicha: M8 },

  // t7 · Villa El Zanjón (Salta) — la luz, el agua
  { id: 'v60', actor: 'a43', territorio: 't7', dicha: M11 },
  { id: 'v61', actor: 'a43', territorio: 't7', dicha: M9 },
  { id: 'v62', actor: 'a44', territorio: 't7', dicha: M7 },
  { id: 'v63', actor: 'a44', territorio: 't7', dicha: M2 },
] as const;

/**
 * Los 63 ids, como unión de literales.
 *
 * De acá sale la guarda más útil de todo el ejemplo: cada escenario declara sus
 * frases como `Readonly<Record<IdDeVoz, Dicho>>`, así que **una frase que falta
 * no compila y una frase de más tampoco**. Los tres escenarios no pueden
 * desincronizarse ni por descuido ni por un merge: la igualdad de cantidad —que
 * es la condición sin la cual el ejemplo no prueba nada— la sostiene el
 * compilador, no la buena voluntad.
 */
export type IdDeVoz = (typeof PADRON)[number]['id'];

/* ── El armado ────────────────────────────────────────────────────────────── */

export interface ArmadoDeEscenario {
  readonly dichos: Readonly<Record<IdDeVoz, Dicho | DichoConFecha>>;
  /** Sólo el escenario 3. En los otros dos nadie fue a mirar nada todavía. */
  readonly corroboraciones: Readonly<Record<IdDeVoz, Corroboracion>> | null;
}

/** Pega el padrón con lo que se dijo. La clase sale de `claseDe`, siempre. */
export function armarVoces({ dichos, corroboraciones }: ArmadoDeEscenario): readonly Voz[] {
  return PADRON.map((puesto) => {
    const dicho = dichos[puesto.id];
    return {
      id: puesto.id,
      texto: dicho.texto,
      tipo: dicho.tipo,
      clase: claseDe(dicho.tipo),
      provincia: T[puesto.territorio].provincia,
      territorioId: puesto.territorio,
      actorId: puesto.actor,
      dicha: puesto.dicha,
      cuando: 'cuando' in dicho ? dicho.cuando : null,
      corroboracion: corroboraciones === null ? null : corroboraciones[puesto.id],
    };
  });
}
