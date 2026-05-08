CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"kind" text NOT NULL,
	"url" text,
	"image_url" text,
	"topic" text,
	"is_published" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"url" text,
	"location" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dreams" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"submitted_as" text,
	"body" text NOT NULL,
	"category" text,
	"province_id" integer,
	"city_id" integer,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"kind" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_response" text,
	"page_url" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_resources" ADD CONSTRAINT "user_resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dreams" ADD CONSTRAINT "dreams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dreams" ADD CONSTRAINT "dreams_province_id_geographic_locations_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dreams" ADD CONSTRAINT "dreams_city_id_geographic_locations_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_feedback" ADD CONSTRAINT "platform_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resources_kind_idx" ON "resources" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "resources_topic_idx" ON "resources" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "user_resources_user_idx" ON "user_resources" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_resources_kind_status_idx" ON "user_resources" USING btree ("kind","status");--> statement-breakpoint
CREATE INDEX "dreams_province_idx" ON "dreams" USING btree ("province_id");--> statement-breakpoint
CREATE INDEX "dreams_category_idx" ON "dreams" USING btree ("category");--> statement-breakpoint
CREATE INDEX "dreams_status_idx" ON "dreams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "platform_feedback_status_idx" ON "platform_feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "platform_feedback_kind_idx" ON "platform_feedback" USING btree ("kind");