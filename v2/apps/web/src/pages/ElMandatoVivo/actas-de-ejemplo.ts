import type { ClaseSenal } from '@v2/civic-core';

/**
 * Las cinco actas de mandato de ejemplo — texto, no instrumento.
 *
 * Enmienda: `docs/specs/2026-08-20-enmienda-los-ejemplos-ii-las-actas.md` §2.
 *
 * Escritas a mano el 20/8 para el demo de `docs/demos/`, pasadas por revisión
 * adversarial (tres lentes con refutadores) y movidas acá con las
 * correcciones de canon adentro:
 *
 *  - el reloj de un compromiso vencido marca **desenlace `vencido` y señal
 *    `desactualizada`** — no manda a revisión, y `no cumplida` sólo lo puede
 *    decir una persona (D-074);
 *  - el piso del mandato se evalúa **por territorio**, nunca por celda;
 *  - los conteos son de **personas distintas**, jamás de filas.
 *
 * Números inventados y declarados. Ninguna de estas actas tiene una fila en
 * ninguna tabla (E1–E4 de la enmienda). Este archivo es contenido: no importa
 * nada que toque red, base ni estado.
 */

export interface ActaDeEjemplo {
  readonly id: string;
  /** «Mandato de reparación», «de agenda»… El tipo que la clase habilita. */
  readonly tipoDeMandato: string;
  /** La clase del canon de la que nace. Pinta el borde vía `colorDeClase`. */
  readonly clase: ClaseSenal;
  /** «nace de hechos corroborados», «nace de una pregunta sin respuesta»… */
  readonly nace: string;
  readonly titulo: string;
  readonly lugar: string;
  readonly respaldo: string;
  readonly exigencia: string;
  readonly comprobacion: string;
  /** La lectura del diseño idealizado: qué PLAN contesta esto. */
  readonly planes: string;
}

export const ACTAS_DE_EJEMPLO: readonly ActaDeEjemplo[] = [
  {
    id: 'reparacion',
    tipoDeMandato: 'Mandato de reparación',
    clase: 'hecho',
    nace: 'nace de hechos corroborados',
    titulo: 'El agua de red vuelve a las últimas tres cuadras',
    lugar: 'Barrio La Ribera · Resistencia, Chaco',
    respaldo:
      '214 señales de 163 personas distintas (9 sin actor, contadas aparte) · 61% corroborado en la puerta · sostenido 5 meses. Quién falta, dicho acá y no en un pie: la zona rural del distrito está muda, y este mandato no habla por ella.',
    exigencia:
      'La prestadora restituye la presión de red en las cuadras relevadas dentro de los 45 días corridos desde la publicación del acta.',
    comprobacion:
      'Tres vecinos distintos confirman «ya no está» sobre la señal madre. La celda sube de nitidez y el acta pasa a resuelta.',
    planes: 'PLANAGUA · PLANTER',
  },
  {
    id: 'provision',
    tipoDeMandato: 'Mandato de provisión',
    clase: 'hecho',
    nace: 'nace de necesidades corroboradas',
    titulo: 'Pediatra después de las 14 en la salita',
    lugar: 'Villa Los Tarcos · San Miguel de Tucumán',
    respaldo:
      '187 señales de 141 personas distintas · el horario real de atención, verificado en la puerta 11 veces en 4 semanas · sostenido 6 meses.',
    exigencia:
      'La provincia cubre el cargo vespertino dentro de los 90 días. Una necesidad se corrobora yendo a mirar la ausencia — y acá la ausencia tiene horario, fecha y puerta cerrada.',
    comprobacion:
      'El horario publicado contra el horario comprobado, salita por salita.',
    planes: 'PLANSAL · PLANCUIDADO',
  },
  {
    id: 'agenda',
    tipoDeMandato: 'Mandato de agenda',
    clase: 'deseo',
    nace: 'nace de deseos convergentes',
    titulo: 'La tecnicatura se discute en Oberá, con la gente adentro',
    lugar: 'Oberá · Misiones',
    respaldo:
      '96 sueños y propuestas de 88 personas distintas que dicen casi lo mismo: estudiar no puede ser sinónimo de mudarse. Esto no afirma una verdad — converger no es corroborar —: registra una dirección querida, que es todo lo que un deseo puede dar y no es poco.',
    exigencia:
      'Municipio y provincia abren la mesa dentro de los 90 días y responden por escrito en el registro público. La respuesta puede ser «no», con razones: lo que no puede ser es silencio.',
    comprobacion: 'La respuesta existe y está fechada, o no existe.',
    planes: 'PLANEDU · PLANARCO',
  },
  {
    id: 'cumplimiento',
    tipoDeMandato: 'Mandato de cumplimiento',
    clase: 'acto',
    nace: 'nace de un compromiso con fecha',
    titulo: 'El acceso a Colonia Barón, antes de las lluvias',
    lugar: 'Colonia Barón · La Pampa',
    respaldo:
      'La cooperativa vial lo prometió con fecha; 52 personas distintas adhirieron y el estado de la obra se confirma cada semana.',
    exigencia:
      'La que el propio compromiso declaró — terminar antes del 15 de octubre. El registro no agrega nada: recuerda.',
    comprobacion:
      'Al vencer la fecha, el reloj lo marca solo: el desenlace pasa a vencido y la señal a desactualizada. No cumplida sólo lo puede decir una persona que fue a mirar — un proceso automático no acusa a nadie.',
    planes: 'PLANMOV · PLANTER',
  },
  {
    id: 'informacion',
    tipoDeMandato: 'Mandato de información',
    clase: 'meta',
    nace: 'nace de una pregunta sin respuesta',
    titulo: '¿Cuánto de la regalía queda donde se saca?',
    lugar: 'Añelo y alrededores · Neuquén',
    respaldo:
      '74 personas distintas hicieron la misma pregunta, con variantes que un lector junta solo. Nadie pide una opinión: piden un número con fuente.',
    exigencia:
      'El dato se publica, con fuente y período, dentro de los 60 días. La agenda territorial de lo que no se sabe es el mandato más barato de conceder — y el que más cuesta seguir negando.',
    comprobacion:
      'La respuesta entra al registro como un saber con fuente, se corrobora como cualquier hecho, y la pregunta pasa a resuelta.',
    planes: 'PLANREP · PLAN24CN',
  },
];

/** La advertencia del sello, en el mismo registro que la de la Simulación. */
export const ADVERTENCIA_DE_LAS_ACTAS =
  'Las cinco actas de esta página las escribió una persona a mano para mostrar en qué termina el circuito: qué tipo de exigencia habilita cada clase de señal. Los barrios, los respaldos y los plazos son inventados; las provincias son reales porque la lección necesita un mapa cierto. Ningún número de acá existe en ninguna tabla, y el mandato de verdad — el documento que lee lo que la gente carga — vive en la otra pantalla.';
