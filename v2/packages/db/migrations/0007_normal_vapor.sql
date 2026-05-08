CREATE TABLE "iniciativa_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"iniciativa_id" integer NOT NULL,
	"actor_id" integer,
	"kind" text NOT NULL,
	"payload" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iniciativa_members" (
	"iniciativa_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iniciativa_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"iniciativa_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"body" text NOT NULL,
	"parent_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iniciativa_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"iniciativa_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iniciativa_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"iniciativa_id" integer NOT NULL,
	"milestone_id" integer,
	"title" text NOT NULL,
	"description" text,
	"assignee_id" integer,
	"status" text DEFAULT 'todo' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iniciativas" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"kind" text NOT NULL,
	"plan_code" text,
	"body_markdown" text,
	"cover_image_url" text,
	"created_by_user_id" integer,
	"status" text DEFAULT 'open' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"iniciativa_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"iniciativa_id" integer NOT NULL,
	"submitted_by" integer NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"url" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_by" integer,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandate_suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"province_id" integer,
	"body" text NOT NULL,
	"theme" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"support_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "territory_mandates" (
	"id" serial PRIMARY KEY NOT NULL,
	"province_id" integer,
	"top_themes" json,
	"sentiment" real,
	"pulse_count" integer DEFAULT 0 NOT NULL,
	"last_computed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"changed_by" integer,
	"note" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_votes" (
	"proposal_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body_markdown" text,
	"province_id" integer,
	"theme" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"vote_score" integer DEFAULT 0 NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"derived_from_signals" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"province_id" integer,
	"body" text NOT NULL,
	"sentiment" real,
	"theme" text,
	"topics" json,
	"source" text DEFAULT 'mandato_form' NOT NULL,
	"source_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iniciativa_activity" ADD CONSTRAINT "iniciativa_activity_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_activity" ADD CONSTRAINT "iniciativa_activity_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_members" ADD CONSTRAINT "iniciativa_members_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_members" ADD CONSTRAINT "iniciativa_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_messages" ADD CONSTRAINT "iniciativa_messages_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_messages" ADD CONSTRAINT "iniciativa_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_milestones" ADD CONSTRAINT "iniciativa_milestones_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD CONSTRAINT "iniciativa_tasks_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD CONSTRAINT "iniciativa_tasks_milestone_id_iniciativa_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."iniciativa_milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD CONSTRAINT "iniciativa_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativas" ADD CONSTRAINT "iniciativas_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD CONSTRAINT "mission_evidence_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD CONSTRAINT "mission_evidence_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD CONSTRAINT "mission_evidence_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandate_suggestions" ADD CONSTRAINT "mandate_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandate_suggestions" ADD CONSTRAINT "mandate_suggestions_province_id_geographic_locations_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "territory_mandates" ADD CONSTRAINT "territory_mandates_province_id_geographic_locations_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_status_history" ADD CONSTRAINT "proposal_status_history_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_status_history" ADD CONSTRAINT "proposal_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_votes" ADD CONSTRAINT "proposal_votes_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_votes" ADD CONSTRAINT "proposal_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_province_id_geographic_locations_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD CONSTRAINT "pulse_signals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD CONSTRAINT "pulse_signals_province_id_geographic_locations_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "iniciativa_activity_iniciativa_idx" ON "iniciativa_activity" USING btree ("iniciativa_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "iniciativa_members_unique" ON "iniciativa_members" USING btree ("iniciativa_id","user_id");--> statement-breakpoint
CREATE INDEX "iniciativa_members_user_idx" ON "iniciativa_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "iniciativa_messages_iniciativa_idx" ON "iniciativa_messages" USING btree ("iniciativa_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "iniciativa_milestones_iniciativa_idx" ON "iniciativa_milestones" USING btree ("iniciativa_id","order_index");--> statement-breakpoint
CREATE INDEX "iniciativa_tasks_iniciativa_idx" ON "iniciativa_tasks" USING btree ("iniciativa_id");--> statement-breakpoint
CREATE INDEX "iniciativa_tasks_assignee_idx" ON "iniciativa_tasks" USING btree ("assignee_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "iniciativas_slug_unique" ON "iniciativas" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "iniciativas_kind_status_idx" ON "iniciativas" USING btree ("kind","status");--> statement-breakpoint
CREATE INDEX "iniciativas_plan_code_idx" ON "iniciativas" USING btree ("plan_code");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_requests_unique" ON "membership_requests" USING btree ("iniciativa_id","user_id") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "membership_requests_iniciativa_idx" ON "membership_requests" USING btree ("iniciativa_id");--> statement-breakpoint
CREATE INDEX "mission_evidence_iniciativa_idx" ON "mission_evidence" USING btree ("iniciativa_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "mandate_suggestions_province_idx" ON "mandate_suggestions" USING btree ("province_id");--> statement-breakpoint
CREATE INDEX "mandate_suggestions_theme_idx" ON "mandate_suggestions" USING btree ("theme");--> statement-breakpoint
CREATE INDEX "mandate_suggestions_status_idx" ON "mandate_suggestions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "territory_mandates_province_unique" ON "territory_mandates" USING btree ("province_id");--> statement-breakpoint
CREATE INDEX "proposal_status_history_proposal_idx" ON "proposal_status_history" USING btree ("proposal_id","changed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "proposal_votes_proposal_idx" ON "proposal_votes" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposals_province_status_idx" ON "proposals" USING btree ("province_id","status");--> statement-breakpoint
CREATE INDEX "proposals_theme_idx" ON "proposals" USING btree ("theme");--> statement-breakpoint
CREATE INDEX "pulse_signals_province_idx" ON "pulse_signals" USING btree ("province_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pulse_signals_theme_idx" ON "pulse_signals" USING btree ("theme");--> statement-breakpoint
CREATE INDEX "pulse_signals_source_idx" ON "pulse_signals" USING btree ("source","source_id");