/**
 * Las variables del barrido — spec §2.2 y §3.6.
 *
 * Ésta es la parte que decide si el módulo es honesto. Las siete palancas de
 * hoy **no** son un grupo homogéneo, y forzarlas a serlo es lo que rompería el
 * módulo en seis meses:
 *
 * - **la forma** la declara un modo y la produce el otro;
 * - **los ajustes** los obedecen los dos, en el mismo lugar del cálculo;
 * - **el mecanismo** existe sólo en el modo gente, porque el modo forma no
 *   tiene interacción y por lo tanto no tiene dónde ponerlo;
 * - **los coeficientes** son decisiones nuestras, no de la gente.
 *
 * Un eje de clase `forma` en modo gente, y uno de clase `mecanismo` en modo
 * forma, **no se dibujan en cero**: se rechazan con la razón escrita. Es el
 * criterio que el panel de palancas ya había establecido — *un dial que no hace
 * nada es peor que una ausencia explicada*.
 */

import { CLASES_SENAL } from '../../senal/vocabulario.js';

import { normalizarComposicion } from './forma.js';

import type { Ajustes, Escenario, Mecanismo } from './escenario.js';
import type { Coeficientes } from '../coeficientes.js';

export type CampoDeForma =
  | 'participacion'
  | 'dispersion'
  | 'constancia'
  | 'composicion.hecho'
  | 'composicion.deseo'
  | 'composicion.acto'
  | 'composicion.meta';

export type CampoDeAjuste = keyof Ajustes;
export type CampoDeCoeficiente = keyof Coeficientes;
export type CampoDeMecanismo = Exclude<keyof Mecanismo, 'poblacionHuella'>;

export type ClaveVariable =
  | CampoDeForma
  | CampoDeAjuste
  | CampoDeCoeficiente
  | CampoDeMecanismo;

export type ClaseDeVariable = 'forma' | 'ajuste' | 'coeficiente' | 'mecanismo';

export const CLASE_DE_VARIABLE: Readonly<Record<ClaveVariable, ClaseDeVariable>> = {
  participacion: 'forma',
  dispersion: 'forma',
  constancia: 'forma',
  'composicion.hecho': 'forma',
  'composicion.deseo': 'forma',
  'composicion.acto': 'forma',
  'composicion.meta': 'forma',
  horizonte: 'ajuste',
  resistencia: 'ajuste',
  cumplimiento: 'ajuste',
  PISO_MANDATO: 'coeficiente',
  K_RESISTENCIA: 'coeficiente',
  MINIMO_PERIODOS: 'coeficiente',
  PERIODOS_POR_ANIO: 'coeficiente',
  chispa: 'mecanismo',
  contagio: 'mecanismo',
  desaliento: 'mecanismo',
  grado: 'mecanismo',
};

export const CLAVES_VARIABLE = Object.keys(CLASE_DE_VARIABLE) as readonly ClaveVariable[];

export type Distribucion =
  | { forma: 'uniforme' }
  | { forma: 'triangular'; modo: number }
  | { forma: 'lognormal'; mediana: number; sigma: number }
  | { forma: 'discreta'; valores: readonly number[] };

export type Variable =
  | { estado: 'fijada'; clave: ClaveVariable; valor: number }
  | {
      estado: 'barrida';
      clave: ClaveVariable;
      minimo: number;
      maximo: number;
      pasos: number;
      distribucion: Distribucion;
      /** OBLIGATORIA. Un rango sin razón es un número inventado. */
      razon: string;
    }
  | { estado: 'noConectada'; clave: ClaveVariable; razon: string };

export interface Dominio {
  readonly minimo: number;
  readonly maximo: number;
  readonly distribucion: Distribucion;
  /** Por qué ese rango y no otro. Viaja como `declarado`. */
  readonly razon: string;
  readonly entero: boolean;
}

const ACOTADA_POR_EL_MOTOR =
  'El motor la acota a [0, 1]. Muestrear afuera es muestrear el mismo punto muchas veces y ' +
  'bajar la varianza artificialmente: la mitad de las corridas darían resultados idénticos y ' +
  'la banda saldría más angosta de lo que es.';

/**
 * Los dominios, cada uno con su razón. Hay un test que afirma que coinciden
 * con lo que el motor efectivamente clampea.
 */
export const DOMINIOS: Readonly<Record<ClaveVariable, Dominio>> = {
  participacion: {
    minimo: 0,
    maximo: 1000,
    // Medido: arriba de 500 el resultado ya saturó. Una uniforme tiraría la
    // mitad de las muestras en la meseta y el barrido mediría su propia grilla.
    distribucion: { forma: 'lognormal', mediana: 200, sigma: 1 },
    razon:
      'El motor no la acota, así que la cota es epistémica y se declara: 1.000 cada 100.000 es ' +
      '1 de cada 100 habitantes, y arriba de eso el modelo ya no describe un país, describe un ' +
      'padrón.',
    entero: false,
  },
  dispersion: { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  constancia: { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  'composicion.hecho': { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  'composicion.deseo': { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  'composicion.acto': { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  'composicion.meta': { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  horizonte: {
    minimo: 1 / 12,
    maximo: 10,
    // `periodosDelHorizonte` hace `round(h × 12)`: muestrear continuo produce un
    // zigzag de redondeo que un tornado reportaría como sensibilidad errática.
    // Se mata el artefacto en la declaración, no en el post-proceso.
    distribucion: { forma: 'discreta', valores: [1 / 12, 3 / 12, 6 / 12, 1, 2, 3, 5, 10] },
    razon:
      'Un mes es el período mínimo que el motor distingue y diez años es el horizonte más largo ' +
      'que una persona planifica. Discreta porque el redondeo a meses hace que dos horizontes ' +
      'vecinos den el mismo número de períodos.',
    entero: false,
  },
  resistencia: { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  cumplimiento: { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  PISO_MANDATO: {
    minimo: 10,
    maximo: 500,
    distribucion: { forma: 'uniforme' },
    razon:
      'El piso publicado es 100 (1 cada 1.000 habitantes). Barrerlo entre 10 y 500 contesta ' +
      '«¿cuánto de lo que veo depende de que hayamos elegido 100?», que es media pregunta que ' +
      'un barrido de sólo palancas no hace.',
    entero: false,
  },
  K_RESISTENCIA: {
    minimo: 0,
    maximo: 10,
    distribucion: { forma: 'uniforme' },
    razon:
      'A 0 la resistencia no existe y a 10 el piso se multiplica por once. El valor publicado es ' +
      '4 —la obstrucción total tiene que ser superable y cara—, y el rango cubre las dos ' +
      'lecciones que el motor no puede enseñar: el fatalismo y la ingenuidad.',
    entero: false,
  },
  MINIMO_PERIODOS: {
    minimo: 1,
    maximo: 12,
    distribucion: { forma: 'discreta', valores: [1, 2, 3, 6, 12] },
    razon:
      'El valor publicado es 3 meses. 1 es «un pico gobierna» y 12 es «hace falta un año»: los ' +
      'dos extremos son posiciones defendibles y el barrido muestra qué cambia entre ellas.',
    entero: true,
  },
  PERIODOS_POR_ANIO: {
    minimo: 12,
    maximo: 12,
    distribucion: { forma: 'discreta', valores: [12] },
    razon:
      'El período es el mes, y hoy eso está escrito en DOS lugares: `periodosDelHorizonte`, que ' +
      'lo lee del escenario, y `MS_POR_PERIODO` en `retrato.ts`, que lo lee de la constante del ' +
      'módulo. Barrerlo mediría medio cambio, así que no se barre hasta que sea uno solo.',
    entero: true,
  },
  chispa: { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  contagio: { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  desaliento: { minimo: 0, maximo: 1, distribucion: { forma: 'uniforme' }, razon: ACOTADA_POR_EL_MOTOR, entero: false },
  grado: {
    minimo: 0,
    maximo: 50,
    distribucion: { forma: 'uniforme' },
    razon:
      'Vínculos por persona. 0 es una población que no se mira y 50 es un pueblo entero: arriba ' +
      'de eso la vecindad deja de ser vecindad y el costo deja de ser O(N · grado).',
    entero: true,
  },
};

export type ModoDeCorrida = 'forma' | 'gente';

/**
 * Qué lee cada modo, hoy, de verdad.
 *
 * No es documentación: es lo que hace que el tornado diga «no está enchufada»
 * en vez de dibujar una barra en cero. `cumplimiento` no está acá para el modo
 * forma porque ese modo no tiene señales que cierren — es la palanca que hace
 * algo por primera vez en el modo gente.
 */
export function conectadaEn(clave: ClaveVariable, modo: ModoDeCorrida): boolean {
  const clase = CLASE_DE_VARIABLE[clave];
  if (clave === 'PERIODOS_POR_ANIO') return false;
  if (modo === 'forma') {
    if (clase === 'mecanismo') return false;
    return clave !== 'cumplimiento';
  }
  // El modo gente PRODUCE la forma en vez de declararla.
  return clase !== 'forma';
}

export function razonDeNoConectada(clave: ClaveVariable, modo: ModoDeCorrida): string {
  if (clave === 'PERIODOS_POR_ANIO') return DOMINIOS.PERIODOS_POR_ANIO.razon;
  const clase = CLASE_DE_VARIABLE[clave];
  if (modo === 'forma') {
    if (clase === 'mecanismo') {
      return 'Es del mecanismo: el modo forma no tiene interacción, así que no hay dónde ponerla.';
    }
    return 'El modo forma no modela señales que cierren: `cumplimiento` recién hace algo en el modo gente.';
  }
  if (clase === 'forma') {
    return 'En el modo gente la forma es SALIDA, no entrada: se mide sobre la cosecha con `medirForma`.';
  }
  return 'No conectada.';
}

// ---------------------------------------------------------------------------
// Leer y escribir una variable sobre un escenario, sin mutarlo
// ---------------------------------------------------------------------------

const CLASE_DE_COMPOSICION = new Map(
  CLASES_SENAL.map((c) => [`composicion.${c}`, c]),
);

export function leerVariable(esc: Escenario, clave: ClaveVariable): number | null {
  const deComposicion = CLASE_DE_COMPOSICION.get(clave);
  if (deComposicion !== undefined) return esc.forma.composicion[deComposicion];

  switch (CLASE_DE_VARIABLE[clave]) {
    case 'forma':
      return esc.forma[clave as 'participacion' | 'dispersion' | 'constancia'];
    case 'ajuste':
      return esc.ajustes[clave as CampoDeAjuste];
    case 'coeficiente':
      return esc.coeficientes[clave as CampoDeCoeficiente];
    case 'mecanismo':
      return esc.mecanismo === null ? null : esc.mecanismo[clave as CampoDeMecanismo];
  }
}

/**
 * Un escenario nuevo con una variable movida. Nunca muta el original: un
 * barrido que mutara su escenario base convertiría el orden de las corridas en
 * parte del resultado, que es el bug de OASIS con otro disfraz.
 */
export function conVariable(esc: Escenario, clave: ClaveVariable, valor: number): Escenario {
  const dominio = DOMINIOS[clave];
  const acotado = Math.min(dominio.maximo, Math.max(dominio.minimo, valor));
  const v = dominio.entero ? Math.round(acotado) : acotado;

  const deComposicion = CLASE_DE_COMPOSICION.get(clave);
  if (deComposicion !== undefined) {
    const composicion = { ...esc.forma.composicion, [deComposicion]: v };
    return { ...esc, forma: { ...esc.forma, composicion: normalizarComposicion(composicion) } };
  }

  switch (CLASE_DE_VARIABLE[clave]) {
    case 'forma':
      return { ...esc, forma: { ...esc.forma, [clave]: v } };
    case 'ajuste':
      return { ...esc, ajustes: { ...esc.ajustes, [clave]: v } };
    case 'coeficiente':
      return { ...esc, coeficientes: { ...esc.coeficientes, [clave]: v } };
    case 'mecanismo':
      if (esc.mecanismo === null) return esc;
      return { ...esc, mecanismo: { ...esc.mecanismo, [clave]: v } };
  }
}

export function conVariables(
  esc: Escenario,
  valores: ReadonlyMap<ClaveVariable, number>,
): Escenario {
  let salida = esc;
  // En orden canónico de clave: dos barridos que muevan las mismas variables
  // en distinto orden tienen que dar el mismo escenario, y la composición se
  // renormaliza en cada paso.
  for (const clave of CLAVES_VARIABLE) {
    const valor = valores.get(clave);
    if (valor !== undefined) salida = conVariable(salida, clave, valor);
  }
  return salida;
}

/**
 * De un número uniforme en [0, 1) al valor de la variable, según su distribución.
 *
 * La lognormal se centra en su mediana declarada y se acota al dominio: es lo
 * que evita que una uniforme sobre `participacion` tire la mitad de las
 * muestras arriba del punto donde el resultado ya saturó.
 */
/**
 * La inversa de la normal estándar (Acklam), con error < 1e-9 en el centro.
 *
 * Se escribe acá y no se importa: `civic-core` no tiene dependencias, y la
 * alternativa —una normal por rechazo o por Box-Muller— no es monótona y
 * arruinaría el hipercubo latino sin dar ningún error.
 */
export function probit(p: number): number {
  const pp = Math.min(1 - 1e-12, Math.max(1e-12, p));
  const a = [-39.696830286653757, 220.9460984245205, -275.92851044696869, 138.357751867269,
    -30.66479806614716, 2.5066282774592392];
  const b = [-54.476098798224058, 161.58583685804089, -155.69897985988661, 66.80131188771972,
    -13.280681552885721];
  const c = [-0.0077848940024302926, -0.32239645804113648, -2.4007582771618381, -2.5497325393437338,
    4.3746641414649678, 2.938163982698783];
  const d = [0.0077846957090414622, 0.32246712907003983, 2.445134137142996, 3.7544086619074162];
  const bajo = 0.02425;

  const at = (xs: readonly number[], i: number): number => xs[i] ?? 0;

  if (pp < bajo || pp > 1 - bajo) {
    const cola = pp < bajo ? pp : 1 - pp;
    const q = Math.sqrt(-2 * Math.log(cola));
    const valor =
      (((((at(c, 0) * q + at(c, 1)) * q + at(c, 2)) * q + at(c, 3)) * q + at(c, 4)) * q + at(c, 5)) /
      ((((at(d, 0) * q + at(d, 1)) * q + at(d, 2)) * q + at(d, 3)) * q + 1);
    /**
     * La rama de la cola baja ya devuelve un valor NEGATIVO: los coeficientes
     * de Acklam están escritos así. Negarla acá —el error fácil, y el que un
     * test de monotonía cazó— invierte la función entera y hace que el
     * muestreo empiece por el tope del dominio y termine en el piso.
     */
    return pp < bajo ? valor : -valor;
  }

  const q = pp - 0.5;
  const r = q * q;
  return (
    ((((((at(a, 0) * r + at(a, 1)) * r + at(a, 2)) * r + at(a, 3)) * r + at(a, 4)) * r + at(a, 5)) * q) /
    (((((at(b, 0) * r + at(b, 1)) * r + at(b, 2)) * r + at(b, 3)) * r + at(b, 4)) * r + 1)
  );
}

export function muestrear(dominio: Dominio, u: number): number {
  const uu = Math.min(1 - 1e-12, Math.max(0, u));
  const { minimo, maximo, distribucion } = dominio;

  const crudo = ((): number => {
    switch (distribucion.forma) {
      case 'uniforme':
        return minimo + uu * (maximo - minimo);
      case 'triangular': {
        const c = (distribucion.modo - minimo) / (maximo - minimo || 1);
        return uu < c
          ? minimo + Math.sqrt(uu * c) * (maximo - minimo)
          : maximo - Math.sqrt((1 - uu) * (1 - c)) * (maximo - minimo);
      }
      case 'lognormal':
        // Por la INVERSA de la normal y no por Box-Muller: la inversa es
        // monótona en `u`, y eso es lo que hace que un hipercubo latino siga
        // siendo un hipercubo latino. Box-Muller necesita dos uniformes y
        // rompe la estratificación de la que depende el muestreo.
        return distribucion.mediana * Math.exp(distribucion.sigma * probit(uu));
      case 'discreta': {
        const valores = distribucion.valores;
        if (valores.length === 0) return minimo;
        const i = Math.min(valores.length - 1, Math.floor(uu * valores.length));
        return valores[i] ?? minimo;
      }
    }
  })();

  const acotado = Math.min(maximo, Math.max(minimo, crudo));
  return dominio.entero ? Math.round(acotado) : acotado;
}
