CREATE TABLE "course_certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"verification_code" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content_path" text NOT NULL,
	"order_index" integer NOT NULL,
	"estimated_minutes" integer,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"kind" text NOT NULL,
	"prompt" text NOT NULL,
	"choices" json,
	"expected_answer" text,
	"explanation" text,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"lesson_id" integer,
	"title" text NOT NULL,
	"description" text,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"cover_image_url" text,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"estimated_hours" real,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_course_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"status" text DEFAULT 'enrolled' NOT NULL,
	"lessons_completed" json DEFAULT '[]'::json NOT NULL,
	"quizzes_passed" json DEFAULT '[]'::json NOT NULL,
	"progress_pct" integer DEFAULT 0 NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_certificates" ADD CONSTRAINT "course_certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_quiz_questions" ADD CONSTRAINT "course_quiz_questions_quiz_id_course_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."course_quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_quizzes" ADD CONSTRAINT "course_quizzes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_quizzes" ADD CONSTRAINT "course_quizzes_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_certificates_code_unique" ON "course_certificates" USING btree ("verification_code");--> statement-breakpoint
CREATE UNIQUE INDEX "course_certificates_user_course_unique" ON "course_certificates" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_lessons_course_slug_unique" ON "course_lessons" USING btree ("course_id","slug");--> statement-breakpoint
CREATE INDEX "course_lessons_course_order_idx" ON "course_lessons" USING btree ("course_id","order_index");--> statement-breakpoint
CREATE INDEX "course_quiz_questions_quiz_idx" ON "course_quiz_questions" USING btree ("quiz_id","order_index");--> statement-breakpoint
CREATE INDEX "course_quizzes_course_idx" ON "course_quizzes" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_slug_unique" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "courses_status_idx" ON "courses" USING btree ("status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "user_course_progress_user_course_unique" ON "user_course_progress" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "user_course_progress_user_status_idx" ON "user_course_progress" USING btree ("user_id","status");