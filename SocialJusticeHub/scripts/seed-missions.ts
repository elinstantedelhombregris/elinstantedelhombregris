// Seed script: Create the 5 national mission community posts in La Tribu
// with milestones aligned to temporal phases and initial citizen tasks.
// Run with: npx tsx scripts/seed-missions.ts

import { db } from './db-neon';
import { communityPosts, initiativeMilestones, initiativeTasks } from '../shared/schema';
import { MISSIONS } from '../shared/mission-registry';
import { eq } from 'drizzle-orm';

async function seedMissions() {
  console.log('Seeding 5 national mission workspaces in La Tribu...\n');

  for (const mission of MISSIONS) {
    // Check if mission already exists
    const existing = await db.select()
      .from(communityPosts)
      .where(eq(communityPosts.missionSlug, mission.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏩ Mision ${mission.number}: "${mission.label}" ya existe (id: ${existing[0].id}). Saltando.`);
      continue;
    }

    // Create the mission community post
    const [post] = await db.insert(communityPosts).values({
      userId: 1, // System/admin user
      title: `Misión ${mission.number}: ${mission.label}`,
      description: buildMissionDescription(mission),
      type: 'mission',
      location: 'Argentina',
      participants: 0,
      status: 'active',
      views: 0,
      country: 'Argentina',
      requiresApproval: false,
      memberCount: 0,
      missionSlug: mission.slug,
      settings: JSON.stringify({
        missionNumber: mission.number,
        citizenRoles: mission.citizenRoles,
      }),
    }).returning();

    console.log(`✅ Misión ${mission.number}: "${mission.label}" creada (id: ${post.id})`);

    // Create milestones aligned to temporal phases
    const milestones = getMilestonesForMission(mission);
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      const [milestone] = await db.insert(initiativeMilestones).values({
        postId: post.id,
        title: m.title,
        description: m.description,
        status: 'pending',
        orderIndex: i,
      }).returning();
      console.log(`   📌 Hito: "${m.title}" (id: ${milestone.id})`);
    }

    // Create initial citizen tasks
    const tasks = getTasksForMission(mission);
    for (const t of tasks) {
      await db.insert(initiativeTasks).values({
        postId: post.id,
        title: t.title,
        description: t.description,
        status: 'todo',
        priority: t.priority as 'low' | 'medium' | 'high',
      });
    }
    console.log(`   📋 ${tasks.length} tareas iniciales creadas.\n`);
  }

  console.log('Seed complete.');
}

function buildMissionDescription(mission: typeof MISSIONS[number]): string {
  return [
    mission.whatHurts,
    '',
    `Que juramos garantizar: ${mission.whatWeGuarantee}`,
    '',
    `Esta mision agrupa los planes: ${mission.plans.join(', ')}.`,
    '',
    mission.storyItTells,
  ].join('\n');
}

interface MilestoneData { title: string; description: string }

function getMilestonesForMission(mission: typeof MISSIONS[number]): MilestoneData[] {
  const milestones: MilestoneData[] = [];

  if (mission.whatChanges90Days.length > 0) {
    milestones.push({
      title: 'Emergencia: 0–90 días',
      description: mission.whatChanges90Days.join('. ') + '.',
    });
  }
  if (mission.whatChanges12Months.length > 0) {
    milestones.push({
      title: 'Transición: 3–12 meses',
      description: mission.whatChanges12Months.join('. ') + '.',
    });
  }
  if (mission.whatChanges3Years.length > 0) {
    milestones.push({
      title: 'Consolidación: 1–3 años',
      description: mission.whatChanges3Years.join('. ') + '.',
    });
  }

  return milestones;
}

interface TaskData { title: string; description: string; priority: string }

function getTasksForMission(mission: typeof MISSIONS[number]): TaskData[] {
  // Convert citizen actions into actionable tasks
  return mission.citizenCanDo.map((action, i) => ({
    title: action,
    description: `Rol ciudadano: cualquier persona puede contribuir. Esta tarea forma parte de la Misión ${mission.number}: ${mission.label}.`,
    priority: i === 0 ? 'high' : 'medium',
  }));
}

seedMissions().catch(console.error);
