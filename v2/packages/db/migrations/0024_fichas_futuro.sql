CREATE TABLE "fichas_futuro" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creador_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"territorio_id" integer,
	"revision" integer DEFAULT 1 NOT NULL,
	"contenido" jsonb NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fichas_futuro_envio_unique" UNIQUE("creador_id","id_local"),
	CONSTRAINT "fichas_futuro_revision_chk" CHECK ("fichas_futuro"."revision" >= 1)
);

--> statement-breakpoint
CREATE TABLE "fichas_revisiones" (
	"ficha_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"editor_id" integer NOT NULL,
	"contenido" jsonb NOT NULL,
	"campos" jsonb NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fichas_revisiones_ficha_id_revision_pk" PRIMARY KEY("ficha_id","revision")
);

--> statement-breakpoint
ALTER TABLE "fichas_futuro" ADD CONSTRAINT "fichas_futuro_creador_id_users_id_fk" FOREIGN KEY ("creador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "fichas_futuro" ADD CONSTRAINT "fichas_futuro_territorio_id_geographic_locations_id_fk" FOREIGN KEY ("territorio_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "fichas_revisiones" ADD CONSTRAINT "fichas_revisiones_ficha_id_fichas_futuro_id_fk" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "fichas_revisiones" ADD CONSTRAINT "fichas_revisiones_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "fichas_futuro_territorio_idx" ON "fichas_futuro" USING btree ("territorio_id");