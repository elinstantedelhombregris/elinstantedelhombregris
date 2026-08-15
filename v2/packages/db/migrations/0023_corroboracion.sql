CREATE TABLE "confirmaciones" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"senal_id" bigint NOT NULL,
	"ronda" integer DEFAULT 1 NOT NULL,
	"actor_id" bigint,
	"veredicto" text NOT NULL,
	"metodo" text NOT NULL,
	"proximidad" text DEFAULT 'sin_declarar' NOT NULL,
	"cuenta" boolean DEFAULT false NOT NULL,
	"umbral_vigente" smallint NOT NULL,
	"nota" text,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "confirmaciones_una_por_actor" UNIQUE("senal_id","ronda","actor_id"),
	CONSTRAINT "confirmaciones_veredicto_chk" CHECK ("confirmaciones"."veredicto" in ('confirm','correct','duplicate','stale','unsafe','cannot_verify')),
	CONSTRAINT "confirmaciones_metodo_chk" CHECK ("confirmaciones"."metodo" in ('saw_now','know_place','checked_source','field_visit','cannot_verify')),
	CONSTRAINT "confirmaciones_proximidad_chk" CHECK ("confirmaciones"."proximidad" in ('en_el_lugar','cerca','lejos','sin_declarar')),
	CONSTRAINT "confirmaciones_par_coherente_chk" CHECK (("confirmaciones"."metodo" = 'cannot_verify') = ("confirmaciones"."veredicto" = 'cannot_verify')),
	CONSTRAINT "confirmaciones_cuenta_chk" CHECK (not "confirmaciones"."cuenta" or "confirmaciones"."metodo" <> 'cannot_verify'),
	CONSTRAINT "confirmaciones_cuenta_pide_actor_chk" CHECK (not "confirmaciones"."cuenta" or "confirmaciones"."actor_id" is not null),
	CONSTRAINT "confirmaciones_nota_chk" CHECK ("confirmaciones"."nota" is null or "confirmaciones"."veredicto" = 'correct')
);
--> statement-breakpoint
ALTER TABLE "confirmaciones" ADD CONSTRAINT "confirmaciones_senal_id_senales_id_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confirmaciones" ADD CONSTRAINT "confirmaciones_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confirmaciones" ADD CONSTRAINT "confirmaciones_senal_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "confirmaciones_senal_idx" ON "confirmaciones" USING btree ("senal_id","ronda");