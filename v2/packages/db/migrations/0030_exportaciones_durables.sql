CREATE TABLE "exportacion_partes" (
	"trabajo_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"archivo" text NOT NULL,
	"contenido" text NOT NULL,
	"bytes" integer NOT NULL,
	"sha256" text NOT NULL,
	CONSTRAINT "exportacion_partes_trabajo_id_orden_pk" PRIMARY KEY("trabajo_id","orden")
);
--> statement-breakpoint
CREATE TABLE "exportacion_revision" (
	"id" integer PRIMARY KEY NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exportaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_solicitud" uuid NOT NULL,
	"huella" text NOT NULL,
	"solicitud" jsonb NOT NULL,
	"estado" text DEFAULT 'solicitado' NOT NULL,
	"fase" text DEFAULT 'senales' NOT NULL,
	"revision_publica" integer NOT NULL,
	"corte" timestamp with time zone DEFAULT now() NOT NULL,
	"vence_en" timestamp with time zone NOT NULL,
	"cursor" uuid,
	"orden" integer DEFAULT 0 NOT NULL,
	"registros" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"textos_reservados" integer DEFAULT 0 NOT NULL,
	"bytes" integer DEFAULT 0 NOT NULL,
	"lease" uuid,
	"lease_hasta" timestamp with time zone,
	"intentos" integer DEFAULT 0 NOT NULL,
	"fallos" integer DEFAULT 0 NOT NULL,
	"mensaje" text,
	"actualizada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exportaciones_id_solicitud_unique" UNIQUE("id_solicitud"),
	CONSTRAINT "exportaciones_estado_chk" CHECK ("exportaciones"."estado" in ('solicitado','preparando','disponible','vencido','fallido'))
);
--> statement-breakpoint
ALTER TABLE "exportacion_partes" ADD CONSTRAINT "exportacion_partes_trabajo_id_exportaciones_id_fk" FOREIGN KEY ("trabajo_id") REFERENCES "public"."exportaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exportaciones_cola_idx" ON "exportaciones" USING btree ("estado","lease_hasta");--> statement-breakpoint
INSERT INTO exportacion_revision(id, revision) VALUES (1, 1);
--> statement-breakpoint
CREATE FUNCTION invalidar_exportaciones_publicas() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE exportacion_revision SET revision=revision+1 WHERE id=1;
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER senales_exportacion_revision AFTER UPDATE OR DELETE ON senales FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_publicas();
--> statement-breakpoint
CREATE TRIGGER contribuciones_exportacion_revision AFTER UPDATE OR DELETE ON contribuciones FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_publicas();
--> statement-breakpoint
CREATE TRIGGER campanas_exportacion_revision AFTER UPDATE OR DELETE ON campanas FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_publicas();
--> statement-breakpoint
CREATE TRIGGER fichas_exportacion_revision AFTER UPDATE OR DELETE ON fichas_futuro FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_publicas();
-- INSERT_CUT_GUARD
--> statement-breakpoint
CREATE FUNCTION invalidar_exportaciones_por_fuente_anterior() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE exportaciones SET estado='fallido',mensaje='Se incorporó una fuente anterior al corte. Pedí una lectura nueva.',lease=null,lease_hasta=null
  WHERE estado IN ('solicitado','preparando','disponible') AND vence_en>now()
    AND corte >= (SELECT min(creada_en) FROM nuevas_fuentes);
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER senales_exportacion_insercion AFTER INSERT ON senales REFERENCING NEW TABLE AS nuevas_fuentes FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_por_fuente_anterior();
--> statement-breakpoint
CREATE TRIGGER campanas_exportacion_insercion AFTER INSERT ON campanas REFERENCING NEW TABLE AS nuevas_fuentes FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_por_fuente_anterior();
--> statement-breakpoint
CREATE TRIGGER fichas_exportacion_insercion AFTER INSERT ON fichas_futuro REFERENCING NEW TABLE AS nuevas_fuentes FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_por_fuente_anterior();
--> statement-breakpoint
CREATE FUNCTION invalidar_exportaciones_por_contexto_anterior() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE exportaciones SET estado='fallido',mensaje='Cambió el contexto de una fuente anterior al corte. Pedí una lectura nueva.',lease=null,lease_hasta=null
  WHERE estado IN ('solicitado','preparando','disponible') AND vence_en>now()
    AND corte >= (SELECT min(s.creada_en) FROM nuevos_aportes n JOIN senales s ON s.id_publico=n.senal_id);
  RETURN NULL;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER contribuciones_exportacion_insercion AFTER INSERT ON contribuciones REFERENCING NEW TABLE AS nuevos_aportes FOR EACH STATEMENT EXECUTE FUNCTION invalidar_exportaciones_por_contexto_anterior();
