// Seed script: Create mission-pipeline progression challenges (Phase 3)
// These 5 challenges guide a citizen from civic profile discovery to institutional impact.
// Run with: npx tsx scripts/seed-mission-pipeline-challenges.ts
// Idempotent: checks by title before inserting.

import { db } from './db-neon';
import { challenges, challengeSteps } from '../shared/schema';
import { eq } from 'drizzle-orm';

const pipelineChallenges = [
  {
    challenge: {
      level: 1,
      title: 'Descubrí tu Perfil Cívico',
      description: 'Completá la evaluación cívica y el quiz de áreas de vida para conocer tu arquetipo y tu misión recomendada.',
      category: 'action',
      difficulty: 'medium',
      frequency: 'one-time',
      experience: 150,
      duration: null,
      iconName: 'User',
      orderIndex: 20,
      isActive: true,
    },
    steps: [
      {
        title: 'Completá la evaluación cívica',
        description: 'Accedé a /evaluacion y completá la evaluación para conocer tu arquetipo ciudadano.',
        type: 'action',
        orderIndex: 0,
        data: JSON.stringify({ route: '/evaluacion' }),
      },
      {
        title: 'Hacé el quiz de al menos 3 áreas de vida',
        description: 'Respondé el cuestionario de al menos 3 áreas de vida para mapear tu situación actual.',
        type: 'action',
        orderIndex: 1,
        data: JSON.stringify({ minAreas: 3 }),
      },
      {
        title: 'Revisá tu misión recomendada en el dashboard',
        description: 'Ingresá al dashboard y verificá qué misión nacional se alinea con tu perfil.',
        type: 'action',
        orderIndex: 2,
        data: null,
      },
    ],
  },
  {
    challenge: {
      level: 2,
      title: 'Tu Primera Acción Cívica',
      description: 'Unite a una misión nacional y completá tu primera tarea como ciudadano activo. El primer paso es el más importante.',
      category: 'action',
      difficulty: 'medium',
      frequency: 'one-time',
      experience: 200,
      duration: null,
      iconName: 'Flag',
      orderIndex: 21,
      isActive: true,
    },
    steps: [
      {
        title: 'Explorá las 5 misiones nacionales',
        description: 'Revisá las misiones disponibles y entendé el alcance de cada una.',
        type: 'action',
        orderIndex: 0,
        data: null,
      },
      {
        title: 'Elegí tu rol ciudadano y unite a una misión',
        description: 'Seleccioná el rol que mejor se adapta a tus habilidades y sumate a la misión que elegiste.',
        type: 'action',
        orderIndex: 1,
        data: JSON.stringify({ type: 'join_mission' }),
      },
      {
        title: 'Completá tu primera tarea',
        description: 'Tomá una tarea disponible dentro de tu misión y marcala como completada.',
        type: 'action',
        orderIndex: 2,
        data: JSON.stringify({ type: 'task_complete', target: 1 }),
      },
    ],
  },
  {
    challenge: {
      level: 3,
      title: 'Ciclo de Evidencia',
      description: 'Sumá 3 evidencias verificadas en tu misión. Cada evidencia fortalece la rendición de cuentas.',
      category: 'community',
      difficulty: 'medium',
      frequency: 'one-time',
      experience: 300,
      duration: null,
      iconName: 'Camera',
      orderIndex: 22,
      isActive: true,
    },
    steps: [
      {
        title: 'Enviá tu primera evidencia',
        description: 'Registrá tu primera pieza de evidencia documental desde el terreno.',
        type: 'action',
        orderIndex: 0,
        data: JSON.stringify({ type: 'evidence_submit', target: 1 }),
      },
      {
        title: 'Documentá una segunda evidencia con geolocalización',
        description: 'Enviá una segunda evidencia que incluya datos de geolocalización para mayor precisión.',
        type: 'action',
        orderIndex: 1,
        data: JSON.stringify({ type: 'evidence_submit', target: 2, requiresGeo: true }),
      },
      {
        title: 'Completá 3 evidencias verificadas',
        description: 'Alcanzá un total de 3 evidencias que hayan pasado el proceso de verificación ciudadana.',
        type: 'action',
        orderIndex: 2,
        data: JSON.stringify({ type: 'evidence_verified', target: 3 }),
      },
    ],
  },
  {
    challenge: {
      level: 4,
      title: 'Acción Colectiva',
      description: 'Completá 5 tareas en equipo con miembros de tu misión. La fuerza está en el colectivo.',
      category: 'community',
      difficulty: 'medium',
      frequency: 'one-time',
      experience: 400,
      duration: null,
      iconName: 'Users',
      orderIndex: 23,
      isActive: true,
    },
    steps: [
      {
        title: 'Conectá con otros miembros de tu misión',
        description: 'Identificá y contactá a al menos 2 miembros activos dentro de tu misión.',
        type: 'action',
        orderIndex: 0,
        data: JSON.stringify({ type: 'member_connect', target: 2 }),
      },
      {
        title: 'Coordiná una tarea compartida',
        description: 'Organizá con tu equipo la ejecución de una tarea que requiera colaboración.',
        type: 'action',
        orderIndex: 1,
        data: JSON.stringify({ type: 'task_coordinate' }),
      },
      {
        title: 'Completá 5 tareas entre todos',
        description: 'Lográ que el equipo complete un total de 5 tareas colaborativas dentro de la misión.',
        type: 'action',
        orderIndex: 2,
        data: JSON.stringify({ type: 'team_task_complete', target: 5 }),
      },
    ],
  },
  {
    challenge: {
      level: 5,
      title: 'Impacto Institucional',
      description: 'Escribí una crónica de misión y contribuí al tablero de rendición de cuentas. Tu voz transforma.',
      category: 'community',
      difficulty: 'medium',
      frequency: 'one-time',
      experience: 500,
      duration: null,
      iconName: 'BookOpen',
      orderIndex: 24,
      isActive: true,
    },
    steps: [
      {
        title: 'Revisá las crónicas existentes de tu misión',
        description: 'Leé al menos 2 crónicas publicadas por otros narradores en tu misión para entender el estilo y el tono.',
        type: 'reflection',
        orderIndex: 0,
        data: JSON.stringify({ type: 'chronicle_read', target: 2 }),
      },
      {
        title: 'Escribí tu propia crónica narrando el proceso',
        description: 'Redactá una crónica que documente el proceso, las evidencias y el impacto generado por tu misión.',
        type: 'action',
        orderIndex: 1,
        data: JSON.stringify({ type: 'chronicle_draft' }),
      },
      {
        title: 'Publicala y compartila con la tribu',
        description: 'Publicá la crónica en el tablero de rendición de cuentas y compartila con la comunidad.',
        type: 'action',
        orderIndex: 2,
        data: JSON.stringify({ type: 'chronicle_publish' }),
      },
    ],
  },
];

async function seedMissionPipelineChallenges() {
  console.log('Seeding mission-pipeline challenges (Phase 3)...\n');

  for (const entry of pipelineChallenges) {
    const existing = await db.select()
      .from(challenges)
      .where(eq(challenges.title, entry.challenge.title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏩ Challenge ya existe: "${entry.challenge.title}". Saltando.`);
      continue;
    }

    const [challenge] = await db.insert(challenges).values(entry.challenge).returning();

    await db.insert(challengeSteps).values(
      entry.steps.map(step => ({ ...step, challengeId: challenge.id }))
    );

    console.log(`✅ Challenge creado: "${entry.challenge.title}" (id: ${challenge.id}, nivel: ${entry.challenge.level}, XP: ${entry.challenge.experience})`);
  }

  console.log('\nSeed completo.');
}

seedMissionPipelineChallenges().catch(console.error);
