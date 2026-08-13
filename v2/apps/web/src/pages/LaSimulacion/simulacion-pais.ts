import {
  armarPais,
  CLAVES_VARIABLE,
  COEFICIENTES,
  escenarioBase,
  PROVINCIAS_REF,
  type Diseno,
  type EstadoMedido,
  type Objetivo,
  type Pais,
  type Territorio,
} from '@v2/civic-core';

/**
 * El país de la Simulación, y el diseño con que abre la página.
 *
 * Vive en su propio archivo porque lo importan **dos hilos**: la página y el
 * worker del barrido. Los dos tienen que construir exactamente el mismo `Pais`
 * o `correr()` tira —`esc.paisHuella !== pais.huella`—, y eso es precisamente
 * lo que la guarda existe para cazar. Mandar el país por `postMessage` sería la
 * otra opción; se elige reconstruirlo porque la huella se recalcula del
 * contenido en los dos lados y así una divergencia se convierte en un error
 * ruidoso en vez de en dos números que no se parecen.
 *
 * **De dónde sale el país.** De `PROVINCIAS_REF`, que es dato del proyecto y
 * vive en `civic-core`: sin red, sin API y sin base (regla 1 —offline-first— y
 * rebanada 1 de la spec, que pide exactamente eso). El lado medido arranca
 * **vacío**, y no es una simplificación: las tablas cívicas están hoy en cero
 * absoluto. Un país medido vacío es la verdad de hoy, y la página lo dice con
 * esas palabras en vez de dibujar un silencio inventado.
 */

/** El nivel de la rebanada 1. Bajar a departamento o municipio es otra cosa. */
export const NIVEL = 'provincia' as const;

/**
 * Los territorios, ordenados por id.
 *
 * El orden importa aunque `huellaDePais` ordene por su cuenta: el bitset de
 * mandatos viaja sin nombres y se lee contra `ordenCanonico`, así que cuanto
 * menos dependa el resultado del orden en que se armó la lista, mejor.
 */
export function territoriosDelPais(): readonly Territorio[] {
  const salida: Territorio[] = [];
  for (const [nombre, ref] of Object.entries(PROVINCIAS_REF)) {
    salida.push({
      id: nombre,
      nombre,
      // `PROVINCIAS_REF` guarda miles de habitantes y miles de km².
      poblacion: ref.pob * 1000,
      km2: ref.km2 * 1000,
    });
  }
  salida.sort((a, b) => (a.id < b.id ? -1 : 1));
  return salida;
}

/**
 * El país, con el reloj **congelado** por parámetro.
 *
 * `ahora` no se lee acá adentro a propósito: es el arreglo del §1.5 de la spec,
 * donde `Date.now()` vivía dentro de un `useMemo` que dependía de las palancas
 * y un milisegundo alcanzaba para voltear el mandato del lado medido. Un
 * instrumento que cambia de respuesta porque pasó el tiempo entre dos corridas
 * no compara palancas: compara relojes.
 */
export function construirPais(ahora: number): Pais {
  const base: EstadoMedido = { voces: [], ahora };
  return armarPais(base, territoriosDelPais(), NIVEL);
}

/** La pregunta con la que abre. Sin pregunta, un barrido no significa nada. */
export const PREGUNTA_INICIAL =
  '¿A partir de cuántas voces cada 100.000 habitantes gana mandato cada provincia?';

export const OBJETIVO_INICIAL: Objetivo = 'legitimidad';

/**
 * El diseño por defecto: la tabla de umbrales sobre las 24 provincias.
 *
 * Es el titular del módulo y no un ranking de sensibilidad, porque la respuesta
 * del motor es un **escalón** y no una rampa: la derivada vale 0 en casi todo
 * el dominio e infinita en un punto. «¿A partir de qué participación gana
 * mandato mi provincia?» es un número por territorio, se encuentra por
 * bisección, y es además el número que le sirve a una persona de verdad.
 */
export function disenoPorDefecto(pais: Pais): Diseno {
  return {
    base: escenarioBase(
      pais,
      'el-umbral-de-cada-provincia',
      'El umbral de cada provincia',
      PREGUNTA_INICIAL,
      7,
      COEFICIENTES,
    ),
    modo: 'forma',
    // Las dieciocho, incluidas las que este modo no lee: una ausencia sin
    // explicación se lee como un olvido, y una barra en cero se lee como «la
    // medimos y no importa». Las no conectadas salen con su razón escrita.
    claves: CLAVES_VARIABLE,
    objetivo: OBJETIVO_INICIAL,
    metodo: { tipo: 'umbral', territorios: territoriosDelPais().map((t) => t.id) },
  };
}
