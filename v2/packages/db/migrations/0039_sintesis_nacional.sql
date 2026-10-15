CREATE TABLE "sintesis_nacionales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"autor_id" integer NOT NULL,
	"revisor_id" integer,
	"id_local" uuid NOT NULL,
	"anterior_id" uuid,
	"contenido" jsonb NOT NULL,
	"huella" text NOT NULL,
	"version_geo" text NOT NULL,
	"version_censo" text NOT NULL,
	"huella_territorial" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"revisada_en" timestamp with time zone,
	"retirada_en" timestamp with time zone,
	CONSTRAINT "sintesis_autor_recibo_unique" UNIQUE("autor_id","id_local"),
	CONSTRAINT "sintesis_revision_separada_chk" CHECK ("sintesis_nacionales"."revisor_id" is null or "sintesis_nacionales"."revisor_id" <> "sintesis_nacionales"."autor_id"),
	CONSTRAINT "sintesis_revision_fecha_chk" CHECK (("sintesis_nacionales"."revisor_id" is null) = ("sintesis_nacionales"."revisada_en" is null))
);
--> statement-breakpoint
ALTER TABLE "sintesis_nacionales" ADD CONSTRAINT "sintesis_nacionales_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sintesis_nacionales" ADD CONSTRAINT "sintesis_nacionales_revisor_id_users_id_fk" FOREIGN KEY ("revisor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sintesis_nacionales" ADD CONSTRAINT "sintesis_nacionales_anterior_id_sintesis_nacionales_id_fk" FOREIGN KEY ("anterior_id") REFERENCES "public"."sintesis_nacionales"("id") ON DELETE no action ON UPDATE no action;