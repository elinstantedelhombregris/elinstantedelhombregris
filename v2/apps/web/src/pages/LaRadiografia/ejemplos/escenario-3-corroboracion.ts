import type { IdDeVoz } from './padron';
import type { Corroboracion } from './tipos';

/**
 * Escenario 3 · qué pasó cuando alguien fue a mirar.
 *
 * Vive aparte del texto porque **es otra máquina**. Lo que se dijo es una cosa;
 * lo que pasó cuando un tercero fue a la dirección es otra, la corre gente
 * distinta, y mezclarlas en un mismo objeto invita a leer una confirmación como
 * si fuera parte del enunciado. No lo es: el enunciado lo escribió quien vivió
 * el problema, y esto lo escribieron los que fueron a comprobarlo.
 *
 * `confirmaciones` cuenta **actores distintos**, nunca filas. Dos veces la
 * misma persona es una persona. El umbral que convierte confirmaciones en
 * «corroborada» no está escrito acá: sale de `UMBRAL_CORROBORACION` del canon,
 * que hoy vale 2 y tiene escrito qué lo subiría a 3.
 *
 * `'no corresponde'` es la regla 11 hecha campo: un `sueño` o una `propuesta`
 * no se corroboran nunca —se deliberan—, y una `pregunta` se responde. Ponerles
 * «sin confirmar» los dejaría en la misma fila que un hecho que nadie fue a
 * ver, y sugeriría que algún día alguien podría ir a comprobar un deseo.
 */

const confirmada = (confirmaciones: number, nota: string): Corroboracion => ({
  veredicto: 'confirmada',
  confirmaciones,
  nota,
});

/**
 * Dos señales corroboradas que **se contradicen**, y están así a propósito.
 *
 * `v48` dice que el corte del 7 de abril de 2026 en Alto de la Cruz duró 11
 * horas; `v49` dice que duró 51. Mismo barrio, mismo día, mismo corte. Las dos
 * pasaron por la máquina: tres personas distintas firmaron una, cuatro
 * firmaron la otra, y **las dos figuran confirmadas**.
 *
 * No es un descuido del corpus. Es el límite de corroborar, puesto donde se
 * pueda ver: **corroborar prueba que alguien fue a mirar, no que lo que anotó
 * sea el número correcto.** Dos grupos de vecinos fueron, midieron de buena fe
 * y volvieron con cifras que no se pueden promediar —uno contó desde que se
 * cortó en su cuadra hasta que volvió; el otro, hasta que volvió en todo el
 * barrio— y el registro **no tiene forma de saber cuál vale**. Lo que puede
 * hacer, y hace, es no elegir en silencio: las deja a las dos, con nombre, y
 * lo declara.
 *
 * Lo que un registro **no** debe hacer con esto, y por eso está escrito:
 *
 *  - **no promediarlas.** 31 horas es un número que no dijo nadie.
 *  - **no quedarse con la que tiene más confirmaciones.** Cuatro personas no
 *    hacen verdadero un número; hacen que cuatro personas hayan ido a mirar.
 *  - **no borrar ninguna.** Es la misma regla que sostiene a `v35`, la
 *    desmentida: un corpus que se corrige borrando no es un corpus.
 *
 * Un mandato no se puede apoyar en ninguna de las dos hasta que se dirima, y
 * el de este escenario no se apoya: `MANDATO_DATO` habla del agua, de la
 * salita y del colectivo, y no de este corte.
 */
export interface ContradiccionCorroborada {
  readonly a: IdDeVoz;
  readonly b: IdDeVoz;
  /** Sobre qué no coinciden, en una línea. */
  readonly sobre: string;
  readonly diceA: string;
  readonly diceB: string;
  /** Qué hace el registro con esto. Nunca «elegir la mejor». */
  readonly queHaceElRegistro: string;
}

export const CONTRADICCION_CORROBORADA: ContradiccionCorroborada = {
  a: 'v48',
  b: 'v49',
  sobre: 'cuánto duró el corte de energía del 7 de abril de 2026 en Alto de la Cruz',
  diceA: '11 horas, firmado por tres personas de manzanas distintas',
  diceB: '51 horas, firmado por cuatro personas de la manzana 5',
  queHaceElRegistro:
    'Las deja a las dos, confirmadas y contradiciéndose, y lo dice. No las promedia, no se queda con la que tiene más firmas y no borra ninguna. Corroborar prueba que alguien fue a mirar; no prueba que el número que trajo sea el correcto. Mientras esto no se dirima, ningún mandato se puede apoyar en este corte.',
};

/** Una sola persona fue. Es un par, no una corroboración: no llega al umbral. */
const unaSola = (nota: string): Corroboracion => ({
  veredicto: 'confirmada',
  confirmaciones: 1,
  nota,
});

/** Un deseo, una propuesta o una pregunta. No se corrobora: se delibera. */
const noCorresponde = (nota: string): Corroboracion => ({
  veredicto: 'no corresponde',
  confirmaciones: 0,
  nota,
});

export const CORROBORACIONES_DATO: Readonly<Record<IdDeVoz, Corroboracion>> = {
  // t1 · El Timbó — el agua
  v01: confirmada(3, 'Tres vecinas de otra manzana abrieron la canilla el 14/3, el 2/4 y el 9/8.'),
  v02: confirmada(2, 'Dos personas vieron los bidones y el ticket del almacén, con fecha.'),
  v03: confirmada(
    2,
    'Dos vecinos acompañaron la medición del balde dos lunes distintos y firmaron la planilla.',
  ),
  v04: confirmada(
    2,
    'Dos personas del barrio confirman que el cisterna no volvió después del 18/4.',
  ),
  v05: unaSola('Fue la vecina de al lado. Nadie más se acercó todavía: falta una para el umbral.'),
  v06: noCorresponde('Una propuesta no se comprueba: se discute. Lleva adhesiones, no visitas.'),
  v07: noCorresponde(
    'Un sueño no se corrobora. Se delibera, y la deliberación no está construida.',
  ),
  v08: confirmada(
    4,
    'Cuatro personas distintas verificaron la canilla el 12/8, entre las 9 y las 18.',
  ),
  // t1 · la salita
  v09: confirmada(3, 'Tres personas fueron el 12/8 a las 14:30 y encontraron cerrado.'),
  v10: confirmada(2, 'Dos madres pidieron turno de pediatría el 3/3 y el 6/5 y las derivaron.'),
  v11: confirmada(2, 'Dos vecinas confirmaron el horario en el cartel de la puerta, con foto.'),
  // t1 · la calle
  v12: confirmada(
    3,
    'Tres personas midieron los 400 metros y fotografiaron el barro las tres fechas.',
  ),
  v13: confirmada(2, 'La paciente y una vecina. La ambulancia no dejó constancia escrita.'),
  v14: confirmada(2, 'Dos vecinos midieron las cuadras a pie con la app del registro.'),

  // t2 · Los Tarcos — el CAPS
  v15: confirmada(3, 'Tres personas distintas fueron el 12/8 pasadas las 13:30. Cerrado las tres.'),
  v16: confirmada(
    2,
    'Dos vecinas hicieron la cola de turnos el 12/6 y el 19/6 y se quedaron afuera.',
  ),
  v17: confirmada(2, 'Dos acompañantes distintos estuvieron en dos de las tres visitas.'),
  v18: confirmada(2, 'Dos personas fueron un sábado y un domingo y encontraron cerrado.'),
  v19: unaSola('Fue un solo vecino y le mostraron el botiquín. Falta una para el umbral.'),
  v20: noCorresponde('Un sueño no se corrobora.'),
  // t2 · la luz
  v21: confirmada(3, 'Tres casas de manzanas distintas llevaron la misma planilla de horarios.'),
  v22: confirmada(2, 'Dos vecinos vieron la heladera y el presupuesto del service, con fecha.'),
  v23: unaSola('Un vecino fotografió la chapa del transformador. Falta una segunda persona.'),
  // t2 · el agua
  v24: unaSola('Una sola medición, con manómetro prestado. No alcanza para corroborar.'),
  v25: {
    veredicto: 'no se pudo verificar',
    confirmaciones: 0,
    nota: 'Dos vecinos fueron el 20/6 y el agua salía clara. Puede ser intermitente: el registro no puede afirmarlo ni negarlo, y decir «desmentida» sería tan falso como decir «confirmada».',
  },

  // t3 · Los Ceibos — el colectivo
  v26: confirmada(4, 'Cuatro personas estuvieron en la parada en las cuatro noches registradas.'),
  v27: confirmada(3, 'Tres personas cronometraron la espera los mismos tres martes.'),
  v28: confirmada(2, 'Dos compañeros del mismo turno noche confirman el hueco de horario.'),
  v29: confirmada(2, 'Dos vecinos fueron a la parada dos domingos distintos. No pasó ninguno.'),
  v30: confirmada(
    3,
    'Tres personas midieron los 1,4 km y guardaron el recorrido viejo del cartel.',
  ),
  v31: unaSola(
    'Sólo la madre. Nadie más acompañó todavía el trayecto de la salida del secundario.',
  ),
  v32: noCorresponde('Una pregunta no se corrobora: se responde. Y todavía no la respondió nadie.'),
  // t3 · la basura
  v33: confirmada(3, 'Tres vecinos fotografiaron el terreno el 14/6, el 21/6 y el 3/7.'),
  v34: confirmada(
    2,
    'Dos vecinas registraron el día que no pasó el camión, tres semanas seguidas.',
  ),
  v35: {
    veredicto: 'desmentida',
    confirmaciones: 0,
    nota: 'Dos vecinos fueron el 5 y el 7 de mayo y el terreno estaba limpio. La señal se queda en el registro, desmentida y con nombre: un corpus que se corrige borrando no es un corpus.',
  },
  v36: confirmada(
    2,
    'Dos personas recorrieron las esquinas y confirmaron que no hay contenedores.',
  ),
  // t3 · el alumbrado
  v37: confirmada(3, 'Tres vecinos contaron las columnas apagadas la misma noche, por separado.'),
  v38: confirmada(2, 'Dos personas recorrieron las cuatro cuadras el 15/7 y el 2/8.'),

  // t4 · La Cañada Vieja — la sala de 4
  v39: confirmada(
    3,
    'Tres familias distintas tienen el acta de inscripción del 10/11 con el número.',
  ),
  v40: confirmada(2, 'Dos madres del mismo listado confirman el resultado de la matriculación.'),
  v41: confirmada(2, 'Dos familias registraron el mes sin clases con las notas del cuaderno.'),
  v42: confirmada(2, 'Dos personas cruzaron el listado de inscriptos con el de vacantes.'),
  v43: confirmada(2, 'Dos madres fotografiaron la filtración los dos días de suspensión.'),
  // t4 · el agua
  v44: confirmada(
    2,
    'Dos vecinos midieron la presión con el mismo manómetro en dos meses distintos.',
  ),
  v45: noCorresponde('Un sueño no se corrobora.'),
  // t4 · la calle
  v46: confirmada(3, 'Tres casas de las nueve afectadas registraron la altura del agua con foto.'),
  v47: unaSola(
    'Un vecino aportó la fecha de la última limpieza. Nadie fue a mirar el zanjón todavía.',
  ),

  // t5 · Alto de la Cruz — la luz
  // v48 y v49 se contradicen a propósito: ver `CONTRADICCION_CORROBORADA`.
  v48: confirmada(
    3,
    'Tres casas de manzanas distintas anotaron los mismos tres cortes, y para el del 7 de abril las tres escribieron 11 horas. Otra señal confirmada de este mismo barrio dice 51 para ese mismo corte, y el registro no las desempata.',
  ),
  v49: confirmada(
    4,
    'Cuatro vecinos de la manzana 5 anotaron la hora en que se cortó y la hora en que volvió: 51 horas. Contradice a la señal de al lado, que para ese corte anotó 11. Las dos están confirmadas; ninguna de las dos queda validada por eso.',
  ),
  v50: unaSola('Una sola medición con tester. Falta una segunda persona con instrumento.'),
  v51: confirmada(2, 'Dos vecinos verificaron que la línea sigue siendo la misma que en 2018.'),
  // t5 · el agua
  v52: confirmada(2, 'Dos vecinos vieron el pozo y confirmaron que no hay generador de respaldo.'),
  // t5 · la changa
  v53: confirmada(
    2,
    'Dos personas hicieron el relevamiento casa por casa y firmaron las planillas.',
  ),
  v54: unaSola('Un vecino fue a la oficina y le dijeron que no toman inscripciones. Sin testigo.'),

  // t6 · San Ramón Chico — el camino
  v55: confirmada(3, 'Tres colonos registraron el camino intransitable en las tres fechas.'),
  v56: confirmada(
    2,
    'Dos vecinos empujaron la ambulancia y anotaron la hora de salida y de llegada.',
  ),
  v57: unaSola('Un colono aportó la fecha de la última motoniveladora. Falta una segunda persona.'),
  // t6 · la escuela
  v58: confirmada(2, 'Dos familias confirmaron la falta de conexión en dos visitas a la escuela.'),
  v59: noCorresponde('Un sueño no se corrobora.'),

  // t7 · El Zanjón — la luz y el agua
  v60: unaSola('Un vecino llevó la planilla de los catorce cortes. Nadie más la cruzó todavía.'),
  v61: confirmada(2, 'Dos vecinos contaron las conexiones de la columna, por separado.'),
  v62: confirmada(3, 'Tres personas recorrieron las seis cuadras y contaron las casas sin red.'),
  v63: confirmada(2, 'Dos vecinos midieron a pie el tramo que faltaría extender.'),
};
