/**
 * Iniciativas domain.
 *
 * Initiatives are the user-facing primitive of the ¡BASTA! framework:
 * a group of citizens organizing around a goal, mission, or PLAN.
 * Each PLAN (PLANSUS, PLANEB, PLANRUTA, …) is itself an "official"
 * initiative — these have content authored as MDX in content/planes/.
 *
 * v1 had 10 separate tables; we keep that shape because each side
 * (members / milestones / messages / tasks / activity / requests) has
 * its own access patterns.
 */
import { sql } from 'drizzle-orm';
import { boolean, index, integer, json, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

 
import { users } from './users';

export const iniciativas = pgTable(
  'iniciativas',
  {
    id: serial('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    /** 'plan' (one of the 22 ¡BASTA! PLANs) | 'mission' | 'community' | 'territorial' */
    kind: text('kind').notNull(),
    /** When kind='plan', this is the PLAN code (e.g. 'PLANSUS'). */
    planCode: text('plan_code'),
    /** Body lives as MDX for kind='plan'; otherwise free-form on the row. */
    bodyMarkdown: text('body_markdown'),
    coverImageUrl: text('cover_image_url'),
    createdByUserId: integer('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
    /** 'draft' | 'open' | 'in_progress' | 'paused' | 'archived' | 'completed' */
    status: text('status').notNull().default('open'),
    memberCount: integer('member_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('iniciativas_slug_unique').on(t.slug),
    index('iniciativas_kind_status_idx').on(t.kind, t.status),
    index('iniciativas_plan_code_idx').on(t.planCode),
  ],
);

export type Iniciativa = typeof iniciativas.$inferSelect;
export type NewIniciativa = typeof iniciativas.$inferInsert;

export const iniciativaMembers = pgTable(
  'iniciativa_members',
  {
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** 'owner' | 'admin' | 'member' */
    role: text('role').notNull().default('member'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('iniciativa_members_unique').on(t.iniciativaId, t.userId),
    index('iniciativa_members_user_idx').on(t.userId),
  ],
);

export type IniciativaMember = typeof iniciativaMembers.$inferSelect;
export type NewIniciativaMember = typeof iniciativaMembers.$inferInsert;

export const iniciativaMilestones = pgTable(
  'iniciativa_milestones',
  {
    id: serial('id').primaryKey(),
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    targetDate: timestamp('target_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    orderIndex: integer('order_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('iniciativa_milestones_iniciativa_idx').on(t.iniciativaId, t.orderIndex)],
);

export type IniciativaMilestone = typeof iniciativaMilestones.$inferSelect;
export type NewIniciativaMilestone = typeof iniciativaMilestones.$inferInsert;

export const iniciativaTasks = pgTable(
  'iniciativa_tasks',
  {
    id: serial('id').primaryKey(),
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id, { onDelete: 'cascade' }),
    milestoneId: integer('milestone_id').references(() => iniciativaMilestones.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    assigneeId: integer('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    /** 'todo' | 'in_progress' | 'done' | 'blocked' */
    status: text('status').notNull().default('todo'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('iniciativa_tasks_iniciativa_idx').on(t.iniciativaId),
    index('iniciativa_tasks_assignee_idx').on(t.assigneeId, t.status),
  ],
);

export type IniciativaTask = typeof iniciativaTasks.$inferSelect;
export type NewIniciativaTask = typeof iniciativaTasks.$inferInsert;

export const iniciativaMessages = pgTable(
  'iniciativa_messages',
  {
    id: serial('id').primaryKey(),
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    /** Optional reply-to id for threaded messages. */
    parentId: integer('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('iniciativa_messages_iniciativa_idx').on(t.iniciativaId, t.createdAt.desc())],
);

export type IniciativaMessage = typeof iniciativaMessages.$inferSelect;
export type NewIniciativaMessage = typeof iniciativaMessages.$inferInsert;

export const iniciativaActivity = pgTable(
  'iniciativa_activity',
  {
    id: serial('id').primaryKey(),
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id, { onDelete: 'cascade' }),
    actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
    /** Discriminator: 'task.created' | 'milestone.completed' | 'member.joined' | … */
    kind: text('kind').notNull(),
    /** Renderer payload — shape per kind. */
    payload: json('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('iniciativa_activity_iniciativa_idx').on(t.iniciativaId, t.createdAt.desc())],
);

export type IniciativaActivity = typeof iniciativaActivity.$inferSelect;
export type NewIniciativaActivity = typeof iniciativaActivity.$inferInsert;

export const membershipRequests = pgTable(
  'membership_requests',
  {
    id: serial('id').primaryKey(),
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    message: text('message'),
    /** 'pending' | 'approved' | 'rejected' | 'cancelled' */
    status: text('status').notNull().default('pending'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('membership_requests_unique')
      .on(t.iniciativaId, t.userId)
      .where(sql`status = 'pending'`),
    index('membership_requests_iniciativa_idx').on(t.iniciativaId),
  ],
);

export type MembershipRequest = typeof membershipRequests.$inferSelect;
export type NewMembershipRequest = typeof membershipRequests.$inferInsert;

/**
 * Mission evidence — proof of completion uploaded by initiative
 * members (photo, video, signed document, link).
 */
export const missionEvidence = pgTable(
  'mission_evidence',
  {
    id: serial('id').primaryKey(),
    iniciativaId: integer('iniciativa_id')
      .notNull()
      .references(() => iniciativas.id, { onDelete: 'cascade' }),
    submittedBy: integer('submitted_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** 'photo' | 'video' | 'document' | 'link' | 'text' */
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    url: text('url'),
    isVerified: boolean('is_verified').notNull().default(false),
    verifiedBy: integer('verified_by').references(() => users.id, { onDelete: 'set null' }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('mission_evidence_iniciativa_idx').on(t.iniciativaId, t.createdAt.desc())],
);

export type MissionEvidence = typeof missionEvidence.$inferSelect;
export type NewMissionEvidence = typeof missionEvidence.$inferInsert;
