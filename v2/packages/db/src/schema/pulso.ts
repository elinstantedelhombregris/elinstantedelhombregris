/**
 * Pulso (pulse) domain — citizen signals that feed Mandato Vivo.
 *
 * v1 had separate tables for weeklyDigests / digestProposals /
 * proposalStatusHistory + sentiment_analysis fed by an NLP service.
 * We consolidate to:
 *   - pulse_signals: a single user signal (a "pulse"), tagged + scored
 *   - proposals: derived candidate policies (from clustering signals)
 *   - proposal_status_history: audit log of proposal status changes
 *
 * The AI/NLP pipeline (Groq) writes to these tables; the UI reads.
 *
 * ── RETIRADAS (migración 0022, 2026-08-13) ─────────────────────────────────
 *
 * Las cuatro —`pulse_signals`, `proposals`, `proposal_votes` y
 * `proposal_status_history`— **ya no reciben escrituras: toda señal vive en
 * `senales`**, y el apoyo vive en `adhesiones`. Sus tres `POST` responden 410.
 * Se conservan para auditar lo escrito antes del corte; el `DROP` es la Task 36
 * de `docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md`. Cada una
 * lleva el mismo aviso como `COMMENT ON TABLE` en la base.
 */
import { sql } from 'drizzle-orm';
import { index, integer, json, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { cityColumn, geoColumns } from './_geo-columns';
import { geographicLocations } from './geographic';
import { users } from './users';

export const pulseSignals = pgTable(
  'pulse_signals',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    provinceId: integer('province_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    ...cityColumn,
    ...geoColumns,
    /** Free-form citizen statement. */
    body: text('body').notNull(),
    /** Detected sentiment -1..+1. Set by NLP pipeline. */
    sentiment: real('sentiment'),
    /** Detected theme cluster. */
    theme: text('theme'),
    /** Topic tags (NLP-extracted). JSON array of strings. */
    topics: json('topics'),
    /** Source surface that produced this signal: 'mandato_form' | 'community_post' | 'comment' | … */
    source: text('source').notNull().default('mandato_form'),
    /** Polymorphic source reference. */
    sourceId: integer('source_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('pulse_signals_province_idx').on(t.provinceId, t.createdAt.desc()),
    index('pulse_signals_theme_idx').on(t.theme),
    index('pulse_signals_source_idx').on(t.source, t.sourceId),
    index('pulse_signals_geo_idx').on(t.lat, t.lng).where(sql`lat is not null`),
  ],
);

export type PulseSignal = typeof pulseSignals.$inferSelect;
export type NewPulseSignal = typeof pulseSignals.$inferInsert;

/**
 * Derived candidate policies — clusters of pulse signals that the
 * mandato-engine identified as coherent. Citizens vote on them.
 */
export const proposals = pgTable(
  'proposals',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    bodyMarkdown: text('body_markdown'),
    provinceId: integer('province_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
    ...cityColumn,
    ...geoColumns,
    theme: text('theme'),
    /** User who authored this proposal (null = system-derived from NLP pipeline). */
    authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
    /** 'draft' | 'voting' | 'accepted' | 'rejected' | 'archived' */
    status: text('status').notNull().default('draft'),
    /** Aggregate vote score (positive minus negative). */
    voteScore: integer('vote_score').notNull().default(0),
    voteCount: integer('vote_count').notNull().default(0),
    derivedFromSignals: json('derived_from_signals'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('proposals_province_status_idx').on(t.provinceId, t.status),
    index('proposals_theme_idx').on(t.theme),
    index('proposals_author_idx').on(t.authorId),
    index('proposals_geo_idx').on(t.lat, t.lng).where(sql`lat is not null`),
  ],
);

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;

export const proposalVotes = pgTable(
  'proposal_votes',
  {
    proposalId: integer('proposal_id')
      .notNull()
      .references(() => proposals.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** -1 | 0 | +1 — abstain expresses interest without endorsing. */
    value: integer('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('proposal_votes_proposal_idx').on(t.proposalId)],
);

export type ProposalVote = typeof proposalVotes.$inferSelect;
export type NewProposalVote = typeof proposalVotes.$inferInsert;

export const proposalStatusHistory = pgTable(
  'proposal_status_history',
  {
    id: serial('id').primaryKey(),
    proposalId: integer('proposal_id')
      .notNull()
      .references(() => proposals.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status').notNull(),
    toStatus: text('to_status').notNull(),
    changedBy: integer('changed_by').references(() => users.id, { onDelete: 'set null' }),
    note: text('note'),
    changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('proposal_status_history_proposal_idx').on(t.proposalId, t.changedAt.desc())],
);

export type ProposalStatusHistory = typeof proposalStatusHistory.$inferSelect;
export type NewProposalStatusHistory = typeof proposalStatusHistory.$inferInsert;
