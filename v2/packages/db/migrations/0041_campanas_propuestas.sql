CREATE TABLE "campana_impulsos" (
	"actor_id" bigint PRIMARY KEY NOT NULL,
	"campana_id" uuid NOT NULL,
	"user_id" integer,
	"como" text NOT NULL,
	"senal_id" bigint,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campana_impulso_como_chk" CHECK ("campana_impulsos"."como" in ('aporte','opiniones')),
	CONSTRAINT "campana_impulso_senal_chk" CHECK ("campana_impulsos"."como" = 'aporte' or "campana_impulsos"."senal_id" is null)
);
--> statement-breakpoint
ALTER TABLE "campanas" DROP CONSTRAINT "campanas_estado_chk";--> statement-breakpoint
ALTER TABLE "campana_impulsos" ADD CONSTRAINT "campana_impulsos_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campana_impulsos" ADD CONSTRAINT "campana_impulsos_campana_id_campanas_id_fk" FOREIGN KEY ("campana_id") REFERENCES "public"."campanas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campana_impulsos" ADD CONSTRAINT "campana_impulsos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campana_impulsos" ADD CONSTRAINT "campana_impulsos_senal_id_senales_id_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campana_impulsos_campana_idx" ON "campana_impulsos" USING btree ("campana_id");--> statement-breakpoint
ALTER TABLE "campanas" ADD CONSTRAINT "campanas_estado_chk" CHECK ("campanas"."estado" in ('borrador','reuniendo','por_revisar','programada','abierta','pausada','en_devolucion','cerrada'));