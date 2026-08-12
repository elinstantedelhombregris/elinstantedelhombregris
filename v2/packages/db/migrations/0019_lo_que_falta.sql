CREATE TABLE "faltas" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_publico" text NOT NULL,
	"origen" text NOT NULL,
	"superficie" text NOT NULL,
	"titulo" text NOT NULL,
	"cuerpo" text NOT NULL,
	"contexto" jsonb,
	"severidad" text,
	"estado" text DEFAULT 'dicha' NOT NULL,
	"razon" text,
	"anotada_como" text,
	"cierre_url" text,
	"llave_hash" text,
	"huerfana" boolean DEFAULT false NOT NULL,
	"firmas" integer DEFAULT 0 NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"movida_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "faltas_origen_chk" CHECK ("faltas"."origen" in ('adentro','afuera')),
	CONSTRAINT "faltas_superficie_chk" CHECK ("faltas"."superficie" in ('el-mapa','los-planes','la-biblioteca','los-entrenamientos','la-plataforma')),
	CONSTRAINT "faltas_estado_chk" CHECK ("faltas"."estado" in ('dicha','anotada','en_curso','hecha','no_va','bajada')),
	CONSTRAINT "faltas_severidad_chk" CHECK ("faltas"."severidad" is null or ("faltas"."origen" = 'adentro' and "faltas"."severidad" in ('bloqueante','alta','media','baja'))),
	CONSTRAINT "faltas_razon_chk" CHECK ("faltas"."estado" not in ('no_va','bajada') or ("faltas"."razon" is not null and length(btrim("faltas"."razon")) > 0)),
	CONSTRAINT "faltas_id_publico_chk" CHECK ("faltas"."id_publico" ~ (case when "faltas"."origen" = 'adentro' then '^D-[0-9]{3,6}$' else '^I-[0-9]{3,6}$' end))
);
--> statement-breakpoint
CREATE TABLE "faltas_firmas" (
	"id" serial PRIMARY KEY NOT NULL,
	"falta_id" integer NOT NULL,
	"llave_hash" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "faltas_firmas" ADD CONSTRAINT "faltas_firmas_falta_id_faltas_id_fk" FOREIGN KEY ("falta_id") REFERENCES "public"."faltas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "faltas_id_publico_unique" ON "faltas" USING btree ("id_publico");--> statement-breakpoint
CREATE INDEX "faltas_creada_idx" ON "faltas" USING btree ("creada_en");--> statement-breakpoint
CREATE INDEX "faltas_estado_idx" ON "faltas" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "faltas_superficie_idx" ON "faltas" USING btree ("superficie");--> statement-breakpoint
CREATE UNIQUE INDEX "faltas_firmas_unique" ON "faltas_firmas" USING btree ("falta_id","llave_hash");