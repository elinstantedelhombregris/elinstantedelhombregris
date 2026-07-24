CREATE TABLE "semillas" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"basta" text NOT NULL,
	"sueno" text NOT NULL,
	"compromiso" text NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "semillas" ADD CONSTRAINT "semillas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "semillas_status_idx" ON "semillas" USING btree ("status");