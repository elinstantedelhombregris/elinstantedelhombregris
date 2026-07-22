/**
 * Copy de juego de ¡BASTA! — todos los textos de UI.
 * Rioplatense siempre. Sobrio, hondo, argentino: la voz de los ensayos.
 * Nada de tono corporativo, nada de entusiasmo de plástico.
 */

/** Primera experiencia: propósito, pacto de datos y elección del primer acto. */
export const FTUE = {
  propositoTitulo: 'Lo real, primero.',
  propositoDetalle: 'Una infraestructura cívica para convertir escucha situada en cuidado, conexiones y decisiones que puedan rendir cuentas.',
  pactoTitulo: 'Tus datos no son el precio de entrada.',
  pactoDetalle: 'La confianza no se declara: se construye dando control comprensible antes, durante y después de cada aporte.',
  pacto: [
    { title: 'Tu relato es tuyo', detail: 'La bitácora empieza privada. Si contribuís, se crea una derivación mínima; el texto original no se publica.' },
    { title: 'El lugar está bajo tu control', detail: 'Podés explorar sin ubicación. Cuando un registro necesita lugar, elegís el punto y la precisión que se comparte.' },
    { title: 'Toda entrega deja una huella', detail: 'Quién recibe, para qué, hasta cuándo y cómo retirar o corregir deben quedar visibles en un recibo.' },
  ],
  eleccionTitulo: '¿Por dónde querés entrar?',
} as const;

/** FTUE del asombro: del cielo vacío a la primera estrella en <60s (spec §3.6). */
export const FTUE_ASOMBRO = {
  pregunta: '¿Qué falta acá donde estás parado?',
  placeholderRespuesta: 'Una línea alcanza. Lo que ves, lo que falta, lo que duele.',
  nacimiento: 'Así se enciende un país.',
  bienvenidaBrasas: 'Cinco brasas de bienvenida: el fuego arranca prendido.',
  tooltips: {
    ver: 'VER es una pregunta por día. La respondés para vos: nadie la lee, nadie la corrige.',
    encender: 'ENCENDER captura lo que ves — un sueño, una falta, un recurso. Cada captura es una estrella tuya.',
    dar: 'DAR es un compromiso chiquito. Mañana el juego te pregunta si lo hiciste. Nadie verifica: la confianza es la mecánica.',
  },
  saltearTour: 'Saltear — ya voy a descubrirlo',
} as const;

/** Cierre del día con las tres luces encendidas. Se elige una variante al azar. */
export const NOCHE_COMPLETA: readonly string[] = [
  'Tres luces. Noche completa. Hoy también se fabricó país, y una de las manos fue la tuya.',
  'Noche completa. Nadie lo vio, nadie lo aplaude — por eso vale.',
  'Las tres luces encendidas. Lo chico, sostenido, es lo que aguanta.',
] as const;

/** Rito de re-encendido: la racha se apagó y vuelve a nacer en uno. */
export const RITO_REENCENDIDO = {
  titulo: 'Rito de re-encendido',
  intro:
    'La Estrella Guía se apagó. No es una falta: es una noche más larga que las otras. El tejido no castiga la ausencia — la espera.',
  pasoReflexion:
    'Elegí una reflexión tuya de la Bitácora y releela despacio. La escribiste vos: esa voz sigue estando.',
  pasoRespiracion:
    'Ahora, treinta segundos de respirar. Nada más que eso. El cuerpo se acuerda de lo que la mente olvida.',
  cierre: 'La Estrella Guía vuelve a encenderse. Racha en uno. La recaída es parte del camino.',
} as const;

/** Noches nubladas (protección de racha, dos por semana, sin culpa). */
export const NOCHE_NUBLADA = {
  usada: 'Anoche se nubló y no pasó nada: la racha sigue. Hasta el cielo tiene derecho a nublarse.',
  sinRestantes: 'Esta semana ya no quedan nubes de repuesto. Hoy, aunque sea una luz.',
} as const;

/** Estrellas fugaces: eventos al abrir la app (máximo uno por día). */
export const ESTRELLA_FUGAZ = {
  aviso: 'Una estrella fugaz cruza tu cielo.',
  preguntaExtra: 'Trae una pregunta de más. Si la respondés hoy, dos brasas extra.',
  brasasX2: 'Hoy las brasas valen doble. Día de viento a favor.',
  desafio24h: 'Desafío de veinticuatro horas: capturá tres estrellas antes de mañana y sumás ocho brasas.',
} as const;

/** Línea de ascenso por rango. La clave coincide con el rango alcanzado. */
export const ASCENSO_RANGO: Record<
  'chispa' | 'vela' | 'farol' | 'fogata' | 'faro' | 'aurora',
  string
> = {
  chispa: 'Chispa. Toda luz empezó así: algo chico que nadie vio.',
  vela: 'Vela. Ya no sos un instante: sos una llama que se queda.',
  farol: 'Farol. Tu luz ya alumbra más allá de tu mano.',
  fogata: 'Fogata. Alrededor de un fuego así, la gente se arrima.',
  faro: 'Faro. Hay quien se orienta porque vos seguís encendido.',
  aurora: 'Aurora. Ya no sos una luz en la noche: sos la noche terminándose.',
};

/** Notificaciones locales (opt-in, una por día como máximo). */
export const NOTIFICACIONES = {
  tuCieloEspera: 'Tu cielo espera.',
  optIn:
    '¿Querés que te avisemos una vez por día, a las ocho de la noche? Nada de ruido: solo "tu cielo espera".',
  optInAceptar: 'Dale, avisame',
  optInRechazar: 'Mejor no',
} as const;

/** Chequeo del compromiso de ayer: sin verificación externa, la confianza es la mecánica. */
export const COMPROMISO_AYER = {
  pregunta: '¿Lo hiciste?',
  hecho: 'Hecho. Tres brasas más. La palabra empeñada se cumple sin testigos.',
  noHecho: 'No pasa nada: decirlo también es cumplir con la verdad. Hoy hay revancha.',
} as const;

/** Estados vacíos de cada pantalla. */
export const ESTADOS_VACIOS = {
  cielo: 'Tu cielo todavía está oscuro. Alcanza con una estrella para que deje de estarlo.',
  bitacora: 'Acá van a vivir tus reflexiones. Nadie más las lee: son tuyas.',
  album: 'Las constelaciones se dibujan solas a medida que capturás. Empezá por cualquier estrella.',
  expediciones:
    'Ninguna expedición en marcha. Fundá una o jugá las del barrio: el mapa se hace caminando.',
  circulo:
    'Todavía no tenés círculo. Los círculos se fundan cara a cara, con un QR y un apretón de manos.',
} as const;

/** Textos varios de compartir y payoffs. */
export const COMPARTIR = {
  cielo: 'Mirá mi cielo: se está encendiendo.',
  cartaLore: 'Completé una constelación. Esta carta salió de los ensayos.',
  chispaRegalada: 'Te regalo una chispa. Escaneala y encendé tu cielo.',
} as const;

/** Momentos de captura (luz ENCENDER). */
export const CAPTURA = {
  nacimientoEstrella: 'Nació una estrella. Ya está en tu cielo.',
  fundadora: 'Estrella fundadora: la primera de su tipo en tu cielo.',
  nocturna: 'Estrella nocturna. Alguien tenía que estar despierto.',
  fugaz: 'Estrella fugaz: la capturaste durante un evento. No se repite.',
} as const;
