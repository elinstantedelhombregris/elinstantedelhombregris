CREATE TABLE "pila_decisiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senal_id" bigint NOT NULL,
	"decision" text NOT NULL,
	"origen" text NOT NULL,
	"admin_id" integer,
	"motivo" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pila_decision_chk" CHECK ("pila_decisiones"."decision" in ('retener','devolver')),
	CONSTRAINT "pila_decision_origen_chk" CHECK ("pila_decisiones"."origen" in ('reportes','gestion')),
	CONSTRAINT "pila_decision_admin_chk" CHECK (("pila_decisiones"."origen" = 'gestion') = ("pila_decisiones"."admin_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "pila_duelos" (
	"a_id" bigint NOT NULL,
	"b_id" bigint NOT NULL,
	"actor_id" bigint NOT NULL,
	"user_id" integer,
	"primero_id" bigint,
	"region" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"cambiado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pila_duelos_pk" PRIMARY KEY("a_id","b_id","actor_id"),
	CONSTRAINT "pila_duelo_orden_chk" CHECK ("pila_duelos"."a_id" < "pila_duelos"."b_id"),
	CONSTRAINT "pila_duelo_primero_chk" CHECK ("pila_duelos"."primero_id" is null or "pila_duelos"."primero_id" in ("pila_duelos"."a_id", "pila_duelos"."b_id")),
	CONSTRAINT "pila_duelo_region_chk" CHECK ("pila_duelos"."region" in ('NOA','NEA','Cuyo','Centro','Buenos Aires','Patagonia'))
);
--> statement-breakpoint
CREATE TABLE "pila_reportes" (
	"senal_id" bigint NOT NULL,
	"actor_id" bigint NOT NULL,
	"motivo" text NOT NULL,
	"cuenta" boolean NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pila_reportes_pk" PRIMARY KEY("senal_id","actor_id"),
	CONSTRAINT "pila_reporte_motivo_chk" CHECK ("pila_reportes"."motivo" in ('insulta','datos_personales','fuera_de_tema'))
);
--> statement-breakpoint
CREATE TABLE "pila_respuestas" (
	"senal_id" bigint NOT NULL,
	"actor_id" bigint NOT NULL,
	"user_id" integer,
	"valor" text,
	"provincia_id" integer,
	"region" text,
	"mostrada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"respondida_en" timestamp with time zone,
	CONSTRAINT "pila_respuestas_pk" PRIMARY KEY("senal_id","actor_id"),
	CONSTRAINT "pila_respuesta_valor_chk" CHECK ("pila_respuestas"."valor" in ('acuerdo','desacuerdo','paso')),
	CONSTRAINT "pila_respuesta_fecha_chk" CHECK (("pila_respuestas"."valor" is null) = ("pila_respuestas"."respondida_en" is null)),
	CONSTRAINT "pila_respuesta_region_chk" CHECK ("pila_respuestas"."region" in ('NOA','NEA','Cuyo','Centro','Buenos Aires','Patagonia')),
	CONSTRAINT "pila_respuesta_region_provincia_chk" CHECK (("pila_respuestas"."region" is null) = ("pila_respuestas"."provincia_id" is null))
);
--> statement-breakpoint
ALTER TABLE "pila_decisiones" ADD CONSTRAINT "pila_decisiones_senal_id_senales_id_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_decisiones" ADD CONSTRAINT "pila_decisiones_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_duelos" ADD CONSTRAINT "pila_duelos_a_id_senales_id_fk" FOREIGN KEY ("a_id") REFERENCES "public"."senales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_duelos" ADD CONSTRAINT "pila_duelos_b_id_senales_id_fk" FOREIGN KEY ("b_id") REFERENCES "public"."senales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_duelos" ADD CONSTRAINT "pila_duelos_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_duelos" ADD CONSTRAINT "pila_duelos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_reportes" ADD CONSTRAINT "pila_reportes_senal_id_senales_id_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_reportes" ADD CONSTRAINT "pila_reportes_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_respuestas" ADD CONSTRAINT "pila_respuestas_senal_id_senales_id_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_respuestas" ADD CONSTRAINT "pila_respuestas_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_respuestas" ADD CONSTRAINT "pila_respuestas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pila_respuestas" ADD CONSTRAINT "pila_respuestas_provincia_id_geographic_locations_id_fk" FOREIGN KEY ("provincia_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pila_decisiones_senal_idx" ON "pila_decisiones" USING btree ("senal_id","creada_en");--> statement-breakpoint
CREATE UNIQUE INDEX "pila_duelos_user_unico" ON "pila_duelos" USING btree ("a_id","b_id","user_id") WHERE user_id is not null;--> statement-breakpoint
CREATE INDEX "pila_duelos_b_idx" ON "pila_duelos" USING btree ("b_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pila_respuestas_senal_user_unico" ON "pila_respuestas" USING btree ("senal_id","user_id") WHERE user_id is not null;--> statement-breakpoint
CREATE INDEX "pila_respuestas_actor_idx" ON "pila_respuestas" USING btree ("actor_id","respondida_en");--> statement-breakpoint
CREATE INDEX "pila_respuestas_senal_region_idx" ON "pila_respuestas" USING btree ("senal_id","region") WHERE valor in ('acuerdo','desacuerdo');