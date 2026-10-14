CREATE TABLE "ficha_argumentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ficha_id" uuid NOT NULL,
	"autor_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"tipo" text NOT NULL,
	"texto" text NOT NULL,
	"firma" text NOT NULL,
	"responde_a" uuid,
	"alternativa_id" uuid,
	"fuente_ids" jsonb NOT NULL,
	"huella" text NOT NULL,
	"retirada_en" timestamp with time zone,
	"motivo" text,
	"moderador_id" integer,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "argumento_envio_unique" UNIQUE("autor_id","id_local"),
	CONSTRAINT "argumento_tipo_chk" CHECK ("ficha_argumentos"."tipo" in ('argumento','objecion','evidencia','respuesta'))
);

--> statement-breakpoint
CREATE TABLE "ficha_relaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origen_id" uuid NOT NULL,
	"destino_id" uuid NOT NULL,
	"autor_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"tipo" text NOT NULL,
	"justificacion" text NOT NULL,
	"fuente" text,
	"huella" text NOT NULL,
	"retirada_en" timestamp with time zone,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "relacion_envio_unique" UNIQUE("autor_id","id_local"),
	CONSTRAINT "relacion_distinta_chk" CHECK ("ficha_relaciones"."origen_id" <> "ficha_relaciones"."destino_id"),
	CONSTRAINT "relacion_tipo_chk" CHECK ("ficha_relaciones"."tipo" in ('objetivo_compartido','complementa','depende','tension','hipotesis_causal'))
);

--> statement-breakpoint
ALTER TABLE "ficha_argumentos" ADD CONSTRAINT "ficha_argumentos_ficha_id_fichas_futuro_id_fk" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ficha_argumentos" ADD CONSTRAINT "ficha_argumentos_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ficha_argumentos" ADD CONSTRAINT "ficha_argumentos_alternativa_id_ficha_alternativas_id_fk" FOREIGN KEY ("alternativa_id") REFERENCES "public"."ficha_alternativas"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ficha_argumentos" ADD CONSTRAINT "ficha_argumentos_moderador_id_users_id_fk" FOREIGN KEY ("moderador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ficha_relaciones" ADD CONSTRAINT "ficha_relaciones_origen_id_fichas_futuro_id_fk" FOREIGN KEY ("origen_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ficha_relaciones" ADD CONSTRAINT "ficha_relaciones_destino_id_fichas_futuro_id_fk" FOREIGN KEY ("destino_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ficha_relaciones" ADD CONSTRAINT "ficha_relaciones_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "argumento_ficha_idx" ON "ficha_argumentos" USING btree ("ficha_id","creada_en");
--> statement-breakpoint
CREATE INDEX "relacion_origen_idx" ON "ficha_relaciones" USING btree ("origen_id");
--> statement-breakpoint
CREATE INDEX "relacion_destino_idx" ON "ficha_relaciones" USING btree ("destino_id");
