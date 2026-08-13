import { CLASE_DE_VARIABLE, DOMINIOS } from '@v2/civic-core';

import type { ClaveVariable, Magnitud, Objetivo, Procedencia, SelloDelModelo } from '@v2/civic-core';

/**
 * Cómo se lee lo que el motor devuelve: procedencia en prosa, nombres y cifras.
 *
 * Todo esto es de números y textos a textos, sin React, para que se pueda
 * verificar con un test que no monta nada. Lo que se protege acá es el contrato
 * de honestidad: **una hipótesis de modelo no se lee igual que un derivado**, y
 * eso no puede depender de que quien escriba la próxima pantalla se acuerde.
 */

/** Formatea una fracción como porcentaje rioplatense. */
export const porcentaje = (v: number): string =>
  `${(v * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;

export const numero = (v: number, decimales = 2): string =>
  v.toLocaleString('es-AR', { maximumFractionDigits: decimales });

export const entero = (v: number): string => Math.round(v).toLocaleString('es-AR');

/** Si un objetivo se lee en porcentaje o en unidades. */
export function formatoDeObjetivo(objetivo: Objetivo): (v: number) => string {
  return objetivo === 'territoriosConMandato' ? entero : porcentaje;
}

export const NOMBRE_DE_OBJETIVO: Readonly<Record<Objetivo, string>> = {
  alcance: 'Alcance',
  persistencia: 'Persistencia',
  legitimidad: 'Legitimidad',
  cobertura: 'Cobertura',
  territoriosConMandato: 'Territorios con mandato',
};

export const NOMBRE_DE_CLASE_DE_VARIABLE = {
  forma: 'la forma',
  ajuste: 'los ajustes',
  coeficiente: 'los coeficientes',
  mecanismo: 'el mecanismo',
} as const;

/**
 * Nombre humano de cada variable.
 *
 * Se escribe entero y a mano en vez de derivarse de la clave: «PISO_MANDATO» y
 * «composicion.hecho» no se leen, y una herramienta que existe para que alguien
 * piense con ella no puede pedirle que traduzca identificadores.
 */
export const NOMBRE_DE_VARIABLE: Readonly<Record<ClaveVariable, string>> = {
  participacion: 'Cuánta gente habla',
  dispersion: 'Dónde habla',
  constancia: 'Con qué constancia',
  'composicion.hecho': 'Cuánto de lo que se dice es un hecho',
  'composicion.deseo': 'Cuánto es un deseo',
  'composicion.acto': 'Cuánto es un acto con fecha',
  'composicion.meta': 'Cuánto es una pregunta',
  horizonte: 'Horizonte',
  resistencia: 'Resistencia del sistema',
  cumplimiento: 'Cumplimiento de los actos',
  PISO_MANDATO: 'Piso del mandato',
  K_RESISTENCIA: 'Cuánto multiplica la resistencia al piso',
  MINIMO_PERIODOS: 'Meses mínimos para sostener',
  PERIODOS_POR_ANIO: 'Períodos por año',
  chispa: 'Chispa',
  contagio: 'Contagio',
  desaliento: 'Desaliento',
  grado: 'Vínculos por persona',
};

export const UNIDAD_DE_VARIABLE: Readonly<Partial<Record<ClaveVariable, string>>> = {
  participacion: 'voces cada 100 mil hab.',
  horizonte: 'años',
  PISO_MANDATO: 'voces cada 100 mil hab.',
  MINIMO_PERIODOS: 'meses',
  grado: 'vínculos',
};

/** Con la preposición ya contraída: «del mecanismo», no «de el mecanismo». */
const DE_LA_CLASE = {
  forma: 'de la forma',
  ajuste: 'de los ajustes',
  coeficiente: 'de los coeficientes',
  mecanismo: 'del mecanismo',
} as const;

export const claseDeVariable = (clave: ClaveVariable): string =>
  DE_LA_CLASE[CLASE_DE_VARIABLE[clave]];

export const dominioDe = (clave: ClaveVariable) => DOMINIOS[clave];

/**
 * La procedencia, en prosa.
 *
 * `hipotesis` **envuelve** a las otras tres en vez de reemplazarlas, así que se
 * lee recursivamente: la fórmula sigue a la vista y arriba queda dicho de qué
 * modelo salió el conteo del que cuelga. Es la regla 6 en pantalla, y por eso
 * la palabra «hipótesis» va adelante y no en una nota al pie.
 */
export function explicarProcedencia(procedencia: Procedencia): string {
  switch (procedencia.tipo) {
    case 'derivado':
      return procedencia.formula;
    case 'medido':
      return `Medido: ${procedencia.fuente}`;
    case 'declarado':
      return `Declarado: ${procedencia.palanca}`;
    case 'hipotesis':
      return `Hipótesis de ${procedencia.sello.modelo}, no medida — ${explicarProcedencia(
        procedencia.sobre,
      )}`;
  }
}

/** Si en algún punto de la cadena hay una hipótesis de modelo. */
export function esHipotesis(procedencia: Procedencia): boolean {
  return procedencia.tipo === 'hipotesis';
}

export function selloDe(procedencia: Procedencia): SelloDelModelo | null {
  return procedencia.tipo === 'hipotesis' ? procedencia.sello : null;
}

export const magnitudEsHipotesis = (m: Magnitud): boolean => esHipotesis(m.procedencia);

/**
 * La frase que acompaña a toda cifra hipotética, y que no se negocia.
 *
 * Sale del mismo lugar que el aviso de la simulación del mapa del 11 de agosto,
 * y con las mismas palabras: lo que se dibuja no lo dijo nadie.
 */
export const NADIE_LO_DIJO = 'Nadie dijo ninguna de estas cosas.';
