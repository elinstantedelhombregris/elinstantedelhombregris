#!/usr/bin/env tsx
/**
 * Seed the 12 canonical life areas + 60 subcategories + 120 quiz
 * questions (current + desired per subcategory).
 *
 * Idempotent: runs an ON CONFLICT DO NOTHING-style flow by checking
 * existing slugs before inserting. Re-running won't duplicate rows.
 */
import { config } from 'dotenv';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const url = process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL is required to seed life areas');
}

const { getDb } = await import('../src/client.js');
const {
  lifeAreas,
  lifeAreaSubcategories,
  lifeAreaQuizQuestions,
} = await import('../src/schema/life-areas.js');
const { eq } = await import('drizzle-orm');

interface SubcategorySeed {
  slug: string;
  name: string;
  description: string;
  questions: { current: string; desired: string };
}

interface AreaSeed {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  accentColor: string;
  subcategories: SubcategorySeed[];
}

const AREAS: AreaSeed[] = [
  {
    slug: 'salud-fisica',
    name: 'Salud física',
    description: 'Tu cuerpo, su energía, su capacidad de sostener todo lo que querés hacer.',
    iconName: 'heart',
    accentColor: 'text-rose-400',
    subcategories: [
      { slug: 'energia', name: 'Energía diaria', description: 'Cuánta energía tenés a lo largo del día.', questions: { current: '¿Cuánta energía sostenés a lo largo de un día típico?', desired: '¿Cuánta energía te gustaría tener?' } },
      { slug: 'movimiento', name: 'Movimiento', description: 'Actividad física regular.', questions: { current: '¿Qué tan activo está tu cuerpo en una semana?', desired: '¿Qué tan activo querés que esté?' } },
      { slug: 'descanso', name: 'Descanso', description: 'Calidad del sueño y la recuperación.', questions: { current: '¿Qué tan reparador es tu descanso?', desired: '¿Qué tan reparador querés que sea?' } },
      { slug: 'alimentacion', name: 'Alimentación', description: 'Lo que comés y cómo te hace sentir.', questions: { current: '¿Qué tan bien comés en general?', desired: '¿Qué tan bien querés comer?' } },
      { slug: 'cuidado', name: 'Cuidado preventivo', description: 'Atención médica + chequeos + prevención.', questions: { current: '¿Qué tan bien cuidás tu cuerpo de manera preventiva?', desired: '¿Qué tan bien querés cuidarlo?' } },
    ],
  },
  {
    slug: 'salud-mental',
    name: 'Salud mental',
    description: 'Tu cabeza, su claridad, su capacidad de regular emociones difíciles.',
    iconName: 'brain',
    accentColor: 'text-purple-400',
    subcategories: [
      { slug: 'claridad', name: 'Claridad mental', description: 'Capacidad de pensar sin niebla.', questions: { current: '¿Qué tan claro pensás en general?', desired: '¿Qué tan claro querés pensar?' } },
      { slug: 'estabilidad', name: 'Estabilidad emocional', description: 'Capacidad de sostener emociones sin desbordarse.', questions: { current: '¿Qué tan estable te sentís emocionalmente?', desired: '¿Qué tan estable querés sentirte?' } },
      { slug: 'estres', name: 'Manejo del estrés', description: 'Herramientas para responder al estrés.', questions: { current: '¿Qué tan bien manejás el estrés?', desired: '¿Qué tan bien querés manejarlo?' } },
      { slug: 'autoestima', name: 'Autoestima', description: 'Cómo te ves a vos mismo.', questions: { current: '¿Qué tan bien te ves a vos mismo?', desired: '¿Qué tan bien querés verte?' } },
      { slug: 'apoyo', name: 'Apoyo profesional', description: 'Acceso a terapia o acompañamiento.', questions: { current: '¿Qué tanto apoyo profesional tenés cuando lo necesitás?', desired: '¿Qué tanto querés tener?' } },
    ],
  },
  {
    slug: 'familia',
    name: 'Familia',
    description: 'Tus vínculos de origen y los que vas formando como elección.',
    iconName: 'users',
    accentColor: 'text-amber-400',
    subcategories: [
      { slug: 'cercania', name: 'Cercanía', description: 'Qué tan cerca te sentís de tu familia.', questions: { current: '¿Qué tan cerca te sentís de tu familia hoy?', desired: '¿Qué tan cerca te gustaría sentirte?' } },
      { slug: 'comunicacion', name: 'Comunicación', description: 'Calidad de las conversaciones.', questions: { current: '¿Qué tan bien se comunican entre ustedes?', desired: '¿Qué tan bien querés que se comuniquen?' } },
      { slug: 'apoyo-mutuo', name: 'Apoyo mutuo', description: 'Pueden contar entre sí cuando importa.', questions: { current: '¿Cuánto pueden contar entre ustedes?', desired: '¿Cuánto querés que puedan contar?' } },
      { slug: 'rituales', name: 'Rituales compartidos', description: 'Tradiciones, comidas, encuentros.', questions: { current: '¿Cuántos rituales compartidos tienen?', desired: '¿Cuántos querés tener?' } },
      { slug: 'limites', name: 'Límites sanos', description: 'Cuidar el vínculo cuidando tu espacio.', questions: { current: '¿Qué tan sanos son los límites en tu familia?', desired: '¿Qué tan sanos querés que sean?' } },
    ],
  },
  {
    slug: 'relaciones',
    name: 'Relaciones',
    description: 'Pareja + amistades + vínculos significativos.',
    iconName: 'heart-handshake',
    accentColor: 'text-pink-400',
    subcategories: [
      { slug: 'pareja', name: 'Pareja', description: 'Calidad del vínculo principal.', questions: { current: '¿Qué tan bien va tu vínculo de pareja?', desired: '¿Qué tan bien querés que vaya?' } },
      { slug: 'amistades', name: 'Amistades', description: 'Calidad y cantidad de amistades cercanas.', questions: { current: '¿Cuán nutridas están tus amistades?', desired: '¿Cuán nutridas las querés?' } },
      { slug: 'red-social', name: 'Red social', description: 'Comunidad de gente conocida.', questions: { current: '¿Qué tan rica es tu red social?', desired: '¿Qué tan rica querés que sea?' } },
      { slug: 'intimidad', name: 'Intimidad emocional', description: 'Capacidad de vulnerabilidad real.', questions: { current: '¿Qué tan profundo es el contacto emocional?', desired: '¿Qué tan profundo querés que sea?' } },
      { slug: 'soledad', name: 'Soledad elegida', description: 'Capacidad de estar solo y disfrutarlo.', questions: { current: '¿Qué tan bien estás cuando estás solo?', desired: '¿Qué tan bien querés estar?' } },
    ],
  },
  {
    slug: 'trabajo',
    name: 'Trabajo',
    description: 'Tu actividad principal: lo que hacés y cómo te hace sentir.',
    iconName: 'briefcase',
    accentColor: 'text-blue-400',
    subcategories: [
      { slug: 'proposito', name: 'Propósito', description: '¿Importa lo que hacés?', questions: { current: '¿Qué tan significativo es lo que hacés?', desired: '¿Qué tan significativo querés que sea?' } },
      { slug: 'desafio', name: 'Desafío', description: 'Está al borde justo de tu habilidad.', questions: { current: '¿Te desafía lo que hacés?', desired: '¿Querés que te desafíe?' } },
      { slug: 'autonomia', name: 'Autonomía', description: 'Cuánto decidís cómo trabajar.', questions: { current: '¿Cuánta autonomía tenés?', desired: '¿Cuánta querés tener?' } },
      { slug: 'companeros', name: 'Compañeros', description: 'La gente con la que trabajás.', questions: { current: '¿Qué tan buena es la gente con la que trabajás?', desired: '¿Qué tan buena querés que sea?' } },
      { slug: 'reconocimiento', name: 'Reconocimiento', description: 'Sentís que tu aporte es visto.', questions: { current: '¿Cuánto se reconoce tu aporte?', desired: '¿Cuánto querés que se reconozca?' } },
    ],
  },
  {
    slug: 'dinero',
    name: 'Dinero',
    description: 'Tu relación con los recursos materiales.',
    iconName: 'wallet',
    accentColor: 'text-emerald-400',
    subcategories: [
      { slug: 'ingresos', name: 'Ingresos', description: 'Lo que entra mensualmente.', questions: { current: '¿Tus ingresos cubren lo que necesitás?', desired: '¿Cuánto querés que cubran?' } },
      { slug: 'ahorros', name: 'Ahorros', description: 'Reserva ante imprevistos.', questions: { current: '¿Qué tan sólidos están tus ahorros?', desired: '¿Qué tan sólidos los querés?' } },
      { slug: 'deudas', name: 'Deudas', description: 'Lo que debés y a qué.', questions: { current: '¿Qué tan limpio está tu lado de las deudas?', desired: '¿Qué tan limpio querés que esté?' } },
      { slug: 'inversion', name: 'Inversión', description: 'Tu plata produciendo más plata.', questions: { current: '¿Qué tan bien invertís?', desired: '¿Qué tan bien querés invertir?' } },
      { slug: 'relacion-dinero', name: 'Relación con el dinero', description: 'Vínculo emocional con la plata.', questions: { current: '¿Qué tan sana es tu relación con el dinero?', desired: '¿Qué tan sana la querés?' } },
    ],
  },
  {
    slug: 'crecimiento',
    name: 'Crecimiento personal',
    description: 'Tu trabajo interno: hábitos, conciencia, evolución.',
    iconName: 'sprout',
    accentColor: 'text-lime-400',
    subcategories: [
      { slug: 'autoconocimiento', name: 'Autoconocimiento', description: '¿Cuánto te conocés a vos mismo?', questions: { current: '¿Cuánto te conocés?', desired: '¿Cuánto te querés conocer?' } },
      { slug: 'habitos', name: 'Hábitos', description: 'Las prácticas que sostenés.', questions: { current: '¿Qué tan sólidos son tus hábitos?', desired: '¿Qué tan sólidos los querés?' } },
      { slug: 'reflexion', name: 'Reflexión', description: 'Tiempo para pensar tu vida.', questions: { current: '¿Cuánto tiempo le dedicás a reflexionar?', desired: '¿Cuánto querés dedicarle?' } },
      { slug: 'desafios', name: 'Salir de la zona', description: 'Hacer cosas que te incomodan.', questions: { current: '¿Cuánto salís de tu zona de confort?', desired: '¿Cuánto querés salir?' } },
      { slug: 'mentores', name: 'Mentores / referencias', description: 'Personas que te inspiran a crecer.', questions: { current: '¿Tenés mentores o referencias claras?', desired: '¿Querés tener?' } },
    ],
  },
  {
    slug: 'diversion',
    name: 'Diversión',
    description: 'Lo que hacés porque sí, porque te gusta.',
    iconName: 'smile',
    accentColor: 'text-yellow-400',
    subcategories: [
      { slug: 'tiempo-libre', name: 'Tiempo libre', description: 'Espacio sin obligaciones.', questions: { current: '¿Cuánto tiempo libre tenés?', desired: '¿Cuánto querés tener?' } },
      { slug: 'hobbies', name: 'Hobbies', description: 'Cosas que hacés por placer.', questions: { current: '¿Cuán activos están tus hobbies?', desired: '¿Cuán activos los querés?' } },
      { slug: 'risa', name: 'Risa', description: 'Cuánto te reís.', questions: { current: '¿Cuánto te reís en una semana?', desired: '¿Cuánto querés reírte?' } },
      { slug: 'novedad', name: 'Novedad', description: 'Probar cosas nuevas.', questions: { current: '¿Cuánta novedad hay en tu vida?', desired: '¿Cuánta querés?' } },
      { slug: 'juego', name: 'Capacidad de jugar', description: 'Vivir sin que todo sea productivo.', questions: { current: '¿Cuánto jugás?', desired: '¿Cuánto querés jugar?' } },
    ],
  },
  {
    slug: 'espiritualidad',
    name: 'Espiritualidad',
    description: 'Tu conexión con algo más grande que vos.',
    iconName: 'compass',
    accentColor: 'text-indigo-400',
    subcategories: [
      { slug: 'sentido', name: 'Sentido de la vida', description: '¿Para qué estás acá?', questions: { current: '¿Tenés un sentido claro?', desired: '¿Cuán claro lo querés?' } },
      { slug: 'practica', name: 'Práctica', description: 'Meditación, oración, contemplación.', questions: { current: '¿Tenés alguna práctica regular?', desired: '¿Querés tener?' } },
      { slug: 'naturaleza', name: 'Naturaleza', description: 'Vínculo con lo natural.', questions: { current: '¿Cuánto contacto con la naturaleza tenés?', desired: '¿Cuánto querés?' } },
      { slug: 'misterio', name: 'Apertura al misterio', description: 'Aceptar lo que no se entiende.', questions: { current: '¿Qué tan abierto estás al misterio?', desired: '¿Qué tan abierto querés estar?' } },
      { slug: 'gratitud', name: 'Gratitud', description: 'Capacidad de ver lo bueno.', questions: { current: '¿Qué tan agradecido estás?', desired: '¿Qué tan agradecido querés estar?' } },
    ],
  },
  {
    slug: 'comunidad',
    name: 'Comunidad',
    description: 'Lo que aportás más allá de vos.',
    iconName: 'users-round',
    accentColor: 'text-cyan-400',
    subcategories: [
      { slug: 'pertenencia', name: 'Pertenencia', description: '¿A qué grupo sentís que pertenecés?', questions: { current: '¿Qué tan claro tenés tu pertenencia?', desired: '¿Qué tan claro la querés?' } },
      { slug: 'contribucion', name: 'Contribución', description: 'Lo que aportás al colectivo.', questions: { current: '¿Cuánto contribuís?', desired: '¿Cuánto querés contribuir?' } },
      { slug: 'voluntariado', name: 'Voluntariado', description: 'Tiempo dado sin esperar nada.', questions: { current: '¿Cuánto voluntariado hacés?', desired: '¿Cuánto querés hacer?' } },
      { slug: 'civismo', name: 'Civismo', description: 'Participación cívica activa.', questions: { current: '¿Cuán cívicamente activo estás?', desired: '¿Cuán activo querés estar?' } },
      { slug: 'legado', name: 'Legado', description: 'Lo que dejás para los que vienen.', questions: { current: '¿Cuán claro tenés tu legado?', desired: '¿Cuán claro lo querés?' } },
    ],
  },
  {
    slug: 'hogar',
    name: 'Hogar',
    description: 'El espacio físico donde vivís.',
    iconName: 'home',
    accentColor: 'text-orange-400',
    subcategories: [
      { slug: 'orden', name: 'Orden', description: 'El espacio en orden funcional.', questions: { current: '¿Qué tan ordenado está tu hogar?', desired: '¿Qué tan ordenado lo querés?' } },
      { slug: 'belleza', name: 'Belleza', description: 'Que te guste estar ahí.', questions: { current: '¿Qué tan lindo es tu espacio?', desired: '¿Qué tan lindo lo querés?' } },
      { slug: 'comodidad', name: 'Comodidad', description: 'Funciona para tu vida.', questions: { current: '¿Qué tan cómodo es para vos?', desired: '¿Qué tan cómodo lo querés?' } },
      { slug: 'estabilidad', name: 'Estabilidad habitacional', description: 'No estás por mudarte cada rato.', questions: { current: '¿Qué tan estable está tu situación habitacional?', desired: '¿Qué tan estable la querés?' } },
      { slug: 'entorno', name: 'Entorno barrial', description: 'El barrio que te rodea.', questions: { current: '¿Cuán bien está tu barrio?', desired: '¿Cuán bien lo querés?' } },
    ],
  },
  {
    slug: 'aprendizaje',
    name: 'Aprendizaje',
    description: 'Tu apetito por nuevo conocimiento.',
    iconName: 'book-open',
    accentColor: 'text-teal-400',
    subcategories: [
      { slug: 'curiosidad', name: 'Curiosidad', description: 'Cuánto te interesa lo que no sabés.', questions: { current: '¿Qué tan curioso estás?', desired: '¿Qué tan curioso querés estar?' } },
      { slug: 'lectura', name: 'Lectura', description: 'Cuánto leés en serio.', questions: { current: '¿Cuánto leés?', desired: '¿Cuánto querés leer?' } },
      { slug: 'cursos', name: 'Cursos / formación', description: 'Aprendizaje estructurado.', questions: { current: '¿Cuánto te formás formalmente?', desired: '¿Cuánto querés?' } },
      { slug: 'experimentar', name: 'Experimentar', description: 'Aprender haciendo.', questions: { current: '¿Cuánto experimentás cosas nuevas?', desired: '¿Cuánto querés experimentar?' } },
      { slug: 'enseñar', name: 'Enseñar / compartir', description: 'Pasar lo que sabés.', questions: { current: '¿Cuánto enseñás lo que sabés?', desired: '¿Cuánto querés enseñar?' } },
    ],
  },
];

const db = getDb();

let inserted = { areas: 0, subs: 0, questions: 0 };

for (let areaIdx = 0; areaIdx < AREAS.length; areaIdx++) {
  const area = AREAS[areaIdx];
  if (!area) continue;

  const [existingArea] = await db.select().from(lifeAreas).where(eq(lifeAreas.slug, area.slug)).limit(1);
  let areaId: number;
  if (existingArea) {
    areaId = existingArea.id;
  } else {
    const [row] = await db
      .insert(lifeAreas)
      .values({
        slug: area.slug,
        name: area.name,
        description: area.description,
        iconName: area.iconName,
        accentColor: area.accentColor,
        orderIndex: areaIdx,
      })
      .returning();
    if (!row) throw new Error(`Failed to insert area ${area.slug}`);
    areaId = row.id;
    inserted.areas++;
  }

  for (let subIdx = 0; subIdx < area.subcategories.length; subIdx++) {
    const sub = area.subcategories[subIdx];
    if (!sub) continue;

    const [existingSub] = await db
      .select()
      .from(lifeAreaSubcategories)
      .where(eq(lifeAreaSubcategories.slug, sub.slug))
      .limit(1);

    let subId: number;
    if (existingSub && existingSub.lifeAreaId === areaId) {
      subId = existingSub.id;
    } else if (existingSub) {
      // Slug collision across areas — make it unique by prefixing area slug.
      const altSlug = `${area.slug}-${sub.slug}`;
      const [row] = await db
        .insert(lifeAreaSubcategories)
        .values({
          lifeAreaId: areaId,
          slug: altSlug,
          name: sub.name,
          description: sub.description,
          orderIndex: subIdx,
        })
        .returning();
      if (!row) throw new Error(`Failed to insert sub ${altSlug}`);
      subId = row.id;
      inserted.subs++;
    } else {
      const [row] = await db
        .insert(lifeAreaSubcategories)
        .values({
          lifeAreaId: areaId,
          slug: sub.slug,
          name: sub.name,
          description: sub.description,
          orderIndex: subIdx,
        })
        .returning();
      if (!row) throw new Error(`Failed to insert sub ${sub.slug}`);
      subId = row.id;
      inserted.subs++;
    }

    // current question
    const [existingCurrent] = await db
      .select()
      .from(lifeAreaQuizQuestions)
      .where(eq(lifeAreaQuizQuestions.subcategoryId, subId))
      .limit(1);
    if (!existingCurrent) {
      await db.insert(lifeAreaQuizQuestions).values({
        lifeAreaId: areaId,
        subcategoryId: subId,
        category: 'current',
        questionType: 'scale',
        prompt: sub.questions.current,
        orderIndex: subIdx * 2,
      });
      await db.insert(lifeAreaQuizQuestions).values({
        lifeAreaId: areaId,
        subcategoryId: subId,
        category: 'desired',
        questionType: 'scale',
        prompt: sub.questions.desired,
        orderIndex: subIdx * 2 + 1,
      });
      inserted.questions += 2;
    }
  }
}

process.stdout.write(`Seed complete. Inserted: ${JSON.stringify(inserted)}\n`);
process.exit(0);
