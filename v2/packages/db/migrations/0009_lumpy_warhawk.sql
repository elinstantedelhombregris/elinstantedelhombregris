CREATE TABLE "life_area_action_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"reflection" text,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_area_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"life_area_id" integer NOT NULL,
	"subcategory_id" integer,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"xp_reward" integer DEFAULT 10 NOT NULL,
	"currency_reward" integer DEFAULT 0 NOT NULL,
	"estimated_minutes" integer,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_area_chests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"life_area_id" integer NOT NULL,
	"tier" text DEFAULT 'common' NOT NULL,
	"reward" json NOT NULL,
	"claimed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_area_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"life_area_id" integer NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"shared_at" timestamp with time zone,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_area_quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"life_area_id" integer NOT NULL,
	"subcategory_id" integer,
	"category" text DEFAULT 'current' NOT NULL,
	"question_type" text DEFAULT 'scale' NOT NULL,
	"prompt" text NOT NULL,
	"choices" json,
	"order_index" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_area_quiz_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"current_value" integer,
	"desired_value" integer,
	"text_value" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_area_subcategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"life_area_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_area_xp_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"life_area_id" integer NOT NULL,
	"kind" text NOT NULL,
	"xp_delta" integer NOT NULL,
	"source_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon_name" text,
	"accent_color" text,
	"order_index" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_life_area_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"life_area_id" integer NOT NULL,
	"current_score" real DEFAULT 0 NOT NULL,
	"desired_score" real DEFAULT 0 NOT NULL,
	"gap" real DEFAULT 0 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"mastery" integer DEFAULT 0 NOT NULL,
	"currency" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"longest_streak_days" integer DEFAULT 0 NOT NULL,
	"last_active_date" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "life_area_action_completions" ADD CONSTRAINT "life_area_action_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_action_completions" ADD CONSTRAINT "life_area_action_completions_action_id_life_area_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."life_area_actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_actions" ADD CONSTRAINT "life_area_actions_life_area_id_life_areas_id_fk" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_actions" ADD CONSTRAINT "life_area_actions_subcategory_id_life_area_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."life_area_subcategories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_chests" ADD CONSTRAINT "life_area_chests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_chests" ADD CONSTRAINT "life_area_chests_life_area_id_life_areas_id_fk" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_milestones" ADD CONSTRAINT "life_area_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_milestones" ADD CONSTRAINT "life_area_milestones_life_area_id_life_areas_id_fk" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_quiz_questions" ADD CONSTRAINT "life_area_quiz_questions_life_area_id_life_areas_id_fk" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_quiz_questions" ADD CONSTRAINT "life_area_quiz_questions_subcategory_id_life_area_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."life_area_subcategories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_quiz_responses" ADD CONSTRAINT "life_area_quiz_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_quiz_responses" ADD CONSTRAINT "life_area_quiz_responses_question_id_life_area_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."life_area_quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_subcategories" ADD CONSTRAINT "life_area_subcategories_life_area_id_life_areas_id_fk" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_xp_log" ADD CONSTRAINT "life_area_xp_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_area_xp_log" ADD CONSTRAINT "life_area_xp_log_life_area_id_life_areas_id_fk" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_life_area_state" ADD CONSTRAINT "user_life_area_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_life_area_state" ADD CONSTRAINT "user_life_area_state_life_area_id_life_areas_id_fk" FOREIGN KEY ("life_area_id") REFERENCES "public"."life_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "life_area_action_completions_user_idx" ON "life_area_action_completions" USING btree ("user_id","completed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "life_area_action_completions_action_idx" ON "life_area_action_completions" USING btree ("action_id");--> statement-breakpoint
CREATE INDEX "life_area_actions_area_idx" ON "life_area_actions" USING btree ("life_area_id");--> statement-breakpoint
CREATE INDEX "life_area_chests_user_unclaimed_idx" ON "life_area_chests" USING btree ("user_id","claimed_at");--> statement-breakpoint
CREATE INDEX "life_area_chests_area_idx" ON "life_area_chests" USING btree ("life_area_id");--> statement-breakpoint
CREATE INDEX "life_area_milestones_user_area_idx" ON "life_area_milestones" USING btree ("user_id","life_area_id","achieved_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "life_area_quiz_questions_area_idx" ON "life_area_quiz_questions" USING btree ("life_area_id","order_index");--> statement-breakpoint
CREATE INDEX "life_area_quiz_questions_category_idx" ON "life_area_quiz_questions" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "life_area_quiz_responses_unique" ON "life_area_quiz_responses" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "life_area_quiz_responses_user_idx" ON "life_area_quiz_responses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "life_area_subcategories_unique" ON "life_area_subcategories" USING btree ("life_area_id","slug");--> statement-breakpoint
CREATE INDEX "life_area_subcategories_area_idx" ON "life_area_subcategories" USING btree ("life_area_id","order_index");--> statement-breakpoint
CREATE INDEX "life_area_xp_log_user_idx" ON "life_area_xp_log" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "life_areas_slug_unique" ON "life_areas" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "user_life_area_state_unique" ON "user_life_area_state" USING btree ("user_id","life_area_id");--> statement-breakpoint
CREATE INDEX "user_life_area_state_user_idx" ON "user_life_area_state" USING btree ("user_id");