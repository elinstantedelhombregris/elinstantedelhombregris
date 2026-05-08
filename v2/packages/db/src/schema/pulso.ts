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
 */
import { sql } from 'drizzle-orm';
import { index, integer, json, pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';

 
import { geographicLocations } from './geographic';
import { users } from './users';

export const pulseSignals = pgTable(
  'pulse_signals',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
    provinceId: integer('province_id').references(() => geographicLocations.id, { onDelete: 'set null' }),
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
    theme: text('theme'),
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
