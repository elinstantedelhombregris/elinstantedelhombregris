// Seed script: Create mission-specific gamification challenges
// Connects the gamification system to the 5 national missions.
// Run with: npx tsx scripts/seed-mission-challenges.ts
// Idempotent: checks by title before inserting.

import { db } from './db-neon';
import { challenges, challengeSteps } from '../shared/schema';
import { MISSIONS } from '../shared/mission-registry';
import { eq } from 'drizzle-orm';

async function seedMissionChallenges() {
  console.log('Seeding mission-specific challenges...\n');

  // ─── Per-mission evidence challenges (one per mission) ───────────────────

  for (const mission of MISSIONS) {
    const title = `Documenta la realidad: ${mission.label}`;

    const existing = await db.select()
      .from(challenges)
      .where(eq(challenges.title, title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏩ Challenge ya existe: "${title}". Saltando.`);
      continue;
    }

    const [challenge] = await db.insert(challenges).values({
      level: 3,
      title,
      description: `Envia 3 evidencias verificables para la mision ${mission.label}. Cada pieza de evidencia fortalece la rendicion de cuentas.`,
      category: 'action',
      difficulty: 'medium',
      frequency: 'one-time',
      experience: 200,
      duration: null,
      iconName: 'Camera',
      orderIndex: mission.number,
      isActive: true,
    }).returning();

    await db.insert(challengeSteps).values([
      {
        challengeId: challenge.id,
        title: 'Unite a la mision',
        description: `Elegi un rol ciudadano y sumate a la mision ${mission.shortLabel}`,
        type: 'action',
        orderIndex: 0,
        data: JSON.stringify({ missionSlug: mission.slug, type: 'evidence', target: 3 }),
      },
      {
        challengeId: challenge.id,
        title: 'Documenta una primera evidencia',
        description: 'Registra tu primera pieza de evidencia desde el terreno',
        type: 'action',
        orderIndex: 1,
        data: null,
      },
      {
        challengeId: challenge.id,
        title: 'Completa 3 evidencias',
        description: 'Envia un total de 3 evidencias para esta mision',
        type: 'action',
        orderIndex: 2,
        data: null,
      },
    ]);

    console.log(`✅ Challenge creado: "${title}" (id: ${challenge.id}, XP: 200)`);
  }

  // ─── Cross-mission role challenges ───────────────────────────────────────

  const crossMissionChallenges = [
    {
      challenge: {
        level: 2,
        title: 'Constructor Activo',
        description: 'Completa tu primera tarea como Constructor en cualquier mision. El cambio se construye con las manos.',
        category: 'action',
        difficulty: 'easy',
        frequency: 'one-time',
        experience: 150,
        duration: null,
        iconName: 'Hammer',
        orderIndex: 10,
        isActive: true,
      },
      steps: [
        {
          title: 'Unite como Constructor',
          description: 'Elegi el rol de Constructor en cualquier mision activa',
          type: 'action',
          orderIndex: 0,
          data: JSON.stringify({ type: 'task_complete', role: 'constructor', target: 1 }),
        },
        {
          title: 'Toma una tarea',
          description: 'Asignate una tarea disponible en la mision que elegiste',
          type: 'action',
          orderIndex: 1,
          data: null,
        },
        {
          title: 'Completala',
          description: 'Marca la tarea como completada y registra el resultado',
          type: 'action',
          orderIndex: 2,
          data: null,
        },
      ],
    },
    {
      challenge: {
        level: 3,
        title: 'Custodio Cívico',
        description: 'Verifica 5 evidencias como Custodio. Tu mirada protege la verdad del proceso.',
        category: 'community',
        difficulty: 'medium',
        frequency: 'one-time',
        experience: 300,
        duration: null,
        iconName: 'Shield',
        orderIndex: 11,
        isActive: true,
      },
      steps: [
        {
          title: 'Unite como Custodio',
          description: 'Elegi el rol de Custodio en cualquier mision activa',
          type: 'action',
          orderIndex: 0,
          data: JSON.stringify({ type: 'evidence_verify', role: 'custodio', target: 5 }),
        },
        {
          title: 'Verifica tu primera evidencia',
          description: 'Revisa y valida tu primera pieza de evidencia ciudadana',
          type: 'action',
          orderIndex: 1,
          data: null,
        },
        {
          title: 'Alcanza 5 verificaciones',
          description: 'Completa un total de 5 verificaciones de evidencia',
          type: 'action',
          orderIndex: 2,
          data: null,
        },
      ],
    },
    {
      challenge: {
        level: 3,
        title: 'Narrador del Proceso',
        description: 'Publica tu primera crónica como Narrador. El relato es el puente entre la prueba y el pueblo.',
        category: 'community',
        difficulty: 'medium',
        frequency: 'one-time',
        experience: 250,
        duration: null,
        iconName: 'BookOpen',
        orderIndex: 12,
        isActive: true,
      },
      steps: [
        {
          title: 'Unite como Narrador',
          description: 'Elegi el rol de Narrador en cualquier mision activa',
          type: 'action',
          orderIndex: 0,
          data: JSON.stringify({ type: 'chronicle_publish', role: 'narrador', target: 1 }),
        },
        {
          title: 'Lee las evidencias verificadas',
          description: 'Revisá las evidencias ya verificadas en la mision que elegiste',
          type: 'reflection',
          orderIndex: 1,
          data: null,
        },
        {
          title: 'Publica tu primera cronica',
          description: 'Redactá y publicá una crónica basada en las evidencias revisadas',
          type: 'action',
          orderIndex: 2,
          data: null,
        },
      ],
    },
    {
      challenge: {
        level: 1,
        title: 'Fundador',
        description: 'Se de los primeros 10 miembros en cualquier mision nacional. Los que llegan primero encienden el fuego.',
        category: 'community',
        difficulty: 'easy',
        frequency: 'one-time',
        experience: 100,
        duration: null,
        iconName: 'Flame',
        orderIndex: 13,
        isActive: true,
      },
      steps: [
        {
          title: 'Explora las misiones',
          description: 'Revisá las 5 misiones nacionales y encontrá la que resuena con vos',
          type: 'action',
          orderIndex: 0,
          data: JSON.stringify({ type: 'early_member', target: 10 }),
        },
        {
          title: 'Elegí tu rol',
          description: 'Seleccioná el rol ciudadano con el que vas a contribuir',
          type: 'action',
          orderIndex: 1,
          data: null,
        },
        {
          title: 'Sumate a una mision',
          description: 'Unite antes de que haya 10 miembros y quedá registrado como fundador',
          type: 'action',
          orderIndex: 2,
          data: null,
        },
      ],
    },
  ];

  for (const entry of crossMissionChallenges) {
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

    console.log(`✅ Challenge creado: "${entry.challenge.title}" (id: ${challenge.id}, XP: ${entry.challenge.experience})`);
  }

  console.log('\nSeed complete.');
}

seedMissionChallenges().catch(console.error);
