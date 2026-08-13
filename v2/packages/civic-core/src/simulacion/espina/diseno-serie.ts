/**
 * El diseño, ida y vuelta — spec §3.6 y §8.7.
 *
 * El estado citable vive en el hash de la URL y en un `.json` que se baja: el
 * módulo **no guarda escenarios en el servidor**. Por eso hace falta poder
 * escribir un diseño entero —semilla, variables, versión del motor y huellas— y
 * volver a leerlo sin confiar en nada.
 *
 * La disciplina de lectura es la de `area-url.ts`, que ya la resolvió una vez:
 * **parsear defensivo y devolver el default ante basura, nunca romper la
 * página**. Un link viejo, truncado por un cliente de mail o editado a mano no
 * puede dejar a alguien mirando una pantalla en blanco; tiene que abrir el
 * diseño por defecto y decir qué no entendió.
 *
 * ---
 *
 * **El reloj viaja, y ésa es la decisión que hace que un link sirva.**
 *
 * `Pais` tiene tres ingredientes: los territorios, las voces y `ahora`. Los
 * territorios son dato del proyecto (`PROVINCIAS_REF`, en el código); las voces
 * salen de la base. **`ahora` es el único que la página inventa**, y entra en
 * `huellaDePais` porque mueve números —§1.5 lo midió: un milisegundo alcanza
 * para voltear el mandato de un territorio cuando una voz cae cerca del borde
 * de un período—. Un diseño que no lo escribe no se puede volver a abrir contra
 * su país: cada carga inventa un reloj nuevo, la huella no coincide con la que
 * el link declara, y `verificarPais` tira. Por eso `paisAhora` está en el
 * formato citable, al lado de la semilla: **las dos son identidad de la
 * corrida, no perillas**.
 *
 * Las otras dos salidas se descartaron, y conviene decir por qué:
 *
 * - **Sacar `ahora` de la huella** haría que dos cargas coincidieran hoy —con
 *   el lado medido vacío `ahora` no mueve ningún número— y que dejaran de
 *   coincidir el día que la base tenga voces, en silencio: dos corridas con la
 *   misma huella y distintos números. La huella existe para que una diferencia
 *   tenga causa nombrable; una huella que omite una entrada que mueve números
 *   convierte una falla ruidosa en dos gráficos que no se parecen.
 * - **Cuantizar `ahora`** al día o a la hora sólo corre la rotura al borde del
 *   cuanto —recargar a las 23:59:59,9 y a las 00:00:00,1 siguen siendo dos
 *   países— y hace que un link caduque. Para una guarda, fallar a veces es peor
 *   que fallar siempre: nadie la arregla y nadie le cree.
 *
 * Lo que se paga: **un link congela su país en el instante en que se armó**. Es
 * lo que se quiere de un diseño citable, y es la razón por la que la pantalla
 * muestra la fecha de ese reloj en vez de esconderla. El día que el lado medido
 * deje de estar vacío, el mismo reloj con más voces va a dar otra huella y el
 * lector lo va a decir con todas las letras: el diseño es el mismo, el dato no.
 */

import { CLASES_SENAL } from '../../senal/vocabulario.js';

import { OBJETIVOS } from './corrida.js';
import { MOTOR } from './escenario.js';
import { CLAVES_VARIABLE, conVariables, DOMINIOS } from './variables.js';

import type { Diseno, Metodo } from './barrer.js';
import type { Objetivo } from './corrida.js';
import type { Escenario, Pais } from './escenario.js';
import type { ClaveVariable, ModoDeCorrida } from './variables.js';

/**
 * La versión del formato citable.
 *
 * Sube a 2 con `paisAhora`. Un link de la versión 1 no lleva el reloj de su
 * país, así que se abre contra el país de ahora y no contra el suyo: el lector
 * lo dice con esas palabras, porque si no la única señal sería un «se armó
 * contra otro país» que parece hablar de los datos cuando habla del reloj.
 */
export const VERSION_DISENO = 2;

export interface DisenoSerializado {
  readonly version: number;
  readonly motor: string;
  readonly escenarioId: string;
  readonly nombre: string;
  readonly pregunta: string;
  readonly paisHuella: string;
  /** EL RELOJ CONGELADO del país. Sin esto un link no se puede volver a abrir. */
  readonly paisAhora: number;
  readonly poblacionHuella: string | null;
  readonly semilla: number;
  readonly modo: ModoDeCorrida;
  readonly objetivo: Objetivo;
  readonly claves: readonly ClaveVariable[];
  readonly metodo: Metodo;
  readonly variables: Readonly<Record<string, number>>;
}

/**
 * Escribe el diseño entero, con el país contra el que se armó.
 *
 * **El `Pais` es parámetro y no se lee del escenario a propósito.** La huella y
 * el reloj son las dos mitades de una misma identidad, y sacarlas de un solo
 * objeto hace que un diseño que declare la huella de un país y el reloj de otro
 * sea irrepresentable. Que serializar exija el país es además la afirmación
 * correcta: un diseño sin su país no es citable.
 */
export function serializarDiseno(diseno: Diseno, pais: Pais): DisenoSerializado {
  const esc = diseno.base;
  const variables: Record<string, number> = {
    participacion: esc.forma.participacion,
    dispersion: esc.forma.dispersion,
    constancia: esc.forma.constancia,
    horizonte: esc.ajustes.horizonte,
    resistencia: esc.ajustes.resistencia,
    cumplimiento: esc.ajustes.cumplimiento,
    PISO_MANDATO: esc.coeficientes.PISO_MANDATO,
    K_RESISTENCIA: esc.coeficientes.K_RESISTENCIA,
    MINIMO_PERIODOS: esc.coeficientes.MINIMO_PERIODOS,
    PERIODOS_POR_ANIO: esc.coeficientes.PERIODOS_POR_ANIO,
  };
  for (const clase of CLASES_SENAL) {
    variables[`composicion.${clase}`] = esc.forma.composicion[clase];
  }
  if (esc.mecanismo !== null) {
    variables.chispa = esc.mecanismo.chispa;
    variables.contagio = esc.mecanismo.contagio;
    variables.desaliento = esc.mecanismo.desaliento;
    variables.grado = esc.mecanismo.grado;
  }

  return {
    version: VERSION_DISENO,
    motor: esc.motor,
    escenarioId: esc.id,
    nombre: esc.nombre,
    pregunta: esc.pregunta,
    paisHuella: pais.huella,
    paisAhora: pais.ahora,
    poblacionHuella: esc.mecanismo?.poblacionHuella ?? null,
    semilla: esc.semilla,
    modo: diseno.modo,
    objetivo: diseno.objetivo,
    claves: diseno.claves,
    metodo: diseno.metodo,
    variables,
  };
}

/**
 * Lo que salió mal al leer, con el default ya aplicado.
 *
 * No es un `throw` ni un `null`: la pantalla tiene que abrir igual, y tiene que
 * poder decir «este link venía con la semilla rota, la reemplacé por la de
 * fábrica» en vez de fingir que todo estaba bien.
 */
export interface LecturaDeDiseno {
  readonly diseno: Diseno;
  readonly avisos: readonly string[];
}

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const numeroDe = (v: unknown, siNo: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : siNo;

const textoDe = (v: unknown, siNo: string): string => (typeof v === 'string' ? v : siNo);

/**
 * El reloj del país que trae un diseño crudo, o `null` si no trae ninguno.
 *
 * Se lee **antes** que el diseño entero y por separado, porque el país hay que
 * armarlo primero: `leerDiseno` necesita un `base: Diseno` que ya está atado a
 * un `Pais`, y ese país no se puede construir sin el reloj. Invertir ese orden
 * es todo el arreglo.
 *
 * `null` y no `0`: cero es un instante válido —el 1 de enero de 1970— y usarlo
 * para decir «no sé» pondría a la herramienta a calcular períodos contra medio
 * siglo de distancia sin que nadie se entere. Un reloj que no es un entero
 * seguro y positivo no es un reloj.
 */
export function relojDeDiseno(crudo: unknown): number | null {
  if (!esObjeto(crudo)) return null;
  const valor: unknown = crudo.paisAhora;
  if (typeof valor !== 'number' || !Number.isSafeInteger(valor) || valor <= 0) return null;
  return valor;
}

/**
 * Lee un diseño de algo que vino de afuera. `base` es el diseño por defecto:
 * todo lo que no se entienda cae ahí y queda anotado en `avisos`.
 */
export function leerDiseno(crudo: unknown, base: Diseno): LecturaDeDiseno {
  const avisos: string[] = [];
  if (!esObjeto(crudo)) {
    return { diseno: base, avisos: ['No es un objeto: se abrió el diseño por defecto.'] };
  }

  if (crudo.motor !== undefined && crudo.motor !== MOTOR) {
    avisos.push(
      `El diseño se guardó con el motor ${textoDe(crudo.motor, '(sin nombre)')} y este motor es ` +
        `${MOTOR}. Los números pueden no coincidir con los que vio quien lo compartió.`,
    );
  }

  if (relojDeDiseno(crudo) === null) {
    avisos.push(
      'El link no trae el reloj de su país —es de un formato anterior—, así que se abrió contra ' +
        'el país de ahora. Las palancas son las que se compartieron; el país, no necesariamente.',
    );
  }

  /**
   * **La huella que queda es la de acá, no la del link.**
   *
   * Adoptar la ajena era lo que mataba la herramienta. `Escenario.paisHuella`
   * dice contra qué país se **corre** —es lo que `verificarPais` compara antes
   * de la primera corrida—, no de dónde vino el diseño; un escenario que
   * declara un país que no tiene delante hace tirar a `correr()`, y como el
   * hash se reescribe con lo leído, el link quedaba roto hasta que alguien
   * borrara el `#` a mano.
   *
   * La procedencia no se pierde: sale por `avisos`, que es donde una persona la
   * lee. Y la guarda no se ablanda: sigue cazando lo suyo, que es un escenario
   * armado contra un país y corrido contra otro dentro del mismo programa.
   */
  const huellaAjena = textoDe(crudo.paisHuella, base.base.paisHuella);
  if (huellaAjena !== base.base.paisHuella) {
    avisos.push(
      `El diseño se armó contra otro país (${huellaAjena}) y se está corriendo contra el de acá ` +
        `(${base.base.paisHuella}). Se conservan las palancas, la semilla y la pregunta; la ` +
        'comparación con lo que veas no es contra el mismo dato.',
    );
  }

  const variables = esObjeto(crudo.variables) ? crudo.variables : {};

  const claves: ClaveVariable[] = [];
  if (Array.isArray(crudo.claves)) {
    for (const c of crudo.claves) {
      const encontrada = CLAVES_VARIABLE.find((k) => k === c);
      if (encontrada === undefined) avisos.push(`Variable desconocida, ignorada: ${String(c)}.`);
      else claves.push(encontrada);
    }
  }

  /**
   * Los valores se aplican con `conVariable`, que acota a cada dominio
   * declarado y renormaliza la composición. Un link con `participacion: 1e12`
   * no puede dejar la herramienta calculando un país que el modelo no
   * describe, y lo que se acotó se dice.
   */
  const valores = new Map<ClaveVariable, number>();
  for (const clave of CLAVES_VARIABLE) {
    const crudoValor: unknown = variables[clave];
    if (typeof crudoValor !== 'number' || !Number.isFinite(crudoValor)) continue;
    const dominio = DOMINIOS[clave];
    if (crudoValor < dominio.minimo || crudoValor > dominio.maximo) {
      avisos.push(
        `«${clave}» venía en ${String(crudoValor)}, fuera de su dominio declarado ` +
          `[${String(dominio.minimo)}, ${String(dominio.maximo)}]: se acotó.`,
      );
    }
    valores.set(clave, crudoValor);
  }

  const identidad: Escenario = {
    ...base.base,
    id: textoDe(crudo.escenarioId, base.base.id),
    nombre: textoDe(crudo.nombre, base.base.nombre),
    pregunta: textoDe(crudo.pregunta, base.base.pregunta),
    paisHuella: base.base.paisHuella,
    semilla: Math.trunc(numeroDe(crudo.semilla, base.base.semilla)),
  };
  const escenario = conVariables(identidad, valores);

  return {
    diseno: {
      base: escenario,
      modo: crudo.modo === 'gente' ? 'gente' : 'forma',
      claves: claves.length > 0 ? claves : base.claves,
      objetivo: OBJETIVOS.find((o) => o === crudo.objetivo) ?? base.objetivo,
      metodo: leerMetodo(crudo.metodo, base.metodo, avisos),
    },
    avisos,
  };
}

function leerMetodo(crudo: unknown, base: Metodo, avisos: string[]): Metodo {
  if (!esObjeto(crudo)) return base;
  switch (crudo.tipo) {
    case 'unaPorVez':
      return { tipo: 'unaPorVez', pasos: Math.max(2, Math.round(numeroDe(crudo.pasos, 9))) };
    case 'hipercubo':
      return { tipo: 'hipercubo', muestras: Math.max(1, Math.round(numeroDe(crudo.muestras, 500))) };
    case 'umbral':
      return {
        tipo: 'umbral',
        territorios: Array.isArray(crudo.territorios)
          ? crudo.territorios.filter((t): t is string => typeof t === 'string')
          : [],
      };
    default:
      avisos.push('Método desconocido: se usó el del diseño por defecto.');
      return base;
  }
}
