CREATE TABLE "estados_senal" (
	"estado" text NOT NULL,
	"clase" text NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "estados_senal_pk" PRIMARY KEY("estado","clase"),
	CONSTRAINT "estados_senal_clase_chk" CHECK ("estados_senal"."clase" in ('hecho','deseo','acto','meta'))
);
--> statement-breakpoint
CREATE TABLE "temas" (
	"clave" text PRIMARY KEY NOT NULL,
	"etiqueta" text NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "temas_orden_unique" UNIQUE("orden")
);
--> statement-breakpoint
CREATE TABLE "tipos_senal" (
	"tipo" text PRIMARY KEY NOT NULL,
	"clase" text NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "tipos_senal_orden_unique" UNIQUE("orden"),
	CONSTRAINT "tipos_senal_tipo_clase_unique" UNIQUE("tipo","clase"),
	CONSTRAINT "tipos_senal_clase_chk" CHECK ("tipos_senal"."clase" in ('hecho','deseo','acto','meta'))
);
--> statement-breakpoint
CREATE TABLE "actores" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_hash" "bytea",
	"secreto_hash" "bytea",
	"pepper_version" smallint DEFAULT 1 NOT NULL,
	"origen" text NOT NULL,
	"user_id" integer,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"primer_evento_en" timestamp with time zone,
	"retirado_en" timestamp with time zone,
	CONSTRAINT "actores_actor_hash_unique" UNIQUE("actor_hash"),
	CONSTRAINT "actores_origen_chk" CHECK ("actores"."origen" in ('web','campo')),
	CONSTRAINT "actores_retiro_chk" CHECK (("actores"."retirado_en" is null) = ("actores"."actor_hash" is not null))
);
--> statement-breakpoint
CREATE TABLE "actores_por_origen" (
	"hora" timestamp with time zone NOT NULL,
	"bucket" "bytea" NOT NULL,
	"creados" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "actores_por_origen_pk" PRIMARY KEY("hora","bucket")
);
--> statement-breakpoint
CREATE TABLE "senales" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"id_publico" uuid DEFAULT gen_random_uuid() NOT NULL,
	"tipo" text NOT NULL,
	"clase" text NOT NULL,
	"tema" text,
	"tema_origen" text DEFAULT 'ninguno' NOT NULL,
	"tema_intentado_en" timestamp with time zone,
	"actor_id" bigint,
	"user_id" integer,
	"firma" text,
	"origen" text NOT NULL,
	"id_local" uuid NOT NULL,
	"titulo" text,
	"texto" text NOT NULL,
	"fuente" text,
	"cesion_licencia" boolean DEFAULT false NOT NULL,
	"cesion_en" timestamp with time zone,
	"cesion_version" smallint,
	"province_id" integer,
	"city_id" integer,
	"department_id" integer,
	"lat" numeric(9, 6),
	"lng" numeric(9, 6),
	"precision" text DEFAULT 'province' NOT NULL,
	"location_role" text DEFAULT 'subject' NOT NULL,
	"sensitivity" text DEFAULT 'high' NOT NULL,
	"calle_id" integer,
	"altura" integer,
	"direccion_estado" text DEFAULT 'sin_direccion' NOT NULL,
	"direccion_texto" text,
	"ubicacion_origen" text DEFAULT 'ninguna' NOT NULL,
	"casa" text DEFAULT 'sinRespuesta' NOT NULL,
	"engrosado_rechazado" boolean DEFAULT false NOT NULL,
	"estado" text DEFAULT 'enviada' NOT NULL,
	"estado_desde" timestamp with time zone DEFAULT now() NOT NULL,
	"ronda" integer DEFAULT 1 NOT NULL,
	"vence_el_revision" timestamp with time zone,
	"caduca_el" timestamp with time zone,
	"motivo" text,
	"retenida_en" timestamp with time zone,
	"retenida_motivo" text,
	"desenlace" text,
	"comprometido_para" date,
	"periodicidad" text,
	"sostenida_por" text,
	"publicada_en" timestamp with time zone,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "senales_id_publico_unique" UNIQUE("id_publico"),
	CONSTRAINT "senales_id_clase_unique" UNIQUE("id","clase"),
	CONSTRAINT "senales_origen_id_local_unique" UNIQUE("origen","id_local"),
	CONSTRAINT "senales_origen_chk" CHECK ("senales"."origen" in ('web','campo','campo-v1')),
	CONSTRAINT "senales_tema_origen_chk" CHECK ("senales"."tema_origen" in ('declarado','sugerido','ninguno')),
	CONSTRAINT "senales_casa_chk" CHECK ("senales"."casa" in ('propia','ajena','no','sinRespuesta')),
	CONSTRAINT "senales_precision_chk" CHECK ("senales"."precision" in ('exact','100m','500m','neighborhood','city','province')),
	CONSTRAINT "senales_location_role_chk" CHECK ("senales"."location_role" in ('subject','capture','service_area','meeting_point')),
	CONSTRAINT "senales_sensitivity_chk" CHECK ("senales"."sensitivity" in ('low','moderate','high')),
	CONSTRAINT "senales_motivo_chk" CHECK ("senales"."motivo" is null or "senales"."motivo" in ('ya_no_esta','caducidad_por_silencio','correccion','compromiso_vencido','compromiso_incumplido','revision_de_vigencia','revision_de_resolucion')),
	CONSTRAINT "senales_desenlace_chk" CHECK ("senales"."desenlace" is null or "senales"."desenlace" in ('abierto','vencido','cumplido','no_cumplido')),
	CONSTRAINT "senales_retirada_sin_texto_chk" CHECK ("senales"."estado" <> 'retirada' or "senales"."texto" = ''),
	CONSTRAINT "senales_acto_tiene_fecha_chk" CHECK ("senales"."clase" <> 'acto' or "senales"."comprometido_para" is not null),
	CONSTRAINT "senales_solo_acto_tiene_desenlace_chk" CHECK ("senales"."clase" = 'acto' or ("senales"."desenlace" is null and "senales"."comprometido_para" is null)),
	CONSTRAINT "senales_acto_tiene_desenlace_chk" CHECK ("senales"."clase" <> 'acto' or "senales"."desenlace" is not null),
	CONSTRAINT "senales_saber_trae_fuente_chk" CHECK ("senales"."tipo" <> 'saber' or "senales"."fuente" is not null),
	CONSTRAINT "senales_practica_tiene_periodicidad_chk" CHECK ("senales"."tipo" <> 'práctica' or "senales"."periodicidad" is not null),
	CONSTRAINT "senales_solo_practica_tiene_periodicidad_chk" CHECK ("senales"."tipo" = 'práctica' or ("senales"."periodicidad" is null and "senales"."sostenida_por" is null)),
	CONSTRAINT "senales_periodicidad_conocida_chk" CHECK ("senales"."periodicidad" is null or "senales"."periodicidad" in ('diaria','semanal','quincenal','mensual','eventual','permanente')),
	CONSTRAINT "senales_tema_coherente_chk" CHECK (("senales"."tema" is null) = ("senales"."tema_origen" = 'ninguno')),
	CONSTRAINT "senales_cesion_coherente_chk" CHECK (("senales"."cesion_en" is null) = ("senales"."cesion_version" is null)),
	CONSTRAINT "senales_cesion_chk" CHECK (("senales"."cesion_en" is null) <> "senales"."cesion_licencia"),
	CONSTRAINT "senales_rechazo_chk" CHECK (not "senales"."engrosado_rechazado" or ("senales"."casa" = 'propia' and "senales"."location_role" = 'subject')),
	CONSTRAINT "senales_acto_coherente_chk" CHECK ("senales"."clase" <> 'acto' or "senales"."estado" = 'retirada' or (
        ("senales"."desenlace" = 'abierto'     and "senales"."estado" in ('enviada','por_verificar','corroborada'))
     or ("senales"."desenlace" = 'vencido'     and "senales"."estado" = 'desactualizada')
     or ("senales"."desenlace" = 'cumplido'    and "senales"."estado" = 'resuelta')
     or ("senales"."desenlace" = 'no_cumplido' and "senales"."estado" = 'no_cumplida'))),
	CONSTRAINT "senales_direccion_chk" CHECK ((direccion_estado = 'sin_direccion'
          AND calle_id IS NULL AND altura IS NULL AND direccion_texto IS NULL)
   OR (direccion_estado = 'calle'
          AND calle_id IS NOT NULL AND altura IS NULL AND direccion_texto IS NOT NULL)
   OR (direccion_estado IN ('altura_en_rango','altura_sin_rango','altura_fuera_de_rango')
          AND calle_id IS NOT NULL AND altura IS NOT NULL AND direccion_texto IS NOT NULL)
   OR (direccion_estado = 'texto_libre'
          AND calle_id IS NULL AND altura IS NULL AND direccion_texto IS NOT NULL)),
	CONSTRAINT "senales_direccion_origen_chk" CHECK (ubicacion_origen IN ('catalogo','punto','declarada','ninguna')),
	CONSTRAINT "senales_altura_chk" CHECK (altura IS NULL OR (altura > 0 AND altura < 1000000)),
	CONSTRAINT "senales_direccion_texto_len_chk" CHECK (direccion_texto IS NULL OR length(direccion_texto) <= 120),
	CONSTRAINT "senales_altura_punto_chk" CHECK (altura IS NULL OR lat IS NULL OR "precision" = 'exact'),
	CONSTRAINT "senales_altura_rol_chk" CHECK (altura IS NULL OR location_role IN ('capture','meeting_point')),
	CONSTRAINT "senales_texto_libre_rol_chk" CHECK (direccion_estado <> 'texto_libre' OR location_role IN ('capture','meeting_point')),
	CONSTRAINT "senales_direccion_protegida_chk" CHECK (NOT (location_role = 'subject' AND sensitivity = 'high')
       OR direccion_estado = 'sin_direccion'),
	CONSTRAINT "senales_origen_provincia_chk" CHECK (province_id IS NULL OR ubicacion_origen <> 'ninguna')
);
--> statement-breakpoint
CREATE TABLE "adhesiones" (
	"senal_id" bigint NOT NULL,
	"actor_id" bigint NOT NULL,
	"user_id" integer,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "adhesiones_pk" PRIMARY KEY("senal_id","actor_id")
);
--> statement-breakpoint
CREATE TABLE "respuestas" (
	"pregunta_id" bigint NOT NULL,
	"pregunta_clase" text NOT NULL,
	"senal_id" bigint NOT NULL,
	"senal_clase" text NOT NULL,
	"actor_id" bigint,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "respuestas_pk" PRIMARY KEY("pregunta_id","senal_id"),
	CONSTRAINT "respuestas_pregunta_clase_chk" CHECK ("respuestas"."pregunta_clase" = 'meta'),
	CONSTRAINT "respuestas_senal_clase_chk" CHECK ("respuestas"."senal_clase" = 'hecho')
);
--> statement-breakpoint
ALTER TABLE "actores" ADD CONSTRAINT "actores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_tema_temas_clave_fk" FOREIGN KEY ("tema") REFERENCES "public"."temas"("clave") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_province_id_geographic_locations_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_city_id_geographic_locations_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_department_id_geographic_locations_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_calle_id_geo_calles_id_fk" FOREIGN KEY ("calle_id") REFERENCES "public"."geo_calles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_tipo_clase_fk" FOREIGN KEY ("tipo","clase") REFERENCES "public"."tipos_senal"("tipo","clase") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "senales" ADD CONSTRAINT "senales_estado_clase_fk" FOREIGN KEY ("estado","clase") REFERENCES "public"."estados_senal"("estado","clase") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adhesiones" ADD CONSTRAINT "adhesiones_senal_id_senales_id_fk" FOREIGN KEY ("senal_id") REFERENCES "public"."senales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adhesiones" ADD CONSTRAINT "adhesiones_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adhesiones" ADD CONSTRAINT "adhesiones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_actor_id_actores_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_pregunta_fk" FOREIGN KEY ("pregunta_id","pregunta_clase") REFERENCES "public"."senales"("id","clase") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_senal_fk" FOREIGN KEY ("senal_id","senal_clase") REFERENCES "public"."senales"("id","clase") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "actores_user_unico" ON "actores" USING btree ("user_id") WHERE user_id is not null;--> statement-breakpoint
CREATE INDEX "senales_clase_idx" ON "senales" USING btree ("clase","estado");--> statement-breakpoint
CREATE INDEX "senales_provincia_idx" ON "senales" USING btree ("province_id","creada_en" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "senales_geo_idx" ON "senales" USING btree ("lat","lng") WHERE lat is not null;--> statement-breakpoint
CREATE INDEX "senales_actor_idx" ON "senales" USING btree ("actor_id") WHERE actor_id is not null;--> statement-breakpoint
CREATE INDEX "senales_calle_idx" ON "senales" USING btree ("calle_id") WHERE calle_id is not null;--> statement-breakpoint
CREATE INDEX "senales_tema_cola_idx" ON "senales" USING btree ("creada_en") WHERE tema is null and tema_intentado_en is null;--> statement-breakpoint
CREATE UNIQUE INDEX "adhesiones_senal_user_unico" ON "adhesiones" USING btree ("senal_id","user_id") WHERE user_id is not null;--> statement-breakpoint
CREATE INDEX "adhesiones_actor_idx" ON "adhesiones" USING btree ("actor_id");--> statement-breakpoint
-- ===========================================================================
-- ESCRITO A MANO. `drizzle-kit generate` NO produce nada de lo que sigue.
-- ===========================================================================
--
-- Las 9 + 20 + 11 = 40 filas de vocabulario van DENTRO de esta migración y no
-- en un script aparte: pesan menos de 1 KB, y como script suelto una base nueva
-- —la de CI, un branch efímero, el dev que clona— arrancaría con `senales`
-- inservible y TODO insert fallaría con una violación de clave foránea que
-- parece un bug del código y es un setup faltante.
--
-- `on conflict do nothing` en las tres: la migración corre una sola vez, pero
-- una base restaurada a mano o un `db:migrate` reintentado no tienen por qué
-- morir acá.
--
-- El orden de `tipos_senal` es el de `TIPOS_SENAL` de
-- `packages/civic-core/src/senal/vocabulario.ts` y la clase es la de
-- `CLASE_DE_TIPO`. La guarda del vocabulario compara esta tabla contra ese
-- módulo con una consulta real, así que acá no se decide nada: se copia, y el
-- test se pone rojo si las dos copias derivan.
INSERT INTO "tipos_senal" ("tipo", "clase", "orden") VALUES
  ('basta',      'hecho', 1),
  ('necesidad',  'hecho', 2),
  ('recurso',    'hecho', 3),
  ('práctica',   'hecho', 4),
  ('saber',      'hecho', 5),
  ('sueño',      'deseo', 6),
  ('propuesta',  'deseo', 7),
  ('compromiso', 'acto',  8),
  ('pregunta',   'meta',  9)
ON CONFLICT DO NOTHING;--> statement-breakpoint
-- Los 20 pares (clase, estado) que existen. Todo lo que NO esté acá es un
-- INSERT imposible en `senales`: `('sueño','hecho')` y `('corroborada','deseo')`
-- no fallan por un CHECK sino porque la fila del catálogo no existe.
--
-- `orden` reinicia en 1 dentro de cada clase y sigue el CICLO DE VIDA, no el
-- alfabeto: es el orden en que la ficha dibuja la línea de tiempo.
--
-- `acto` corre la máquina completa —incluidos `por_verificar` y `corroborada`—.
-- Sin esos dos pares, la sentencia de confirmación no inserta nunca, `desenlace`
-- no sale jamás de `abierto`, y `senales_acto_coherente_chk` pincha a todo
-- compromiso para siempre: un bloqueo total del único tipo de la clase `acto`, y
-- en silencio.
--
-- `borrador` NO está: un borrador vive en el dispositivo y nunca llega al
-- servidor.
INSERT INTO "estados_senal" ("estado", "clase", "orden") VALUES
  ('enviada',        'hecho', 1),
  ('por_verificar',  'hecho', 2),
  ('corroborada',    'hecho', 3),
  ('resuelta',       'hecho', 4),
  ('desactualizada', 'hecho', 5),
  ('retirada',       'hecho', 6),
  ('enviada',        'acto',  1),
  ('por_verificar',  'acto',  2),
  ('corroborada',    'acto',  3),
  ('resuelta',       'acto',  4),
  ('no_cumplida',    'acto',  5),
  ('desactualizada', 'acto',  6),
  ('retirada',       'acto',  7),
  ('enviada',        'deseo', 1),
  ('desactualizada', 'deseo', 2),
  ('retirada',       'deseo', 3),
  ('enviada',        'meta',  1),
  ('resuelta',       'meta',  2),
  ('desactualizada', 'meta',  3),
  ('retirada',       'meta',  4)
ON CONFLICT DO NOTHING;--> statement-breakpoint
-- Los once temas, cerrados. Un vocabulario abierto es lo que produjo
-- `salud_publica`, `salud_pública` y `sistema_de_salud` como tres temas
-- distintos. `etiqueta` es texto de pantalla: la clave con mayúscula inicial.
INSERT INTO "temas" ("clave", "etiqueta", "orden") VALUES
  ('alimento',   'Alimento',   1),
  ('vivienda',   'Vivienda',   2),
  ('trabajo',    'Trabajo',    3),
  ('cuidado',    'Cuidado',    4),
  ('salud',      'Salud',      5),
  ('educación',  'Educación',  6),
  ('ambiente',   'Ambiente',   7),
  ('movilidad',  'Movilidad',  8),
  ('seguridad',  'Seguridad',  9),
  ('cultura',    'Cultura',    10),
  ('democracia', 'Democracia', 11)
ON CONFLICT DO NOTHING;--> statement-breakpoint
-- ===========================================================================
-- Las seis tablas viejas NO se borran acá.
-- ===========================================================================
--
-- Borrar es irreversible y no tiene por qué compartir transacción con la que
-- crea. Cada una queda con el aviso adentro de la base, con FECHA y NÚMERO DE
-- MIGRACIÓN: dentro de un año, «ya no recibe escrituras» sin fecha obliga a
-- abrir el historial de git, y el que abre `psql` para entender una tabla rara
-- casi nunca tiene el repo al lado.
COMMENT ON TABLE "dreams" IS
  'RETIRADA 2026-08-13 (migración 0022). Ya no recibe escrituras: toda señal vive en `senales`. Se conserva sólo para poder auditar lo que quedó escrito antes del corte. El DROP es la Task 36 del plan docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md.';--> statement-breakpoint
COMMENT ON TABLE "pulse_signals" IS
  'RETIRADA 2026-08-13 (migración 0022). Ya no recibe escrituras: toda señal vive en `senales`. Se conserva sólo para poder auditar lo que quedó escrito antes del corte. El DROP es la Task 36 del plan docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md.';--> statement-breakpoint
COMMENT ON TABLE "proposals" IS
  'RETIRADA 2026-08-13 (migración 0022). Ya no recibe escrituras: toda señal vive en `senales`. Se conserva sólo para poder auditar lo que quedó escrito antes del corte. El DROP es la Task 36 del plan docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md.';--> statement-breakpoint
COMMENT ON TABLE "proposal_votes" IS
  'RETIRADA 2026-08-13 (migración 0022). Ya no recibe escrituras: el apoyo vive en `adhesiones`, que sí tiene la clave primaria por persona que a esta tabla le faltaba. Se conserva sólo para auditar lo que quedó escrito antes del corte. El DROP es la Task 36 del plan docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md.';--> statement-breakpoint
COMMENT ON TABLE "proposal_status_history" IS
  'RETIRADA 2026-08-13 (migración 0022). Ya no recibe escrituras: la bitácora de una señal es `rastro_senal`. Se conserva sólo para auditar lo que quedó escrito antes del corte. El DROP es la Task 36 del plan docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md.';--> statement-breakpoint
COMMENT ON TABLE "mandate_suggestions" IS
  'RETIRADA 2026-08-13 (migración 0022). Ya no recibe escrituras: toda señal vive en `senales` y el apoyo en `adhesiones`. Su support_count era un contador de filas guardado en la fila del objeto. Se conserva sólo para auditar lo que quedó escrito antes del corte. El DROP es la Task 36 del plan docs/plans/2026-08-11-tierra-senal-corroboracion-registro.md.';
