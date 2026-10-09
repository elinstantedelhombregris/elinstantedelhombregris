CREATE TABLE "colaboraciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"objeto" uuid NOT NULL,
	"creador_id" integer NOT NULL,
	"usuario_id" integer,
	"codigo_hash" text NOT NULL,
	"rol" text NOT NULL,
	"vence_en" timestamp with time zone NOT NULL,
	"aceptada_en" timestamp with time zone,
	"revocada_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "preferencias_civicas" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"avisos" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revisiones_devolucion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campana_id" uuid NOT NULL,
	"autor_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"texto" text NOT NULL,
	"respuesta" text,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"respondida_en" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "contribuciones" ADD COLUMN "modo" text DEFAULT 'personal' NOT NULL;--> statement-breakpoint
ALTER TABLE "colaboraciones" ADD CONSTRAINT "colaboraciones_creador_id_users_id_fk" FOREIGN KEY ("creador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colaboraciones" ADD CONSTRAINT "colaboraciones_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferencias_civicas" ADD CONSTRAINT "preferencias_civicas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisiones_devolucion" ADD CONSTRAINT "revisiones_devolucion_campana_id_campanas_id_fk" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisiones_devolucion" ADD CONSTRAINT "revisiones_devolucion_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "colaboraciones_codigo_unique" ON "colaboraciones" USING btree ("codigo_hash");--> statement-breakpoint
CREATE INDEX "colaboraciones_objeto_idx" ON "colaboraciones" USING btree ("tipo","objeto");--> statement-breakpoint
CREATE UNIQUE INDEX "revisiones_devolucion_autor_envio_unique" ON "revisiones_devolucion" USING btree ("autor_id","id_local");