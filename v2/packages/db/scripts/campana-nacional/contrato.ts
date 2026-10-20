/**
 * El contrato de la campaña nacional permanente «Mi Argentina ideal».
 *
 * Todo lo de acá es puro: no abre una conexión, no lee el entorno y no mira el
 * reloj. La fecha de hoy entra por parámetro, así el contrato se puede afirmar
 * en un test sin base (`src/__tests__/seed-campana-nacional.test.ts`) y el
 * script de siembra (`../seed-campana-nacional.ts`) es lo único que sabe qué
 * día es.
 *
 * Decisiones del 9/10/2026 (`docs/analisis/2026-10-09-pulido-argentina-ideal/README.md`):
 * responde Juan Bravin; la primera edición recibe aportes hasta el 28/2/2027,
 * se lee del 1 al 14 de marzo y la primera devolución sale el 15/3/2027;
 * después hay una edición y una devolución por trimestre.
 *
 * **Una sola pregunta** (D-134): la de las reglas es `PREGUNTA_MI_ARGENTINA_IDEAL`,
 * la misma de la portada, de Imaginar y de Mirar, y el propósito la cita igual.
 * La siembra de producción todavía no corrió (D-121), así que cambiarla ahora
 * no abre una edición nueva.
 *
 * **Una fase tiene una sola fecha** (`faseCampanaSchema`): la del día en que
 * entrega su salida. Por eso la fecha de cierre va en `fecha` y el rango
 * completo va escrito en `salida`, que es lo que la página muestra al lado.
 */
import {
  PREGUNTA_MI_ARGENTINA_IDEAL,
  SLUG_CAMPANA_NACIONAL,
  contratoCampanaSchema,
} from '@v2/shared';
import { z } from 'zod';

import type { ContratoCampana } from '@v2/shared';

export { SLUG_CAMPANA_NACIONAL };

/**
 * El `id_local` del envío con el que se abre la campaña. Es fijo a propósito:
 * junto con el dueño forma la clave `campanas_envio_unique`, o sea que dos
 * corridas del script no pueden crear dos campañas aunque alguien le cambie el
 * slug a la primera.
 */
export const ID_LOCAL_CAMPANA_NACIONAL = '38c46cd2-da43-4a1f-acbf-ff75af2b56cd';

export const MOTIVO_APERTURA_NACIONAL =
  'Se abrió la campaña nacional permanente, con Juan Bravin como responsable.';

/** El último día de la primera etapa: hasta acá se reciben aportes. */
export const CIERRE_RECEPCION = '2027-02-28';
export const FIN_LECTURA = '2027-03-14';
export const PRIMERA_DEVOLUCION = '2027-03-15';

/**
 * Los temas del contrato: los trece del catálogo cerrado de aportes (`temas`,
 * migraciones 0022 y 0031), en el orden del catálogo. Un contrato admite hasta
 * `MAX_TEMAS` y la campaña nacional los usa todos, así que ningún tema queda
 * afuera: un aporte sin tema, o que no encaja en ninguno, entra igual y el
 * propósito lo dice.
 */
export const TEMAS_CAMPANA_NACIONAL = [
  'alimento',
  'vivienda',
  'trabajo',
  'cuidado',
  'salud',
  'educación',
  'ambiente',
  'movilidad',
  'seguridad',
  'cultura',
  'democracia',
  'justicia',
  'economía',
] as const;

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/** `2027-03-15` → `15 de marzo de 2027`. A mano, para no depender de los datos de idioma del motor. */
export function fechaLarga(dia: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  const mes = m ? MESES[Number(m[2]) - 1] : undefined;
  if (!m || !mes) throw new Error(`«${dia}» no es una fecha AAAA-MM-DD.`);
  return `${String(Number(m[3]))} de ${mes} de ${m[1] ?? ''}`;
}

/** El día de hoy en Buenos Aires, como `AAAA-MM-DD`. El servidor puede estar en otra zona. */
export function hoyEnArgentina(ahora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ahora);
  const dato = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  return `${dato('year')}-${dato('month')}-${dato('day')}`;
}

/**
 * El contrato, ya validado. `hoy` es el día de la siembra (`AAAA-MM-DD`, hora
 * de Buenos Aires): la primera etapa dice desde cuándo recibe aportes.
 */
export function construirContratoNacional(hoy: string): ContratoCampana {
  if (!z.string().date().safeParse(hoy).success) {
    throw new Error(`La fecha de hoy tiene que ser AAAA-MM-DD, y llegó «${hoy}».`);
  }
  if (hoy > CIERRE_RECEPCION) {
    throw new Error(
      `La primera etapa cerró el ${fechaLarga(CIERRE_RECEPCION)}. ` +
        'Hay que actualizar las fechas del contrato antes de sembrar.',
    );
  }
  return contratoCampanaSchema.parse({
    titulo: 'Mi Argentina ideal',
    pregunta: PREGUNTA_MI_ARGENTINA_IDEAL,
    proposito: [
      'Esta campaña nacional y permanente de ¡BASTA! recibe cualquier aporte que se publica sin elegir otra campaña, y por eso hay una persona que responde por todos ellos.',
      `Cada aporte contesta una sola pregunta: «${PREGUNTA_MI_ARGENTINA_IDEAL}». Puede ser sobre tu trabajo, tu barrio o el cuidado de los tuyos. Juntos, los aportes muestran dónde coinciden las personas y dónde piensan distinto.`,
      'Con esa lectura se arman fichas de diseño: descripciones de una vida deseada y de las condiciones que la harían posible, abiertas a que otras personas las discutan y las pongan a prueba. Los temas de la lista ordenan la lectura. Un aporte sin tema, o que no encaja en ninguno, también se recibe y se lee.',
    ].join('\n\n'),
    territorios: [],
    temas: [...TEMAS_CAMPANA_NACIONAL],
    participantes:
      'Cualquier persona que viva en la Argentina o tenga su vida ligada al país, de cualquier edad y de cualquier lugar. La campaña necesita en particular a quienes casi nunca opinan sobre cómo debería funcionar el país: quienes viven lejos de las grandes ciudades y quienes casi no tienen tiempo para participar.',
    canales: ['web'],
    responsable: 'Juan Bravin',
    devolucion: `La devolución es una lectura pública y escrita de lo que se recibió. Cuenta qué se escuchó, ordenado por tema y por lugar. Después dice cuáles son los límites de esa lectura: cuenta aportes y no personas, y que varios aportes digan lo mismo no prueba nada por sí solo. Por último indica con qué fichas de la campaña y con qué PLANes de ¡BASTA! se relaciona. No promete resultados ni compromete al Estado, y nunca publica los nombres de quienes aportaron. La primera devolución se publica el ${fechaLarga(PRIMERA_DEVOLUCION)}. Después de esa fecha la campaña sigue abierta: cada tres meses se abre una edición nueva y se publica una devolución nueva.`,
    fechaDevolucion: PRIMERA_DEVOLUCION,
    efecto:
      'Esta campaña es un ejercicio de diseño idealizado: muestra hacia dónde podría apuntar el país si funcionara como las personas lo imaginan. Ningún aporte compromete al Estado ni a ninguna institución, y la devolución no promete resultados. Lo que queda de cada edición es una lectura pública de lo recibido y, cuando hay base suficiente, fichas de diseño abiertas a la discusión y a la prueba.',
    usoDatos: [
      'Los aportes que se publican en esta campaña son públicos. Cada persona decide si cede o no la licencia de su texto, y esa decisión se respeta: sin cesión, el texto no sale en la descarga pública de datos.',
      'Los aportes se usan para leer lo que la campaña recibió por tema y por lugar, y para armar las fichas y las devoluciones. Las devoluciones no publican los nombres de quienes aportaron. Cada persona puede retirar su aporte cuando quiera, desde la cuenta o el navegador con el que lo publicó, y un aporte retirado deja de contarse. Corregirlo es posible mientras no tenga apoyos de otras personas.',
    ].join('\n\n'),
    metodoLectura: [
      'La devolución la escribe y la firma quien responde por la campaña. Antes de escribirla se agrupan los aportes por tema y por lugar, y se cuentan aportes, no personas: una misma persona puede haber hecho varios, y muchas personas no hicieron ninguno.',
      'Se separan los puntos en que los aportes coinciden de aquellos en que difieren, y se anota qué lugares y qué temas casi no aparecen, porque esas ausencias también limitan lo que se puede decir. Que varios aportes coincidan no se toma como prueba de nada.',
      'La devolución lista los aportes en los que se apoya, de modo que cualquiera pueda leerlos. Si alguien encuentra que una lectura quedó mal, se corrige en la edición siguiente y se deja constancia de qué cambió.',
    ].join('\n\n'),
    fases: [
      {
        nombre: 'Recibe aportes',
        salida: `Queda reunido el conjunto de aportes de la primera edición. Se reciben aportes desde el ${fechaLarga(hoy)} hasta el ${fechaLarga(CIERRE_RECEPCION)}.`,
        fecha: CIERRE_RECEPCION,
      },
      {
        nombre: 'Lectura',
        salida: `Se leen los aportes de la primera edición y queda escrita la devolución. La lectura va del 1 al 14 de marzo de 2027.`,
        fecha: FIN_LECTURA,
      },
    ],
  });
}
