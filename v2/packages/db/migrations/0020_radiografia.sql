CREATE TABLE "analisis_corridas" (
	"id" serial PRIMARY KEY NOT NULL,
	"modelo" text NOT NULL,
	"dimensiones" integer NOT NULL,
	"fuente" text NOT NULL,
	"procesadas" integer NOT NULL,
	"corte" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analisis_corridas_procesadas_chk" CHECK ("analisis_corridas"."procesadas" >= 0),
	CONSTRAINT "analisis_corridas_dimensiones_chk" CHECK ("analisis_corridas"."dimensiones" > 0)
);
--> statement-breakpoint
CREATE TABLE "analisis_vectores" (
	"fuente" text NOT NULL,
	"fuente_id" text NOT NULL,
	"modelo" text NOT NULL,
	"dimensiones" integer NOT NULL,
	"vector" jsonb NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analisis_vectores_fuente_fuente_id_modelo_pk" PRIMARY KEY("fuente","fuente_id","modelo"),
	CONSTRAINT "analisis_vectores_dimensiones_chk" CHECK ("analisis_vectores"."dimensiones" > 0),
	CONSTRAINT "analisis_vectores_largo_chk" CHECK (jsonb_typeof("analisis_vectores"."vector") = 'array' and jsonb_array_length("analisis_vectores"."vector") = "analisis_vectores"."dimensiones")
);
--> statement-breakpoint
CREATE INDEX "analisis_corridas_fuente_corte_idx" ON "analisis_corridas" USING btree ("fuente","corte");--> statement-breakpoint
CREATE INDEX "analisis_vectores_fuente_modelo_idx" ON "analisis_vectores" USING btree ("fuente","modelo");