CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"target_type" text,
	"target_id" integer,
	"href" text,
	"payload" json,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deduplication_key" text,
	"is_dismissed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geographic_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" text NOT NULL,
	"name" text NOT NULL,
	"iso_code" text,
	"province_id" serial NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_kind_idx" ON "notifications" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "notifications_target_idx" ON "notifications" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "geographic_locations_level_name_unique" ON "geographic_locations" USING btree ("level","name");--> statement-breakpoint
CREATE INDEX "geographic_locations_province_idx" ON "geographic_locations" USING btree ("province_id");