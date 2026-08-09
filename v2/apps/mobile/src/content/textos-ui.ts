/**
 * Copy de UI que sobrevivió al juego (R2 Task 5).
 * Rioplatense siempre. Sobrio, hondo, argentino: la voz de los ensayos.
 * Nada de tono corporativo, nada de entusiasmo de plástico.
 *
 * `FTUE_ASOMBRO`, `NOCHE_COMPLETA`, `RITO_REENCENDIDO`, `NOCHE_NUBLADA`,
 * `ESTRELLA_FUGAZ`, `ASCENSO_RANGO`, `COMPROMISO_AYER`, `ESTADOS_VACIOS`,
 * `COMPARTIR` y `CAPTURA` eran copy de pantallas del juego que ya no
 * existen — se borraron con ellas. `FTUE` sobrevive porque `escuchar.tsx`
 * reutiliza su pacto de datos; `NOTIFICACIONES` porque `ajustes.tsx` sigue
 * ofreciendo el aviso diario opt-in, que nunca tuvo nada de juego.
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

/** Notificaciones locales (opt-in, una por día como máximo). */
export const NOTIFICACIONES = {
  tuCieloEspera: 'Tu cielo espera.',
  optIn:
    '¿Querés que te avisemos una vez por día, a las ocho de la noche? Nada de ruido: solo "tu cielo espera".',
  optInAceptar: 'Dale, avisame',
  optInRechazar: 'Mejor no',
} as const;
