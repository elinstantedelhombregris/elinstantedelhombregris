import { db } from './db-neon';
import * as schema from '../shared/schema';

const badgesData = [
  // quiz_complete badges
  {
    name: 'Explorador',
    description: 'Completa tu primera evaluacion en cualquier area',
    iconName: 'Compass',
    rarity: 'common' as const,
    requirementType: 'quiz_complete' as const,
    requirementData: null,
    xpReward: 50,
    seedReward: 10,
  },
  {
    name: 'Cartografo',
    description: 'Completa evaluaciones en 6 areas de vida diferentes',
    iconName: 'Map',
    rarity: 'rare' as const,
    requirementType: 'quiz_complete' as const,
    requirementData: JSON.stringify({ areaCount: 6 }),
    xpReward: 200,
    seedReward: 50,
  },
  {
    name: 'Maestro del Mapa',
    description: 'Completa evaluaciones en las 12 areas de vida',
    iconName: 'Globe',
    rarity: 'epic' as const,
    requirementType: 'quiz_complete' as const,
    requirementData: JSON.stringify({ areaCount: 12 }),
    xpReward: 500,
    seedReward: 150,
  },
  // actions_complete badges
  {
    name: 'Primer Paso',
    description: 'Completa tu primera accion',
    iconName: 'Footprints',
    rarity: 'common' as const,
    requirementType: 'actions_complete' as const,
    requirementData: JSON.stringify({ count: 1 }),
    xpReward: 30,
    seedReward: 5,
  },
  {
    name: 'Dedicado',
    description: 'Completa 5 acciones de mejora',
    iconName: 'Target',
    rarity: 'rare' as const,
    requirementType: 'actions_complete' as const,
    requirementData: JSON.stringify({ count: 5 }),
    xpReward: 150,
    seedReward: 30,
  },
  {
    name: 'Imparable',
    description: 'Completa 20 acciones de mejora',
    iconName: 'Zap',
    rarity: 'epic' as const,
    requirementType: 'actions_complete' as const,
    requirementData: JSON.stringify({ count: 20 }),
    xpReward: 400,
    seedReward: 100,
  },
  // streak badges
  {
    name: 'Constante',
    description: 'Mantene una racha de 7 dias consecutivos',
    iconName: 'Flame',
    rarity: 'rare' as const,
    requirementType: 'streak' as const,
    requirementData: JSON.stringify({ days: 7 }),
    xpReward: 200,
    seedReward: 40,
  },
  {
    name: 'Inquebrantable',
    description: 'Mantene una racha de 30 dias consecutivos',
    iconName: 'Shield',
    rarity: 'epic' as const,
    requirementType: 'streak' as const,
    requirementData: JSON.stringify({ days: 30 }),
    xpReward: 500,
    seedReward: 120,
  },
  {
    name: 'Legendario',
    description: 'Mantene una racha de 90 dias consecutivos',
    iconName: 'Crown',
    rarity: 'legendary' as const,
    requirementType: 'streak' as const,
    requirementData: JSON.stringify({ days: 90 }),
    xpReward: 1000,
    seedReward: 300,
  },
  // score_reach badges
  {
    name: 'En Ascenso',
    description: 'Alcanza un puntaje de 70 o mas en un area',
    iconName: 'TrendingUp',
    rarity: 'common' as const,
    requirementType: 'score_reach' as const,
    requirementData: JSON.stringify({ threshold: 70 }),
    xpReward: 100,
    seedReward: 20,
  },
  {
    name: 'Excelencia',
    description: 'Alcanza un puntaje de 90 o mas en un area',
    iconName: 'Star',
    rarity: 'rare' as const,
    requirementType: 'score_reach' as const,
    requirementData: JSON.stringify({ threshold: 90 }),
    xpReward: 300,
    seedReward: 80,
  },
  {
    name: 'Equilibrio Total',
    description: 'Alcanza un puntaje de 70+ en las 12 areas',
    iconName: 'Gem',
    rarity: 'legendary' as const,
    requirementType: 'score_reach' as const,
    requirementData: JSON.stringify({ threshold: 70, allAreas: true }),
    xpReward: 1500,
    seedReward: 500,
  },
  // mastery badges
  {
    name: 'Aprendiz',
    description: 'Alcanza 25% de maestria en un area',
    iconName: 'BookOpen',
    rarity: 'common' as const,
    requirementType: 'mastery' as const,
    requirementData: JSON.stringify({ percentage: 25, anyArea: true }),
    xpReward: 80,
    seedReward: 15,
  },
  {
    name: 'Experto',
    description: 'Alcanza 75% de maestria en un area',
    iconName: 'Award',
    rarity: 'epic' as const,
    requirementType: 'mastery' as const,
    requirementData: JSON.stringify({ percentage: 75, anyArea: true }),
    xpReward: 600,
    seedReward: 150,
  },
];

const now = new Date();
const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const quarterFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const challengesData = [
  {
    challengeType: 'daily' as const,
    title: 'Accion del Dia',
    description: 'Completa al menos 1 accion de mejora en cualquier area de vida hoy.',
    requirements: JSON.stringify({ type: 'actions_complete', count: 1, timeframe: 'daily' }),
    rewards: JSON.stringify({ xp: 25, seeds: 5 }),
    startDate: now.toISOString(),
    endDate: tomorrow.toISOString(),
    isActive: true,
  },
  {
    challengeType: 'weekly' as const,
    title: 'Semana de Crecimiento',
    description: 'Completa 3 acciones en la misma area de vida durante esta semana.',
    requirements: JSON.stringify({ type: 'actions_in_area', count: 3, timeframe: 'weekly' }),
    rewards: JSON.stringify({ xp: 100, seeds: 25 }),
    startDate: now.toISOString(),
    endDate: weekFromNow.toISOString(),
    isActive: true,
  },
  {
    challengeType: 'weekly' as const,
    title: 'Evaluacion Doble',
    description: 'Completa evaluaciones en 2 areas de vida diferentes esta semana.',
    requirements: JSON.stringify({ type: 'quizzes_complete', count: 2, timeframe: 'weekly' }),
    rewards: JSON.stringify({ xp: 150, seeds: 35 }),
    startDate: now.toISOString(),
    endDate: weekFromNow.toISOString(),
    isActive: true,
  },
  {
    challengeType: 'monthly' as const,
    title: 'Transformacion Mensual',
    description: 'Mejora tu puntaje en 10+ puntos en al menos un area de vida durante este mes.',
    requirements: JSON.stringify({ type: 'score_improvement', points: 10, timeframe: 'monthly' }),
    rewards: JSON.stringify({ xp: 300, seeds: 75 }),
    startDate: now.toISOString(),
    endDate: monthFromNow.toISOString(),
    isActive: true,
  },
  {
    challengeType: 'monthly' as const,
    title: 'Habitos Solidos',
    description: 'Mantene una racha de actividad de al menos 14 dias este mes.',
    requirements: JSON.stringify({ type: 'streak_reach', days: 14, timeframe: 'monthly' }),
    rewards: JSON.stringify({ xp: 250, seeds: 60 }),
    startDate: now.toISOString(),
    endDate: monthFromNow.toISOString(),
    isActive: true,
  },
  {
    challengeType: 'seasonal' as const,
    title: 'Renovacion Estacional',
    description: 'Evalua las 12 areas de vida durante este trimestre para tener un panorama completo.',
    requirements: JSON.stringify({ type: 'all_quizzes', count: 12, timeframe: 'quarterly' }),
    rewards: JSON.stringify({ xp: 750, seeds: 200 }),
    startDate: now.toISOString(),
    endDate: quarterFromNow.toISOString(),
    isActive: true,
  },
  {
    challengeType: 'community' as const,
    title: 'Impacto Colectivo',
    description: 'Unite a otros: cuando 10 usuarios completen la evaluacion de Salud esta semana, todos reciben recompensa.',
    requirements: JSON.stringify({ type: 'community_quizzes', areaName: 'Salud', communityCount: 10, timeframe: 'weekly' }),
    rewards: JSON.stringify({ xp: 200, seeds: 50 }),
    startDate: now.toISOString(),
    endDate: weekFromNow.toISOString(),
    isActive: true,
  },
];

async function seedGamification() {
  try {
    console.log('Seeding life areas gamification...');

    // Seed badges
    console.log(`Insertando ${badgesData.length} badges...`);
    for (const badge of badgesData) {
      await db.insert(schema.lifeAreaBadges).values(badge);
    }
    console.log(`${badgesData.length} badges creados`);

    // Seed challenges
    console.log(`Insertando ${challengesData.length} challenges...`);
    for (const challenge of challengesData) {
      await db.insert(schema.lifeAreaChallenges).values(challenge);
    }
    console.log(`${challengesData.length} challenges creados`);

    console.log('Seed de gamificacion completado!');
  } catch (error) {
    console.error('Error en seed de gamificacion:', error);
    throw error;
  } finally {
    console.log('Done.');
  }
}

seedGamification().catch(console.error);
