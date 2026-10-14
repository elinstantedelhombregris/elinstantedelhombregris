CREATE TABLE "prueba_ejecuciones" (
	"prueba_id" uuid PRIMARY KEY NOT NULL,
	"iniciativa_id" integer NOT NULL,
	"tarea_id" integer NOT NULL,
	"hito_id" integer NOT NULL,
	"creador_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"huella" text NOT NULL,
	"recursos" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ejecucion_envio_unique" UNIQUE("creador_id","id_local"),
	CONSTRAINT "ejecucion_tarea_unique" UNIQUE("tarea_id"),
	CONSTRAINT "ejecucion_hito_unique" UNIQUE("hito_id")
);
--> statement-breakpoint
ALTER TABLE "prueba_ejecuciones" ADD CONSTRAINT "prueba_ejecuciones_prueba_id_pruebas_territoriales_id_fk" FOREIGN KEY ("prueba_id") REFERENCES "public"."pruebas_territoriales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prueba_ejecuciones" ADD CONSTRAINT "prueba_ejecuciones_iniciativa_id_iniciativas_id_fk" FOREIGN KEY ("iniciativa_id") REFERENCES "public"."iniciativas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prueba_ejecuciones" ADD CONSTRAINT "prueba_ejecuciones_tarea_id_iniciativa_tasks_id_fk" FOREIGN KEY ("tarea_id") REFERENCES "public"."iniciativa_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prueba_ejecuciones" ADD CONSTRAINT "prueba_ejecuciones_hito_id_iniciativa_milestones_id_fk" FOREIGN KEY ("hito_id") REFERENCES "public"."iniciativa_milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prueba_ejecuciones" ADD CONSTRAINT "prueba_ejecuciones_creador_id_users_id_fk" FOREIGN KEY ("creador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;