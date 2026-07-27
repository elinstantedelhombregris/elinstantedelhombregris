import type { Compromiso } from './types';

/**
 * Mazo de micro-compromisos para la luz DAR.
 * Sesenta gestos originales en rioplatense: concretos, humildes,
 * verificables por uno mismo en el día. Nadie los controla:
 * la confianza es la mecánica.
 */
export const COMPROMISOS: Compromiso[] = [
  // ── Vecindad ──────────────────────────────────────────────────────────────
  {
    id: 'vecindad-01',
    texto: 'Saludá por su nombre a alguien que ves siempre y nunca saludás.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-02',
    texto: 'Preguntale el nombre a la persona que te vende la verdura o el pan, y usalo al despedirte.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-03',
    texto: 'Tocale el timbre a un vecino nada más que para preguntarle cómo anda.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-04',
    texto: 'Pedí prestado algo chico que podrías comprar: una taza de azúcar, un destornillador.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-05',
    texto: 'Ofrecele una mano concreta a un vecino mayor: una bolsa, un trámite, una lamparita.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-06',
    texto: 'Comprá hoy en el negocio de la cuadra eso que ibas a pedir por app.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-07',
    texto: 'Presentate con nombre al vecino más nuevo del edificio o de la cuadra.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-08',
    texto: 'Avisale a un vecino de algo útil que sabés y él no: el corte de agua, la feria, el turno.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-09',
    texto: 'Caminá entera una calle de tu barrio por la que nunca pasás, mirando de verdad.',
    categoria: 'vecindad',
  },
  {
    id: 'vecindad-10',
    texto: 'Dejale al portero, al sereno o al repartidor una palabra de más: no el "hola" de siempre, una pregunta.',
    categoria: 'vecindad',
  },

  // ── Cuidado ───────────────────────────────────────────────────────────────
  {
    id: 'cuidado-01',
    texto: 'Llamá — llamada, no mensaje — a alguien de tu familia que hace mucho no escuchás.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-02',
    texto: 'Cebale unos mates o hacele un té a alguien de tu casa, sin que te lo pida.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-03',
    texto: 'Preguntale a alguien cómo está y quedate callado hasta que conteste de verdad.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-04',
    texto: 'Acostate hoy media hora antes. Cuidarte también es cuidar.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-05',
    texto: 'Cociná algo simple para otro, aunque sobre comida en la heladera.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-06',
    texto: 'Regalale diez minutos enteros a un chico: su juego, sus reglas, tu teléfono lejos.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-07',
    texto: 'Escribile dos líneas a alguien que la está pasando mal. Sin consejos: compañía.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-08',
    texto: 'Fijate quién a tu alrededor viene cargando algo pesado — bolsas o penas — y dale una mano.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-09',
    texto: 'Tomá agua, comé una fruta, caminá diez cuadras. El cuerpo sostiene todo lo demás.',
    categoria: 'cuidado',
  },
  {
    id: 'cuidado-10',
    texto: 'Antes de dormir, nombrá para adentro a tres personas que te sostuvieron el día.',
    categoria: 'cuidado',
  },

  // ── Coraje ────────────────────────────────────────────────────────────────
  {
    id: 'coraje-01',
    texto: 'Decí "no sé" una vez hoy, sin adornarlo.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-02',
    texto: 'Pedí disculpas por algo puntual, sin agregar excusas después de la coma.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-03',
    texto: 'Decile a alguien, mirándolo, una cosa concreta que valorás de él.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-04',
    texto: 'Marcá un desacuerdo sin levantar la voz y sin pedir perdón por pensar distinto.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-05',
    texto: 'Hacé hoy la llamada que venís pateando hace semanas.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-06',
    texto: 'Preguntá en voz alta lo que todos se están preguntando y nadie dice.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-07',
    texto: 'Decí "me equivoqué" apenas te des cuenta, sin repartir culpas.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-08',
    texto: 'Pedí ayuda con algo que venías cargando solo.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-09',
    texto: 'Poné un límite chico: un "no" dicho a tiempo, sin drama y sin vueltas.',
    categoria: 'coraje',
  },
  {
    id: 'coraje-10',
    texto: 'Hablale a esa persona que te intimida un poco. Dos frases alcanzan.',
    categoria: 'coraje',
  },

  // ── Palabra ───────────────────────────────────────────────────────────────
  {
    id: 'palabra-01',
    texto: 'Cumplí hoy una promesa chica que venías pateando.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-02',
    texto: 'No repitas hoy ningún dato del que no sepas de dónde salió.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-03',
    texto: 'Pasá el día sin quejarte. Si te escuchás arrancar, frená a mitad de frase.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-04',
    texto: 'Contestá ese mensaje que debés hace días, aunque sean tres líneas honestas.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-05',
    texto: 'Aprendé a decir y escribir bien el nombre de alguien que ves seguido y siempre dudás.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-06',
    texto: 'Hoy no exageres, ni para bien ni para mal. Contá las cosas del tamaño que son.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-07',
    texto: 'Antes de criticar a alguien que no está, preguntate si se lo dirías en la cara. Si no, guardalo.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-08',
    texto: 'Escuchá una conversación entera sin interrumpir ni una vez.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-09',
    texto: 'Agradecé por escrito algo concreto que alguien hizo por vos esta semana.',
    categoria: 'palabra',
  },
  {
    id: 'palabra-10',
    texto: 'Si hoy prometés algo, anotalo donde lo veas mañana. La palabra empeñada se cuida como la plata.',
    categoria: 'palabra',
  },

  // ── Orden ─────────────────────────────────────────────────────────────────
  {
    id: 'orden-01',
    texto: 'Levantá tres basuras que no son tuyas.',
    categoria: 'orden',
  },
  {
    id: 'orden-02',
    texto: 'Ordená un solo cajón: el que más te molesta abrir.',
    categoria: 'orden',
  },
  {
    id: 'orden-03',
    texto: 'Lavá lo que ensucies hoy apenas lo ensucies. Nada juntado para después.',
    categoria: 'orden',
  },
  {
    id: 'orden-04',
    texto: 'Arreglá o despedí una cosa rota que venís esquivando hace meses.',
    categoria: 'orden',
  },
  {
    id: 'orden-05',
    texto: 'Dejá un espacio común mejor de lo que lo encontraste: la pileta, el pasillo, la vereda.',
    categoria: 'orden',
  },
  {
    id: 'orden-06',
    texto: 'Silenciá el grupo que te enoja al pedo o borrá una app que te roba tiempo.',
    categoria: 'orden',
  },
  {
    id: 'orden-07',
    texto: 'Anotá en qué se te fue la plata esta semana. Mirarlo ya es ordenar.',
    categoria: 'orden',
  },
  {
    id: 'orden-08',
    texto: 'Hacé la cama apenas te levantes: el día arranca con una cosa terminada.',
    categoria: 'orden',
  },
  {
    id: 'orden-09',
    texto: 'Barré tu vereda. Si ya está limpia, arrancá con la de al lado.',
    categoria: 'orden',
  },
  {
    id: 'orden-10',
    texto: 'Devolvé algo prestado que ya ni te acordabas que tenías.',
    categoria: 'orden',
  },

  // ── Belleza ───────────────────────────────────────────────────────────────
  {
    id: 'belleza-01',
    texto: 'Cuando oscurezca, salí a mirar el cielo cinco minutos. Sin teléfono: mirar.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-02',
    texto: 'Poné algo vivo o lindo donde comés todos los días: una flor, una rama, una piedra.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-03',
    texto: 'Mandale una canción que te emociona a la persona indicada, con una línea de por qué.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-04',
    texto: 'Poné la mesa como si viniera alguien importante, aunque comas solo.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-05',
    texto: 'Sacá una sola foto hoy: la cosa más linda que te cruces. Mirala a la noche.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-06',
    texto: 'Escuchá un tema entero con los ojos cerrados, sin hacer ninguna otra cosa.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-07',
    texto: 'Embellecé un metro cuadrado tuyo: el escritorio, el balcón, la entrada.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-08',
    texto: 'Leé una página en voz alta, despacio, para vos o para alguien.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-09',
    texto: 'Buscale hoy a tu cuadra una cosa hermosa que nadie más vio. Guardala.',
    categoria: 'belleza',
  },
  {
    id: 'belleza-10',
    texto: 'Hacé una cosa más despacio de lo necesario, solo para hacerla bien.',
    categoria: 'belleza',
  },
];
