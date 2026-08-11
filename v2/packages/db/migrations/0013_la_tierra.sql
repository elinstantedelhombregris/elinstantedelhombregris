CREATE TABLE "geo_calle_categorias" (
	"categoria" text PRIMARY KEY NOT NULL,
	"cantidad" integer NOT NULL,
	"corrida" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geo_calles" (
	"id" serial PRIMARY KEY NOT NULL,
	"georef_id" text NOT NULL,
	"localidad_id" integer NOT NULL,
	"departamento_id" integer NOT NULL,
	"provincia_id" integer NOT NULL,
	"nombre" text NOT NULL,
	"nombre_norm" text NOT NULL,
	"nombre_clase" text NOT NULL,
	"categoria" text NOT NULL,
	"altura_desde" integer,
	"altura_hasta" integer,
	"vigente_hasta" timestamp with time zone,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "geo_calles_georef_chk" CHECK ("geo_calles"."georef_id" ~ '^[0-9]{13}$'),
	CONSTRAINT "geo_calles_clase_chk" CHECK ("geo_calles"."nombre_clase" in ('nominada','sin_nombre')),
	CONSTRAINT "geo_calles_desde_chk" CHECK ("geo_calles"."altura_desde" is null or "geo_calles"."altura_desde" > 0),
	CONSTRAINT "geo_calles_hasta_chk" CHECK ("geo_calles"."altura_hasta" is null or "geo_calles"."altura_hasta" > 0),
	CONSTRAINT "geo_calles_rango_chk" CHECK ("geo_calles"."altura_desde" is null or "geo_calles"."altura_hasta" is null or "geo_calles"."altura_desde" <= "geo_calles"."altura_hasta")
);
--> statement-breakpoint
CREATE TABLE "geo_catalogo_version" (
	"corrida" text PRIMARY KEY NOT NULL,
	"fuente" text NOT NULL,
	"fecha_de_corte" timestamp with time zone NOT NULL,
	"totales" json NOT NULL,
	"cobertura" json NOT NULL,
	"vigente" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geo_seed_progreso" (
	"corrida" text NOT NULL,
	"recurso" text NOT NULL,
	"particion" text NOT NULL,
	"total_declarado" integer,
	"filas_escritas" integer DEFAULT 0 NOT NULL,
	"offset_siguiente" integer DEFAULT 0 NOT NULL,
	"estado" text NOT NULL,
	"hash_fuente" text,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "geo_seed_progreso_corrida_recurso_particion_pk" PRIMARY KEY("corrida","recurso","particion"),
	CONSTRAINT "geo_seed_estado_chk" CHECK ("geo_seed_progreso"."estado" in ('pendiente','en_curso','completa','fallida'))
);
--> statement-breakpoint
-- ─────────────────────────────────────────────────────────────────────────────
-- La reparación de `province_id` (spec A §3.1). Va ANTES de las columnas
-- nuevas y en este orden. drizzle-kit genera de todo esto una sola línea —el
-- `SET DATA TYPE`— y deja la secuencia, el default y la falta de clave foránea
-- en pie, que es justo la mitad que importa.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Las 24 filas conservan su id; se arregla el valor basura que la secuencia
--    les puso. Una provincia se pertenece a sí misma: apuntar a sí misma (y no
--    a NULL) hace que `where province_id = 6` devuelva la provincia Y todo lo
--    que cuelga de ella, en vez de obligar a escribir
--    `where id = 6 or province_id = 6` en cada agregado del sistema.
UPDATE "geographic_locations" SET "province_id" = "id" WHERE "level" = 'province';--> statement-breakpoint
-- 2. Se desarma el `serial`. No es un tipo: la columna ya es integer, lo que
--    sobra es el default de secuencia. El DROP DEFAULT va primero porque la
--    secuencia no se puede tirar mientras el default la esté nombrando.
ALTER TABLE "geographic_locations" ALTER COLUMN "province_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "geographic_locations" ALTER COLUMN "province_id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE IF EXISTS "geographic_locations_province_id_seq";--> statement-breakpoint
-- 3. El NOT NULL se queda —nunca se sacó— pero ahora está por la razón
--    correcta: no existe unidad territorial argentina que no pertenezca a una
--    provincia. Con clave foránea, que es lo que nunca tuvo. Tiene que correr
--    DESPUÉS del UPDATE de arriba: contra los valores viejos no valida.
--    La spec la nombraba `geographic_locations_province_fk`; acá lleva el
--    nombre canónico de drizzle, que es como el repo nombra sus otras nueve FK
--    contra esta tabla, para que `migrations/meta/` y la base digan lo mismo y
--    la 0015 no la lea como un constraint desconocido.
ALTER TABLE "geographic_locations" ADD CONSTRAINT "geographic_locations_province_id_geographic_locations_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- 4. El nombre deja de ser identidad: con 4.027 localidades censales el país
--    tiene decenas de «San Martín» y la segunda revienta. Se creó con
--    CREATE UNIQUE INDEX (0002_charming_scrambler.sql:33), así que se tira con
--    DROP INDEX; `DROP CONSTRAINT` fallaría.
DROP INDEX "geographic_locations_level_name_unique";--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD COLUMN "department_id" integer;--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD COLUMN "municipality_id" integer;--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD COLUMN "georef_id" text;--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD COLUMN "name_norm" text;--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD COLUMN "vigente_hasta" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "geo_calles" ADD CONSTRAINT "geo_calles_localidad_id_geographic_locations_id_fk" FOREIGN KEY ("localidad_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_calles" ADD CONSTRAINT "geo_calles_departamento_id_geographic_locations_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geo_calles" ADD CONSTRAINT "geo_calles_provincia_id_geographic_locations_id_fk" FOREIGN KEY ("provincia_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "geo_calles_georef_unique" ON "geo_calles" USING btree ("georef_id");--> statement-breakpoint
CREATE INDEX "geo_calles_localidad_nombre_idx" ON "geo_calles" USING btree ("localidad_id","nombre_norm");--> statement-breakpoint
CREATE INDEX "geo_calles_departamento_nombre_idx" ON "geo_calles" USING btree ("departamento_id","nombre_norm");--> statement-breakpoint
CREATE INDEX "geo_calles_provincia_nombre_idx" ON "geo_calles" USING btree ("provincia_id","nombre_norm");--> statement-breakpoint
CREATE UNIQUE INDEX "geo_catalogo_version_vigente_unique" ON "geo_catalogo_version" USING btree ("vigente") WHERE "geo_catalogo_version"."vigente";--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD CONSTRAINT "geographic_locations_parent_id_geographic_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD CONSTRAINT "geographic_locations_department_id_geographic_locations_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD CONSTRAINT "geographic_locations_municipality_id_geographic_locations_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."geographic_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "geographic_locations_georef_unique" ON "geographic_locations" USING btree ("georef_id");--> statement-breakpoint
CREATE INDEX "geographic_locations_parent_idx" ON "geographic_locations" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "geographic_locations_municipality_idx" ON "geographic_locations" USING btree ("municipality_id");--> statement-breakpoint
CREATE INDEX "geographic_locations_level_norm_idx" ON "geographic_locations" USING btree ("level","name_norm");--> statement-breakpoint
ALTER TABLE "geographic_locations" ADD CONSTRAINT "geographic_locations_level_chk" CHECK ("geographic_locations"."level" in ('province','department','municipality','locality','settlement'));