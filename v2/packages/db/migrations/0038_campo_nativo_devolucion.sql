CREATE TABLE "dispositivos_campo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" integer NOT NULL,
	"nombre" text NOT NULL,
	"huella" text NOT NULL,
	"expira" timestamp with time zone NOT NULL,
	"revocado_en" timestamp with time zone,
	CONSTRAINT "dispositivos_campo_huella_unique" UNIQUE("huella")
);
--> statement-breakpoint
CREATE TABLE "tareas_fichas" (
	"tarea_id" integer PRIMARY KEY NOT NULL,
	"ficha_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dispositivos_campo" ADD CONSTRAINT "dispositivos_campo_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas_fichas" ADD CONSTRAINT "tareas_fichas_tarea_id_iniciativa_tasks_id_fk" FOREIGN KEY ("tarea_id") REFERENCES "public"."iniciativa_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tareas_fichas" ADD CONSTRAINT "tareas_fichas_ficha_id_fichas_futuro_id_fk" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dispositivos_campo_usuario_idx" ON "dispositivos_campo" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "tareas_fichas_ficha_idx" ON "tareas_fichas" USING btree ("ficha_id");