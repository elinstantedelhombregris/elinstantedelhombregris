CREATE TABLE "iniciativa_recibos" (
	"usuario_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"huella" text NOT NULL,
	"resultado" jsonb NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "iniciativa_recibos_usuario_id_id_local_pk" PRIMARY KEY("usuario_id","id_local")
);
--> statement-breakpoint
ALTER TABLE "iniciativa_milestones" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD COLUMN "created_by_id" integer;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD COLUMN "accepted_name" text;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD COLUMN "escucha" jsonb;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD COLUMN "resources" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "iniciativas" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "iniciativas" ADD COLUMN "proposed_owner_id" integer;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD COLUMN "task_id" integer;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD COLUMN "withdrawn_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD COLUMN "resultado_escucha" jsonb;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD COLUMN "reviewer_name" text;--> statement-breakpoint
ALTER TABLE "iniciativa_recibos" ADD CONSTRAINT "iniciativa_recibos_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativa_tasks" ADD CONSTRAINT "iniciativa_tasks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iniciativas" ADD CONSTRAINT "iniciativas_proposed_owner_id_users_id_fk" FOREIGN KEY ("proposed_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_evidence" ADD CONSTRAINT "mission_evidence_task_id_iniciativa_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."iniciativa_tasks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Conciliar contadores anteriores antes de usar la membresía atómica.
UPDATE iniciativas i SET member_count = (SELECT count(*)::int FROM iniciativa_members m WHERE m.iniciativa_id=i.id);
