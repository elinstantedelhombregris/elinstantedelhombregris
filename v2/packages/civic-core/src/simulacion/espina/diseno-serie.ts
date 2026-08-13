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
 */

import { CLASES_SENAL } from '../../senal/vocabulario.js';

import { OBJETIVOS } from './corrida.js';
import { MOTOR } from './escenario.js';
import { CLAVES_VARIABLE, conVariables, DOMINIOS } from './variables.js';

import type { Diseno, Metodo } from './barrer.js';
import type { Objetivo } from './corrida.js';
import type { Escenario } from './escenario.js';
import type { ClaveVariable, ModoDeCorrida } from './variables.js';

export interface DisenoSerializado {
  readonly version: 1;
  readonly motor: string;
  readonly escenarioId: string;
  readonly nombre: string;
  readonly pregunta: string;
  readonly paisHuella: string;
  readonly poblacionHuella: string | null;
  readonly semilla: number;
  readonly modo: ModoDeCorrida;
  readonly objetivo: Objetivo;
  readonly claves: readonly ClaveVariable[];
  readonly metodo: Metodo;
  readonly variables: Readonly<Record<string, number>>;
}

export function serializarDiseno(diseno: Diseno): DisenoSerializado {
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
    version: 1,
    motor: esc.motor,
    escenarioId: esc.id,
    nombre: esc.nombre,
    pregunta: esc.pregunta,
    paisHuella: esc.paisHuella,
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

  const paisHuella = textoDe(crudo.paisHuella, base.base.paisHuella);
  if (paisHuella !== base.base.paisHuella) {
    avisos.push(
      'El diseño se armó contra otro país. Se conservan las variables, pero la comparación con ' +
        'lo que veas acá no es contra el mismo dato.',
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
    paisHuella,
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
