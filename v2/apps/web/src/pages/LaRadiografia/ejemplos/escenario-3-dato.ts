import { CORROBORACIONES_DATO } from './escenario-3-corroboracion';
import { armarVoces } from './padron';

import type { IdDeVoz } from './padron';
import type { DichoConFecha, Escenario, MandatoDelEscenario } from './tipos';

/**
 * Escenario 3 · El dato.
 *
 * **Las mismas 63 personas otra vez.** Mismo barrio, mismo mes, mismo padrón.
 * Ahora escriben con la dirección exacta, la fecha del hecho, el tipo correcto
 * del canon —`basta` para lo que existe y está roto, `necesidad` para lo que
 * falta— y con terceros que fueron a mirar.
 *
 * Lo que cambia no es la fuerza del reclamo: es su **forma jurídica**. Con
 * lugar exacto, fecha y testigos, el mandato deja de ser un pedido y pasa a ser
 * una obligación con plazo. La política ya no puede decir «no sabíamos» —está
 * fechado— ni «no es cierto» —fueron a mirar y firmaron.
 *
 * Cuatro cosas que este escenario mete a propósito y que valen más que el
 * brillo:
 *
 *  - **Una señal desmentida** (`v35`). Alguien dijo que habían tirado escombros
 *    y dos vecinos fueron y no había nada. La señal **se queda en el registro,
 *    desmentida y con nombre**: un corpus que se corrige borrando no es un
 *    corpus, es un panfleto.
 *  - **Los deseos siguen sin corroborarse.** `v07`, `v20`, `v45`, `v59` y la
 *    propuesta `v06` llevan veredicto `'no corresponde'`, no «sin confirmar».
 *    Un sueño no se comprueba: se delibera. Es la regla 11 y no se negocia ni
 *    cuando el resto del escenario es impecable.
 *  - **Dos señales corroboradas que se contradicen** (`v48` y `v49`): el mismo
 *    corte de energía, el mismo día, 11 horas contra 51, y las dos confirmadas
 *    por gente distinta que fue a mirar. Está puesto porque es **el límite de
 *    corroborar**: la máquina prueba que alguien fue, no que el número que
 *    trajo sea el correcto. El registro no promedia, no elige la que tiene más
 *    firmas y no borra ninguna — lo declara. Está escrito con todas las letras
 *    en `CONTRADICCION_CORROBORADA`, en el archivo de la corroboración.
 *  - **El falso amigo del escenario 2 se deshizo solo**, y no lo deshizo la
 *    máquina: «la salita» se convirtió en «CAPS Villa Los Tarcos» y en «sala de
 *    4 de la Escuela N.º 1123». Lo que separó las dos señales fue que alguien
 *    escribió el nombre completo de la cosa.
 *
 * Y lo que **no** cambia: la legitimidad. Es exactamente la misma que la de la
 * bronca. Estas 63 personas no representan más por haber escrito mejor.
 *
 * **Por qué este archivo pasa las 300 líneas y no se parte.** El tope de 300
 * es para páginas, y esto no es una página: es un corpus. Lo que sí se partió
 * es lo que tenía una costura real —la corroboración vive en su propio archivo,
 * porque es otra máquina—. Partir el récord de textos en dos mitades exigiría
 * declararlas `Partial<Record<IdDeVoz, …>>` y unirlas con un spread, y eso
 * tira a la basura la única garantía fuerte del diseño: que **una frase que
 * falta no compila**. Un archivo largo es peor que uno corto; un ejemplo que
 * puede quedar con 62 frases en un escenario y 63 en otro sin que nadie se
 * entere es mucho peor que los dos.
 */
export const DICHOS_DATO: Readonly<Record<IdDeVoz, DichoConFecha>> = {
  // t1 · El Timbó (Chaco) — el agua
  v01: {
    texto:
      'Sin agua de red en Los Lapachos al 800, barrio El Timbó, Resistencia. Desde el 3 de marzo de 2026. La canilla no da una gota.',
    tipo: 'basta',
    cuando: '2026-03-03',
  },
  v02: {
    texto:
      'Compro dos bidones de 20 litros por día para cinco personas, Los Lapachos al 800. Sin servicio desde el 3/3/2026.',
    tipo: 'basta',
    cuando: '2026-03-03',
  },
  v03: {
    texto:
      'Me comprometo a medir con balde a qué hora llega el agua a la manzana 14 de El Timbó, todos los lunes, y a subir el registro. Arranqué el 6 de abril de 2026 y sigo.',
    tipo: 'compromiso',
    cuando: '2026-04-06',
  },
  v04: {
    texto:
      'Falta el camión cisterna en El Timbó. El último entró el 18 de abril de 2026 y no volvió.',
    tipo: 'necesidad',
    cuando: '2026-04-18',
  },
  v05: {
    texto:
      'Mi mamá, 78 años, Los Timbóes al 350. Acarrea agua desde la casa de la vecina desde el 3 de marzo de 2026.',
    tipo: 'basta',
    cuando: '2026-03-03',
  },
  v06: {
    texto:
      'Propuesta: tanque comunitario de 10.000 litros en la plaza de El Timbó, Los Lapachos y Ruta 11, con una comisión vecinal a cargo del mantenimiento.',
    tipo: 'propuesta',
    cuando: null,
  },
  v07: {
    texto: 'Quiero abrir la canilla de mi casa y que salga agua.',
    tipo: 'sueño',
    cuando: null,
  },
  v08: {
    texto: 'El Timbó sigue sin agua al 12 de agosto de 2026. Van 162 días.',
    tipo: 'basta',
    cuando: '2026-08-12',
  },
  // t1 · la salita
  v09: {
    texto:
      'Centro de Salud N.º 8 de El Timbó, Los Lapachos y Formosa: atiende de 8 a 14. Después de las 14 no queda personal. Verificado el martes 12 de agosto de 2026 a las 14:30.',
    tipo: 'basta',
    cuando: '2026-08-12',
  },
  v10: {
    texto:
      'El Centro de Salud N.º 8 de El Timbó no tiene pediatra desde el 1 de febrero de 2026. Derivan al hospital del centro, a 11 km.',
    tipo: 'basta',
    cuando: '2026-02-01',
  },
  v11: {
    texto:
      'Falta atención vespertina en el Centro de Salud N.º 8 de El Timbó: hoy cierra 14:00, se pide hasta 20:00 martes, jueves y viernes.',
    tipo: 'necesidad',
    cuando: '2026-08-12',
  },
  // t1 · la calle
  v12: {
    texto:
      'Los Lapachos entre Formosa y Ruta 11, El Timbó: 400 metros sin ripio. Con lluvia queda intransitable. Pasó el 9 de marzo, el 2 de abril y el 21 de junio de 2026.',
    tipo: 'basta',
    cuando: '2026-06-21',
  },
  v13: {
    texto:
      'el 21 de junio de 2026 la ambulancia no pudo entrar a los timboes al 350 por el barro y la paciente salio caminando 300 metros hasta la esquina',
    tipo: 'basta',
    cuando: '2026-06-21',
  },
  v14: {
    texto: 'Faltan cuatro cuadras de ripio en Los Lapachos, entre Formosa y Ruta 11, El Timbó.',
    tipo: 'necesidad',
    cuando: '2026-07-12',
  },

  // t2 · Los Tarcos (Tucumán) — el centro de salud
  v15: {
    texto:
      'CAPS Villa Los Tarcos, Av. Perú al 2100, San Miguel de Tucumán: atiende de 7 a 13. Verificado el 12/8/2026 a las 13:40, puerta cerrada y sin personal.',
    tipo: 'basta',
    cuando: '2026-08-12',
  },
  v16: {
    texto:
      'El CAPS Villa Los Tarcos entrega cuatro turnos de clínica por día. El 12 de junio de 2026 a las 7:05 ya no quedaba ninguno.',
    tipo: 'basta',
    cuando: '2026-06-12',
  },
  v17: {
    texto:
      'Tres visitas al CAPS Villa Los Tarcos después de las 13: el 12/3, el 12/5 y el 12/6 de 2026. Cerrado las tres veces.',
    tipo: 'basta',
    cuando: '2026-06-12',
  },
  v18: {
    texto: 'Falta guardia de fin de semana en el CAPS Villa Los Tarcos: sábado y domingo no abre.',
    tipo: 'necesidad',
    cuando: '2026-05-12',
  },
  v19: {
    texto:
      'El CAPS Villa Los Tarcos no tiene ibuprofeno ni amoxicilina en el botiquín desde el 4 de mayo de 2026.',
    tipo: 'basta',
    cuando: '2026-05-04',
  },
  v20: {
    texto: 'Quiero que el CAPS del barrio atienda todos los días.',
    tipo: 'sueño',
    cuando: null,
  },
  // t2 · la luz
  v21: {
    texto:
      'Cortes de energía en Villa Los Tarcos, manzanas 3 a 7: catorce cortes entre el 5 y el 12 de mayo de 2026, todos entre las 14 y las 17.',
    tipo: 'basta',
    cuando: '2026-05-12',
  },
  v22: {
    texto:
      'seis cortes en la semana del 8 de junio de 2026 en av peru al 2100 se quemo la heladera tengo el presupuesto del service',
    tipo: 'basta',
    cuando: '2026-06-08',
  },
  v23: {
    texto:
      'Falta el recambio del transformador de Av. Perú y Salta, Villa Los Tarcos. Es el mismo desde 1998 según la chapa.',
    tipo: 'necesidad',
    cuando: '2026-06-12',
  },
  // t2 · el agua
  v24: {
    texto:
      'Presión de agua en Villa Los Tarcos, manzana 7: no llega al tanque de las casas de planta alta. Medida el 12/2/2026: 0,3 kg.',
    tipo: 'basta',
    cuando: '2026-02-12',
  },
  v25: {
    texto:
      'El agua de red en Av. Perú al 2100 sale turbia desde el 2 de febrero de 2026. Guardo dos botellas de muestra con fecha.',
    tipo: 'basta',
    cuando: '2026-02-02',
  },

  // t3 · Los Ceibos del Oeste (Buenos Aires) — el colectivo
  v26: {
    texto:
      'Ramal del 60 que entra a Los Ceibos del Oeste, La Matanza: último servicio efectivo 20:05. Registrado en la parada de Av. Los Ceibos y 3 de Febrero los días 3, 4, 5 y 6 de agosto de 2026.',
    tipo: 'basta',
    cuando: '2026-08-06',
  },
  v27: {
    texto:
      'Espera medida en la parada de Av. Los Ceibos y 3 de Febrero: 48, 52 y 55 minutos, los martes 7, 14 y 21 de abril de 2026, entre las 6 y las 7 de la mañana.',
    tipo: 'basta',
    cuando: '2026-04-21',
  },
  v28: {
    texto:
      'Del hospital del centro a Los Ceibos del Oeste no hay servicio entre las 20:30 y las 5:10. Salgo del turno noche los lunes y lo verifiqué seis lunes seguidos, del 2 de febrero al 9 de marzo de 2026.',
    tipo: 'basta',
    cuando: '2026-03-09',
  },
  v29: {
    texto:
      'Falta servicio dominical del ramal del 60 en Los Ceibos del Oeste: hoy, cero frecuencias los domingos.',
    tipo: 'necesidad',
    cuando: '2026-04-12',
  },
  v30: {
    texto:
      'El recorrido del ramal se acortó el 1 de octubre de 2025: antes llegaba a Av. Los Ceibos y la Escuela 47, ahora termina en Ruta 3, a 1,4 km.',
    tipo: 'basta',
    cuando: '2025-10-01',
  },
  v31: {
    texto:
      'mi hija sale de la escuela 47 a las 22:10 los martes y jueves y camina 1,4 km hasta casa porque no hay servicio desde el 1 de octubre de 2025',
    tipo: 'basta',
    cuando: '2025-10-01',
  },
  v32: {
    texto:
      '¿Cuántas personas se quedaron sin poder volver de noche desde que se acortó el ramal el 1/10/2025?',
    tipo: 'pregunta',
    cuando: null,
  },
  // t3 · la basura
  v33: {
    texto:
      'Basural a cielo abierto en el terreno lindero a la Escuela 47, Los Ceibos del Oeste. Superficie estimada 600 m². Fotografiado el 14 de junio de 2026.',
    tipo: 'basta',
    cuando: '2026-06-14',
  },
  v34: {
    texto:
      'Sin recolección en Av. Los Ceibos entre 3 de Febrero y Ruta 3 desde el 22 de mayo de 2026. Tres semanas al 12 de junio.',
    tipo: 'basta',
    cuando: '2026-05-22',
  },
  v35: {
    texto:
      'Descarga de escombros en el terreno de Av. Los Ceibos y 3 de Febrero, la madrugada del 3 de mayo de 2026.',
    tipo: 'basta',
    cuando: '2026-05-03',
  },
  v36: {
    texto: 'Faltan cuatro contenedores en Av. Los Ceibos, entre 3 de Febrero y Ruta 3.',
    tipo: 'necesidad',
    cuando: '2026-06-12',
  },
  // t3 · el alumbrado
  v37: {
    texto:
      'Ocho columnas de alumbrado apagadas en Av. Los Ceibos, entre 3 de Febrero y la Escuela 47. Contadas el 9 de agosto de 2026 a las 21:30.',
    tipo: 'basta',
    cuando: '2026-08-09',
  },
  v38: {
    texto:
      'SIN ALUMBRADO PÚBLICO en las cuatro cuadras de la Escuela 47 desde el 11 de julio de 2026.',
    tipo: 'basta',
    cuando: '2026-07-11',
  },

  // t4 · La Cañada Vieja (Santa Fe) — la sala de 4
  v39: {
    texto:
      'Sala de 4 de la Escuela N.º 1123, La Cañada Vieja, Rosario: 20 vacantes para 34 inscriptos en la matriculación del 10 de noviembre de 2025. Quedaron 14 chicos afuera.',
    tipo: 'basta',
    cuando: '2025-11-10',
  },
  v40: {
    texto:
      'mi hija 4 años quedo fuera de la sala de 4 de la escuela n 1123 el 10 de noviembre de 2025 tengo el comprobante de inscripcion',
    tipo: 'basta',
    cuando: '2025-11-10',
  },
  v41: {
    texto:
      'La sala de 4 de la Escuela N.º 1123 no dictó clases entre el 2 y el 27 de marzo de 2026 por falta de docente titular.',
    tipo: 'basta',
    cuando: '2026-03-02',
  },
  v42: {
    texto: 'Faltan 14 vacantes de sala de 4 en la Escuela N.º 1123, La Cañada Vieja, Rosario.',
    tipo: 'necesidad',
    cuando: '2025-11-10',
  },
  v43: {
    texto:
      'Filtración en el techo del aula de sala de 4 de la Escuela N.º 1123. Se suspendió la jornada el 12 de mayo y el 3 de junio de 2026.',
    tipo: 'basta',
    cuando: '2026-06-03',
  },
  // t4 · el agua
  v44: {
    texto:
      'Presión insuficiente en Los Sauces al 1500, La Cañada Vieja, Rosario: el agua no llega a tanques de más de 3 metros. Medida el 12 de mayo y el 12 de julio de 2026.',
    tipo: 'basta',
    cuando: '2026-07-12',
  },
  v45: {
    texto: 'Quiero abrir la ducha de mi casa y bañarme con agua de la red.',
    tipo: 'sueño',
    cuando: null,
  },
  // t4 · la calle
  v46: {
    texto:
      'Anegamiento de Los Sauces entre el 1400 y el 1600, La Cañada Vieja: entró agua a nueve casas el 21 de abril de 2026, con 68 mm de lluvia.',
    tipo: 'basta',
    cuando: '2026-04-21',
  },
  v47: {
    texto:
      'Falta limpieza del zanjón de Los Sauces y Pasaje 12, La Cañada Vieja. Última limpieza que los vecinos registran: marzo de 2023.',
    tipo: 'necesidad',
    cuando: '2026-07-12',
  },

  // t5 · Alto de la Cruz (Córdoba) — la luz
  v48: {
    texto:
      'Cortes de energía en Alto de la Cruz, Villa María, asociados a lluvia: 3/2, 19/2 y 7/4 de 2026. Duraron 4, 6 y 11 horas.',
    tipo: 'basta',
    cuando: '2026-04-07',
  },
  v49: {
    texto:
      'Corte de 51 horas en Alto de la Cruz, del 7 al 9 de abril de 2026. Se perdió comida en al menos 12 casas de la manzana 5.',
    tipo: 'basta',
    cuando: '2026-04-07',
  },
  v50: {
    texto:
      'Caída de tensión a 187 V en Bv. Alto de la Cruz al 700, medida con tester el 12 de febrero de 2026 a las 15:20.',
    tipo: 'basta',
    cuando: '2026-02-12',
  },
  v51: {
    texto: 'Falta el refuerzo de la línea de media tensión que alimenta Alto de la Cruz.',
    tipo: 'necesidad',
    cuando: '2026-07-12',
  },
  // t5 · el agua
  v52: {
    texto:
      'El pozo que abastece Alto de la Cruz funciona con bomba eléctrica y sin generador: cada corte de energía es también un corte de agua. Verificado el 7 de abril de 2026.',
    tipo: 'saber',
    cuando: '2026-04-07',
  },
  // t5 · la changa
  v53: {
    texto:
      'De las 30 casas de la manzana 5 de Alto de la Cruz, en 22 el único ingreso es changa o monotributo social. Relevado casa por casa entre el 4 y el 11 de abril de 2026.',
    tipo: 'basta',
    cuando: '2026-04-11',
  },
  v54: {
    texto:
      'La bolsa de trabajo municipal de Villa María no recibe inscripciones nuevas desde el 30 de junio de 2025.',
    tipo: 'necesidad',
    cuando: '2025-06-30',
  },

  // t6 · San Ramón Chico (Misiones) — el camino
  v55: {
    texto:
      'Camino vecinal a Colonia San Ramón Chico, Oberá: 7 km de tierra. Intransitable el 14 y el 15 de octubre y el 2 de diciembre de 2025.',
    tipo: 'basta',
    cuando: '2025-12-02',
  },
  v56: {
    texto:
      'el 15 de octubre de 2025 la ambulancia quedo empantanada en el kilometro 4 del camino vecinal y el traslado demoro 2 horas 40',
    tipo: 'basta',
    cuando: '2025-10-15',
  },
  v57: {
    texto:
      'Falta mantenimiento del camino vecinal a San Ramón Chico. Última pasada de motoniveladora registrada: 11 de marzo de 2025.',
    tipo: 'necesidad',
    cuando: '2025-03-11',
  },
  // t6 · la escuela
  v58: {
    texto:
      'Escuela N.º 812 de Colonia San Ramón Chico: sin conexión a internet desde el ciclo lectivo 2024. Son 43 alumnos.',
    tipo: 'basta',
    cuando: '2025-10-14',
  },
  v59: {
    texto: 'Quiero que los chicos de la colonia puedan terminar el secundario acá.',
    tipo: 'sueño',
    cuando: null,
  },

  // t7 · El Zanjón (Salta) — la luz y el agua
  v60: {
    texto:
      'Villa El Zanjón, Salta: catorce cortes de energía entre el 1 y el 30 de septiembre de 2025, ninguno con aviso previo.',
    tipo: 'basta',
    cuando: '2025-09-30',
  },
  v61: {
    texto:
      'La manzana 9 de Villa El Zanjón se abastece de una sola columna con 17 conexiones precarias. Relevado el 12 de noviembre de 2025.',
    tipo: 'basta',
    cuando: '2025-11-12',
  },
  v62: {
    texto:
      'Villa El Zanjón: seis cuadras sin red de agua. 63 casas se abastecen de una canilla pública en Pasaje El Zanjón y Los Cardones. Relevado el 12 de enero de 2026.',
    tipo: 'basta',
    cuando: '2026-01-12',
  },
  v63: {
    texto: 'Falta la extensión de red de agua potable, seis cuadras, Villa El Zanjón, Salta.',
    tipo: 'necesidad',
    cuando: '2026-01-12',
  },
};

/**
 * El mandato del escenario 3: una obligación con plazo, lugar y testigos.
 *
 * Está escrito como se le exige algo a alguien: qué hay que hacer, dónde,
 * desde cuándo corre, y en qué día concreto queda incumplido. Los responsables
 * están nombrados **por su función y no por su razón social**, a propósito:
 * este corpus es sintético, y un ejemplo no le puede imputar un incumplimiento
 * fechado a una empresa o a un municipio que existen de verdad.
 */
export const MANDATO_DATO: MandatoDelEscenario = {
  hay: true,
  texto:
    'La prestadora del servicio de agua de la provincia tiene 30 días corridos desde el 16 de agosto de 2026 para restituir el agua de red en Los Lapachos al 800, barrio El Timbó, Resistencia, cortada desde el 3 de marzo de 2026; y, hasta que la restituya, un camión cisterna diario, que no entra desde el 18 de abril. La autoridad sanitaria del municipio tiene el mismo plazo para abrir la atención vespertina del Centro de Salud N.º 8, que cierra a las 14:00 y no tiene pediatra desde el 1 de febrero de 2026. La autoridad de transporte tiene 60 días para restituir el recorrido del ramal que entra a Los Ceibos del Oeste, acortado 1,4 km el 1 de octubre de 2025, y el servicio nocturno posterior a las 20:05.',
  porQue:
    'Hay lugar exacto, hay fecha de inicio, hay tipo del canon —lo que existe y está roto se separó de lo que falta— y hay terceros que fueron a mirar y firmaron. Con eso, «no sabíamos» es falso: está fechado. Y «no es cierto» es refutable: hay dos o más personas distintas que fueron a la dirección y lo vieron. Nada de esto lo dio la máquina; lo dio que 63 personas escribieran la calle, el día y la cosa.',
  comoSeVerifica:
    'El 15 de septiembre de 2026 alguien abre la canilla de Los Lapachos al 800. Si no sale agua, el incumplimiento tiene fecha, dirección y nombre de función, y lo comprueban las mismas personas que lo denunciaron. Lo mismo con la puerta del Centro de Salud N.º 8 a las 18:00 y con la parada de Av. Los Ceibos y 3 de Febrero a las 21:00.',
};

export const ESCENARIO_DATO: Escenario = {
  id: 'dato',
  titulo: 'El dato',
  resumen:
    'Las mismas 63 voces con lugar exacto, fecha, el tipo correcto del canon y corroboración de terceros. El mandato pasa a ser una obligación con plazo.',
  loQueSeVe:
    'Diez núcleos y el mayor tiene cinco: la imagen más pobre de las tres. Lo que la imagen no muestra es la diferencia que importa — 45 de las 57 señales verificables están corroboradas por dos personas o más. Una quedó desmentida y sigue en el registro. Y dos de las corroboradas se contradicen entre sí sobre cuánto duró el mismo corte de luz: están las dos, porque corroborar prueba que alguien fue a mirar y no que el número que trajo sea el correcto. Los deseos no se corroboran nunca, y por eso figuran como «no corresponde» y no como «sin confirmar».',
  voces: armarVoces({ dichos: DICHOS_DATO, corroboraciones: CORROBORACIONES_DATO }),
  mandato: MANDATO_DATO,
};
