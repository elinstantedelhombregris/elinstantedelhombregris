CREATE TABLE "civic_assessment_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"question_id" text NOT NULL,
	"value" real NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "civic_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"questions_version" text NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "civic_profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"scores" json NOT NULL,
	"archetype" text,
	"last_assessment_id" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "civic_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"priority" integer DEFAULT 3 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"target_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"week_start" timestamp with time zone NOT NULL,
	"progress_score" integer NOT NULL,
	"reflection" text,
	"acted_on_goals" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"provider" text,
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"starter_message" text,
	"audience" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coaching_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text,
	"status" text DEFAULT 'open' NOT NULL,
	"template_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "civic_assessment_responses" ADD CONSTRAINT "civic_assessment_responses_assessment_id_civic_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."civic_assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civic_assessments" ADD CONSTRAINT "civic_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civic_profiles" ADD CONSTRAINT "civic_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civic_profiles" ADD CONSTRAINT "civic_profiles_last_assessment_id_civic_assessments_id_fk" FOREIGN KEY ("last_assessment_id") REFERENCES "public"."civic_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "civic_goals" ADD CONSTRAINT "civic_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_checkins" ADD CONSTRAINT "weekly_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_messages" ADD CONSTRAINT "coaching_messages_session_id_coaching_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."coaching_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "civic_assessment_responses_assessment_idx" ON "civic_assessment_responses" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "civic_assessments_user_idx" ON "civic_assessments" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "civic_assessments_status_idx" ON "civic_assessments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "civic_goals_user_status_idx" ON "civic_goals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "civic_goals_category_idx" ON "civic_goals" USING btree ("category");--> statement-breakpoint
CREATE INDEX "weekly_checkins_user_week_idx" ON "weekly_checkins" USING btree ("user_id","week_start" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "coaching_messages_session_idx" ON "coaching_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "coaching_prompts_active_idx" ON "coaching_prompts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coaching_sessions_user_idx" ON "coaching_sessions" USING btree ("user_id","updated_at" DESC NULLS LAST);