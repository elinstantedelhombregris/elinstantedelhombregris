import { APORTAR_HREF } from '~/lib/participacion/aportar';
import { claseDe, type ClaseSenal, type TipoSenal } from '~/lib/vocabulario';

/**
 * Relleno de barra/palito EN OSCURO, por CLASE.
 *
 * Era un `Record` de seis tipos con `valor: 'bg-papel'` — la excepción existía
 * porque `valor` se pintaba `tinta` y tinta sobre tinta no se ve. Con el color
 * llaveado en la clase la excepción desaparece sola: las cuatro se distinguen
 * sobre el fondo oscuro sin casos especiales.
 */
export const RELLENO_CLASE_OSCURO: Record<ClaseSenal, string> = {
  hecho: 'bg-ambar',
  deseo: 'bg-violeta',
  acto: 'bg-verde',
  meta: 'bg-cian',
};

/** El relleno que le toca a un tipo, vía su clase. */
export const rellenoDeTipo = (tipo: TipoSenal): string => RELLENO_CLASE_OSCURO[claseDe(tipo)];

export const ORIGEN_SENAL: Record<string, string> = {
  mandato_form: 'formulario del mandato',
  community_post: 'publicación de la comunidad',
  comment: 'comentario',
};

export const ESTADO_PROPUESTA: Record<string, string> = {
  draft: 'en borrador',
  voting: 'en votación',
  accepted: 'aceptada',
  rejected: 'rechazada',
  archived: 'archivada',
};

/** Pasos de la convergencia (§2) y grilla «Cómo se usa» (§5) — copy VERBATIM de la spec. */
export const PASOS_CONVERGENCIA = [
  {
    num: '01',
    titulo: 'Imaginamos una vida posible',
    cuerpo:
      'Cada persona cuenta lo que quiere hacer posible. Revisa su aporte y elige qué compartir, con qué permiso y en qué ámbito.',
    link: { href: APORTAR_HREF, etiqueta: 'Imaginar →' },
  },
  {
    num: '02',
    titulo: 'Examinamos lo que nos reúne',
    cuerpo:
      'Las semejanzas entre textos abren preguntas. Las respuestas explícitas muestran acuerdos y diferencias dentro de cada ficha; ninguna de estas lecturas habla por quienes faltan.',
  },
  {
    num: '03',
    titulo: 'Probamos y devolvemos lo aprendido',
    cuerpo:
      'Una alternativa puede convertirse en una prueba cuando alguien acepta sostenerla. El resultado, sus fuentes y sus límites vuelven a quienes participaron, para que puedan revisarlos.',
  },
] as const;

export const COMO_SE_USA = [
  {
    titulo: 'Se declara el efecto',
    cuerpo:
      'Cada campaña explica para qué escucha y qué devolución ofrece. Una responsabilidad o una respuesta institucional debe aceptarse de forma explícita; estar en el registro no obliga a nadie.',
  },
  {
    titulo: 'Se mide',
    cuerpo:
      'Cada lectura identifica fuentes, alcance y denominadores. Contar aportes, responder una afirmación y revisar un resultado son operaciones distintas; una cifra no decide la prioridad del país.',
  },
  {
    titulo: 'Se recuerda',
    cuerpo:
      'Los procesos conservan sus revisiones y el aprendizaje. Las publicaciones respetan permisos y retiros vigentes; una copia que alguien ya descargó no puede recuperarse desde la plataforma.',
  },
] as const;
