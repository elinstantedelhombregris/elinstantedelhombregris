CREATE TABLE "capacidades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senal_id" uuid NOT NULL,
	"oferente_id" integer NOT NULL,
	"id_local" uuid NOT NULL,
	"huella" text NOT NULL,
	"titulo" text NOT NULL,
	"tipo" text NOT NULL,
	"unidad" text NOT NULL,
	"cantidad" integer,
	"desde" date NOT NULL,
	"hasta" date NOT NULL,
	"territorio_id" integer,
	"zona" text NOT NULL,
	"restricciones" text NOT NULL,
	"firma" text NOT NULL,
	"autorizada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"cerrada" boolean DEFAULT false NOT NULL,
	CONSTRAINT "capacidades_recibo_unique" UNIQUE("oferente_id","id_local"),
	CONSTRAINT "capacidades_cantidad_chk" CHECK ("capacidades"."cantidad" is null or "capacidades"."cantidad" between 1 and 1000000),
	CONSTRAINT "capacidades_periodo_chk" CHECK ("capacidades"."desde" <= "capacidades"."hasta"),
	CONSTRAINT "capacidades_tipo_chk" CHECK ("capacidades"."tipo" in ('tiempo','espacio','equipo','material','servicio'))
);
--> statement-breakpoint
CREATE TABLE "reservas_capacidad" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capacidad_id" uuid NOT NULL,
	"solicitante_id" integer NOT NULL,
	"ficha_id" uuid NOT NULL,
	"id_local" uuid NOT NULL,
	"huella" text NOT NULL,
	"cantidad" integer,
	"para_fecha" date NOT NULL,
	"necesidad" text NOT NULL,
	"compatibilidad" text NOT NULL,
	"estado" text DEFAULT 'propuesta' NOT NULL,
	"nota_entrega" text,
	"discrepancia" text,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservas_recibo_unique" UNIQUE("solicitante_id","id_local"),
	CONSTRAINT "reservas_cantidad_chk" CHECK ("reservas_capacidad"."cantidad" is null or "reservas_capacidad"."cantidad" between 1 and 1000000),
	CONSTRAINT "reservas_estado_chk" CHECK ("reservas_capacidad"."estado" in ('propuesta','reservada','entrega_declarada','entregada','discrepancia','cancelada','rechazada'))
);
--> statement-breakpoint
ALTER TABLE "capacidades" ADD CONSTRAINT "capacidades_senal_id_senales_id_publico_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id_publico") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacidades" ADD CONSTRAINT "capacidades_oferente_id_users_id_fk" FOREIGN KEY ("oferente_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacidades" ADD CONSTRAINT "capacidades_territorio_id_geographic_locations_id_fk" FOREIGN KEY ("territorio_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas_capacidad" ADD CONSTRAINT "reservas_capacidad_capacidad_id_capacidades_id_fk" FOREIGN KEY ("capacidad_id") REFERENCES "public"."capacidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas_capacidad" ADD CONSTRAINT "reservas_capacidad_solicitante_id_users_id_fk" FOREIGN KEY ("solicitante_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas_capacidad" ADD CONSTRAINT "reservas_capacidad_ficha_id_fichas_futuro_id_fk" FOREIGN KEY ("ficha_id") REFERENCES "public"."fichas_futuro"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "capacidades_senal_idx" ON "capacidades" USING btree ("senal_id");--> statement-breakpoint
CREATE INDEX "capacidades_territorio_idx" ON "capacidades" USING btree ("territorio_id");--> statement-breakpoint
CREATE INDEX "reservas_capacidad_idx" ON "reservas_capacidad" USING btree ("capacidad_id");--> statement-breakpoint
CREATE INDEX "reservas_solicitante_idx" ON "reservas_capacidad" USING btree ("solicitante_id");--> statement-breakpoint
CREATE INDEX "reservas_ficha_idx" ON "reservas_capacidad" USING btree ("ficha_id");