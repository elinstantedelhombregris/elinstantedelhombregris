CREATE TABLE "campana_devoluciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campana_id" uuid NOT NULL,
	"edicion" integer NOT NULL,
	"texto" text NOT NULL,
	"limites" text NOT NULL,
	"senal_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campana_ediciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campana_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"contrato" jsonb NOT NULL,
	"estado" text NOT NULL,
	"motivo" text NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campana_edicion_unique" UNIQUE("campana_id","revision")
);
--> statement-breakpoint
CREATE TABLE "campanas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"creador_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"contrato" jsonb NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campanas_slug_unique" UNIQUE("slug"),
	CONSTRAINT "campanas_envio_unique" UNIQUE("creador_id","id_local"),
	CONSTRAINT "campanas_revision_chk" CHECK ("campanas"."revision">0),
	CONSTRAINT "campanas_estado_chk" CHECK ("campanas"."estado" in ('borrador','programada','abierta','pausada','en_devolucion','cerrada'))
);
--> statement-breakpoint
CREATE TABLE "contribuciones" (
	"senal_id" uuid PRIMARY KEY NOT NULL,
	"campana_id" uuid,
	"edicion" integer,
	"fragmentos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confirmada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contribucion_contexto_chk" CHECK (("contribuciones"."campana_id" is null) = ("contribuciones"."edicion" is null))
);
--> statement-breakpoint
CREATE TABLE "analisis_guardados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"nombre" text NOT NULL,
	"consulta" jsonb NOT NULL,
	"corte" timestamp with time zone,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos_civicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"clave" text NOT NULL,
	"titulo" text NOT NULL,
	"href" text NOT NULL,
	"leido_en" timestamp with time zone,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "eventos_civicos_usuario_clave_unique" UNIQUE("user_id","clave")
);
--> statement-breakpoint
CREATE TABLE "seguimientos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"objeto" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seguimientos_usuario_objeto_unique" UNIQUE("user_id","tipo","objeto")
);
--> statement-breakpoint
CREATE TABLE "ficha_afirmaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ficha_id" uuid NOT NULL,
	"creador_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"texto" text NOT NULL,
	"retirada_en" timestamp with time zone,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "afirmacion_envio_unique" UNIQUE("creador_id","id_local")
);
--> statement-breakpoint
CREATE TABLE "ficha_alternativas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ficha_id" uuid NOT NULL,
	"creador_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"contenido" jsonb NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alternativa_envio_unique" UNIQUE("creador_id","id_local")
);
--> statement-breakpoint
CREATE TABLE "opiniones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"afirmacion_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"valor" text NOT NULL,
	"mostrada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"respondida_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opinion_usuario_afirmacion_unique" UNIQUE("afirmacion_id","user_id"),
	CONSTRAINT "opinion_valor_chk" CHECK ("opiniones"."valor" in ('acuerdo','desacuerdo','paso'))
);
--> statement-breakpoint
CREATE TABLE "prueba_eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prueba_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"autor_id" integer NOT NULL,
	"estado" text NOT NULL,
	"observacion" text NOT NULL,
	"evidencia" jsonb NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prueba_evento_revision_unique" UNIQUE("prueba_id","revision")
);
--> statement-breakpoint
CREATE TABLE "pruebas_territoriales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alternativa_id" uuid NOT NULL,
	"creador_id" integer NOT NULL,
	"responsable_id" integer,
	"titulo" text NOT NULL,
	"alcance" text NOT NULL,
	"plazo" date NOT NULL,
	"estado" text DEFAULT 'propuesta' NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prueba_estado_chk" CHECK ("pruebas_territoriales"."estado" in ('propuesta','aceptada','en_curso','pausada','implementada','resultado_observado','resultado_revisado'))
);
--> statement-breakpoint
ALTER TABLE "campana_devoluciones" ADD CONSTRAINT "campana_devoluciones_campana_id_campanas_id_fk" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campana_ediciones" ADD CONSTRAINT "campana_ediciones_campana_id_campanas_id_fk" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campanas" ADD CONSTRAINT "campanas_creador_id_users_id_fk" FOREIGN KEY ("creador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribuciones" ADD CONSTRAINT "contribuciones_senal_id_senales_id_publico_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id_publico") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribuciones" ADD CONSTRAINT "contribuciones_campana_id_campanas_id_fk" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analisis_guardados" ADD CONSTRAINT "analisis_guardados_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_civicos" ADD CONSTRAINT "eventos_civicos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ficha_afirmaciones" ADD CONSTRAINT "ficha_afirmaciones_ficha_id_fichas_futuro_id_fk" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ficha_afirmaciones" ADD CONSTRAINT "ficha_afirmaciones_creador_id_users_id_fk" FOREIGN KEY ("creador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ficha_alternativas" ADD CONSTRAINT "ficha_alternativas_ficha_id_fichas_futuro_id_fk" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ficha_alternativas" ADD CONSTRAINT "ficha_alternativas_creador_id_users_id_fk" FOREIGN KEY ("creador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opiniones" ADD CONSTRAINT "opiniones_afirmacion_id_ficha_afirmaciones_id_fk" FOREIGN KEY ("afirmacion_id") REFERENCES "public"."ficha_afirmaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opiniones" ADD CONSTRAINT "opiniones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prueba_eventos" ADD CONSTRAINT "prueba_eventos_prueba_id_pruebas_territoriales_id_fk" FOREIGN KEY ("prueba_id") REFERENCES "public"."pruebas_territoriales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prueba_eventos" ADD CONSTRAINT "prueba_eventos_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pruebas_territoriales" ADD CONSTRAINT "pruebas_territoriales_alternativa_id_ficha_alternativas_id_fk" FOREIGN KEY ("alternativa_id") REFERENCES "public"."ficha_alternativas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pruebas_territoriales" ADD CONSTRAINT "pruebas_territoriales_creador_id_users_id_fk" FOREIGN KEY ("creador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pruebas_territoriales" ADD CONSTRAINT "pruebas_territoriales_responsable_id_users_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contribuciones_campana_idx" ON "contribuciones" USING btree ("campana_id","edicion");--> statement-breakpoint
CREATE INDEX "analisis_guardados_usuario_idx" ON "analisis_guardados" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "eventos_civicos_usuario_idx" ON "eventos_civicos" USING btree ("user_id","creada_en");--> statement-breakpoint
CREATE INDEX "afirmacion_ficha_idx" ON "ficha_afirmaciones" USING btree ("ficha_id");