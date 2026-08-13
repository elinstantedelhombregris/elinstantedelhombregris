CREATE SCHEMA "simulacion";
--> statement-breakpoint
CREATE TABLE "simulacion"."elencos" (
	"huella" text PRIMARY KEY NOT NULL,
	"modelo" text NOT NULL,
	"digest" text NOT NULL,
	"temperatura" double precision NOT NULL,
	"semilla" integer NOT NULL,
	"corpus_huella" text NOT NULL,
	"personas" integer NOT NULL,
	"sesgo" jsonb NOT NULL,
	"fabricado" boolean NOT NULL,
	"generada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sim_elencos_personas_chk" CHECK ("simulacion"."elencos"."personas" > 0),
	CONSTRAINT "sim_elencos_temperatura_chk" CHECK ("simulacion"."elencos"."temperatura" >= 0),
	CONSTRAINT "sim_elencos_huella_chk" CHECK (length("simulacion"."elencos"."huella") >= 16),
	CONSTRAINT "sim_elencos_digest_chk" CHECK (("simulacion"."elencos"."fabricado" and "simulacion"."elencos"."digest" = '') or (not "simulacion"."elencos"."fabricado" and length("simulacion"."elencos"."digest") > 0))
);
--> statement-breakpoint
CREATE TABLE "simulacion"."frases" (
	"elenco_huella" text NOT NULL,
	"persona_id" integer NOT NULL,
	"orden" integer NOT NULL,
	"tipo" text NOT NULL,
	"clase" text NOT NULL,
	"texto" text NOT NULL,
	CONSTRAINT "frases_elenco_huella_persona_id_orden_pk" PRIMARY KEY("elenco_huella","persona_id","orden"),
	CONSTRAINT "sim_frases_orden_chk" CHECK ("simulacion"."frases"."orden" >= 0),
	CONSTRAINT "sim_frases_tipo_chk" CHECK ("simulacion"."frases"."tipo" in ('basta', 'necesidad', 'recurso', 'práctica', 'saber', 'sueño', 'propuesta', 'compromiso', 'pregunta')),
	CONSTRAINT "sim_frases_clase_chk" CHECK ("simulacion"."frases"."clase" in ('hecho', 'deseo', 'acto', 'meta')),
	CONSTRAINT "sim_frases_texto_chk" CHECK (length("simulacion"."frases"."texto") > 0)
);
--> statement-breakpoint
CREATE TABLE "simulacion"."personas" (
	"elenco_huella" text NOT NULL,
	"id" integer NOT NULL,
	"origen_documento" text NOT NULL,
	"origen_ancla" text NOT NULL,
	"origen_sha" text NOT NULL,
	"provincia_id" integer NOT NULL,
	"departamento_id" integer,
	"localidad_id" integer,
	"celda_id" text NOT NULL,
	"propension" double precision NOT NULL,
	"constancia_personal" double precision NOT NULL,
	"umbral_adhesion" double precision NOT NULL,
	"umbral_corroboracion" double precision NOT NULL,
	"radio_atencion" text NOT NULL,
	"mezcla_tipos" jsonb NOT NULL,
	"vinculos" jsonb NOT NULL,
	"oficio" text NOT NULL,
	"tramo_edad" text NOT NULL,
	"arraigo_anios" integer NOT NULL,
	CONSTRAINT "personas_elenco_huella_id_pk" PRIMARY KEY("elenco_huella","id"),
	CONSTRAINT "sim_personas_id_chk" CHECK ("simulacion"."personas"."id" >= 0),
	CONSTRAINT "sim_personas_provincia_chk" CHECK ("simulacion"."personas"."provincia_id" > 0),
	CONSTRAINT "sim_personas_arraigo_chk" CHECK ("simulacion"."personas"."arraigo_anios" >= 0),
	CONSTRAINT "sim_personas_radio_chk" CHECK ("simulacion"."personas"."radio_atencion" in ('cuadra', 'barrio', 'municipio', 'provincia', 'pais')),
	CONSTRAINT "sim_personas_dominios_chk" CHECK ("simulacion"."personas"."propension" between 0 and 1 and "simulacion"."personas"."constancia_personal" between 0 and 1
          and "simulacion"."personas"."umbral_adhesion" between 0 and 1 and "simulacion"."personas"."umbral_corroboracion" between 0 and 1),
	CONSTRAINT "sim_personas_vinculos_chk" CHECK (jsonb_typeof("simulacion"."personas"."vinculos") = 'array'),
	CONSTRAINT "sim_personas_mezcla_chk" CHECK (jsonb_typeof("simulacion"."personas"."mezcla_tipos") = 'object')
);
--> statement-breakpoint
CREATE TABLE "simulacion"."corridas" (
	"id" serial PRIMARY KEY NOT NULL,
	"escenario_huella" text NOT NULL,
	"pais_huella" text NOT NULL,
	"modo" text NOT NULL,
	"semilla" integer NOT NULL,
	"funcion_id" text,
	"sello" jsonb,
	"reproducible" boolean NOT NULL,
	"resumen" jsonb NOT NULL,
	"pedido" jsonb NOT NULL,
	"logrado" jsonb NOT NULL,
	"cobertura" jsonb NOT NULL,
	"mandatos" jsonb NOT NULL,
	"cosecha_huella" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sim_corridas_modo_chk" CHECK ("simulacion"."corridas"."modo" in ('forma', 'gente')),
	CONSTRAINT "sim_corridas_mandatos_chk" CHECK (jsonb_typeof("simulacion"."corridas"."mandatos") = 'array'),
	CONSTRAINT "sim_corridas_sello_solo_en_gente_chk" CHECK (("simulacion"."corridas"."modo" = 'gente' and "simulacion"."corridas"."sello" is not null and "simulacion"."corridas"."funcion_id" is not null)
          or ("simulacion"."corridas"."modo" = 'forma' and "simulacion"."corridas"."sello" is null and "simulacion"."corridas"."funcion_id" is null))
);
--> statement-breakpoint
CREATE TABLE "simulacion"."escenarios" (
	"huella" text PRIMARY KEY NOT NULL,
	"pais_huella" text NOT NULL,
	"ahora" bigint NOT NULL,
	"forma" jsonb NOT NULL,
	"ajustes" jsonb NOT NULL,
	"mecanismo" jsonb,
	"coeficientes" jsonb NOT NULL,
	"razon" text NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sim_escenarios_huella_chk" CHECK (length("simulacion"."escenarios"."huella") >= 16),
	CONSTRAINT "sim_escenarios_ahora_chk" CHECK ("simulacion"."escenarios"."ahora" > 0),
	CONSTRAINT "sim_escenarios_razon_chk" CHECK (length("simulacion"."escenarios"."razon") > 0)
);
--> statement-breakpoint
CREATE TABLE "simulacion"."funciones" (
	"id" text PRIMARY KEY NOT NULL,
	"escenario_huella" text NOT NULL,
	"elenco_huella" text NOT NULL,
	"semilla" integer NOT NULL,
	"rondas" integer NOT NULL,
	"guion" jsonb,
	"corrida_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sim_funciones_rondas_chk" CHECK ("simulacion"."funciones"."rondas" > 0),
	CONSTRAINT "sim_funciones_guion_chk" CHECK ("simulacion"."funciones"."guion" is null or jsonb_typeof("simulacion"."funciones"."guion") = 'array')
);
--> statement-breakpoint
CREATE TABLE "simulacion"."adhesiones_ensayadas" (
	"funcion_id" text NOT NULL,
	"senal_id" integer NOT NULL,
	"persona_id" integer NOT NULL,
	"ronda" integer NOT NULL,
	CONSTRAINT "adhesiones_ensayadas_funcion_id_senal_id_persona_id_pk" PRIMARY KEY("funcion_id","senal_id","persona_id"),
	CONSTRAINT "sim_adhesiones_ronda_chk" CHECK ("simulacion"."adhesiones_ensayadas"."ronda" >= 1)
);
--> statement-breakpoint
CREATE TABLE "simulacion"."confirmaciones_ensayadas" (
	"funcion_id" text NOT NULL,
	"senal_id" integer NOT NULL,
	"ronda" integer NOT NULL,
	"persona_id" integer NOT NULL,
	"veredicto" text NOT NULL,
	"cuenta" boolean NOT NULL,
	CONSTRAINT "confirmacion_actor_distinto" PRIMARY KEY("funcion_id","senal_id","ronda","persona_id"),
	CONSTRAINT "sim_confirmaciones_ronda_chk" CHECK ("simulacion"."confirmaciones_ensayadas"."ronda" >= 1),
	CONSTRAINT "sim_confirmaciones_veredicto_chk" CHECK ("simulacion"."confirmaciones_ensayadas"."veredicto" in ('confirma', 'desmiente', 'no_sabe'))
);
--> statement-breakpoint
CREATE TABLE "simulacion"."entrevistas" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"funcion_id" text NOT NULL,
	"elenco_huella" text NOT NULL,
	"persona_id" integer NOT NULL,
	"pregunta" text NOT NULL,
	"respuesta" text NOT NULL,
	"sello" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"descartada_en" timestamp with time zone,
	CONSTRAINT "sim_entrevistas_pregunta_chk" CHECK (length("simulacion"."entrevistas"."pregunta") > 0),
	CONSTRAINT "sim_entrevistas_sello_chk" CHECK (length("simulacion"."entrevistas"."sello") > 0)
);
--> statement-breakpoint
CREATE TABLE "simulacion"."rastro_funcion" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"funcion_id" text NOT NULL,
	"ronda" integer NOT NULL,
	"senal_id" integer,
	"persona_id" integer,
	"actor_clase" text NOT NULL,
	"tipo_evento" text NOT NULL,
	"estado_nuevo" text,
	CONSTRAINT "sim_rastro_ronda_chk" CHECK ("simulacion"."rastro_funcion"."ronda" >= 1),
	CONSTRAINT "sim_rastro_actor_clase_chk" CHECK ("simulacion"."rastro_funcion"."actor_clase" in ('maquina')),
	CONSTRAINT "rastro_sugerencia_no_mueve_estado_check" CHECK ("simulacion"."rastro_funcion"."tipo_evento" <> 'sugerencia_automatica' or "simulacion"."rastro_funcion"."estado_nuevo" is null),
	CONSTRAINT "sim_rastro_estado_nuevo_chk" CHECK ("simulacion"."rastro_funcion"."estado_nuevo" is null or "simulacion"."rastro_funcion"."estado_nuevo" in ('enviada', 'corroborada', 'desactualizada', 'resuelta'))
);
--> statement-breakpoint
CREATE TABLE "simulacion"."senales_ensayadas" (
	"funcion_id" text NOT NULL,
	"id" integer NOT NULL,
	"persona_id" integer,
	"ronda" integer NOT NULL,
	"tipo" text NOT NULL,
	"clase" text NOT NULL,
	"estado" text NOT NULL,
	"tema" text,
	"tema_origen" text NOT NULL,
	"provincia_id" integer NOT NULL,
	"departamento_id" integer,
	"localidad_id" integer,
	"celda_id" text NOT NULL,
	"precision" text NOT NULL,
	"location_role" text NOT NULL,
	"sensitivity" text NOT NULL,
	"direccion_estado" text NOT NULL,
	"altura" integer,
	"creada_en_ms" bigint NOT NULL,
	"vence_el_ms" bigint,
	"caduca_el_ms" bigint,
	"comprometido_para_ms" bigint,
	"desenlace" text,
	"retenida_en_ms" bigint,
	CONSTRAINT "senales_ensayadas_funcion_id_id_pk" PRIMARY KEY("funcion_id","id"),
	CONSTRAINT "sim_senales_ronda_chk" CHECK ("simulacion"."senales_ensayadas"."ronda" >= 1),
	CONSTRAINT "sim_senales_provincia_chk" CHECK ("simulacion"."senales_ensayadas"."provincia_id" > 0),
	CONSTRAINT "sim_senales_estado_chk" CHECK ("simulacion"."senales_ensayadas"."estado" in ('enviada', 'corroborada', 'desactualizada', 'resuelta')),
	CONSTRAINT "sim_senales_tema_origen_chk" CHECK ("simulacion"."senales_ensayadas"."tema_origen" in ('declarado', 'sugerido', 'ninguno')),
	CONSTRAINT "sim_senales_precision_chk" CHECK ("simulacion"."senales_ensayadas"."precision" in ('exact', '100m', '500m', 'neighborhood', 'city', 'province')),
	CONSTRAINT "sim_senales_rol_chk" CHECK ("simulacion"."senales_ensayadas"."location_role" in ('subject', 'capture', 'service_area', 'meeting_point')),
	CONSTRAINT "sim_senales_sensibilidad_chk" CHECK ("simulacion"."senales_ensayadas"."sensitivity" in ('low', 'moderate', 'high')),
	CONSTRAINT "sim_senales_direccion_chk" CHECK ("simulacion"."senales_ensayadas"."direccion_estado" in ('sin_direccion', 'calle', 'altura_en_rango', 'altura_sin_rango', 'altura_fuera_de_rango', 'texto_libre')),
	CONSTRAINT "sim_senales_tipo_clase_chk" CHECK (("simulacion"."senales_ensayadas"."tipo", "simulacion"."senales_ensayadas"."clase") in (('basta', 'hecho'), ('necesidad', 'hecho'), ('recurso', 'hecho'), ('práctica', 'hecho'), ('saber', 'hecho'), ('sueño', 'deseo'), ('propuesta', 'deseo'), ('compromiso', 'acto'), ('pregunta', 'meta'))),
	CONSTRAINT "sim_senales_corroborada_solo_verificable_chk" CHECK ("simulacion"."senales_ensayadas"."estado" <> 'corroborada' or "simulacion"."senales_ensayadas"."clase" in ('hecho', 'acto')),
	CONSTRAINT "sim_senales_altura_por_tipo_chk" CHECK ("simulacion"."senales_ensayadas"."altura" is null or "simulacion"."senales_ensayadas"."tipo" in ('basta', 'recurso', 'práctica', 'compromiso')),
	CONSTRAINT "sim_senales_sujeto_sensible_sin_direccion_chk" CHECK (not ("simulacion"."senales_ensayadas"."location_role" = 'subject' and "simulacion"."senales_ensayadas"."sensitivity" = 'high')
          or "simulacion"."senales_ensayadas"."direccion_estado" = 'sin_direccion'),
	CONSTRAINT "sim_senales_tema_invariante_chk" CHECK (("simulacion"."senales_ensayadas"."tema" is null) = ("simulacion"."senales_ensayadas"."tema_origen" = 'ninguno')),
	CONSTRAINT "sim_senales_acto_chk" CHECK (("simulacion"."senales_ensayadas"."clase" = 'acto') = ("simulacion"."senales_ensayadas"."comprometido_para_ms" is not null)
          and ("simulacion"."senales_ensayadas"."clase" = 'acto') = ("simulacion"."senales_ensayadas"."desenlace" is not null)),
	CONSTRAINT "sim_senales_desenlace_chk" CHECK ("simulacion"."senales_ensayadas"."desenlace" is null or "simulacion"."senales_ensayadas"."desenlace" in ('abierto', 'cumplido', 'vencido', 'no_cumplido'))
);
--> statement-breakpoint
ALTER TABLE "simulacion"."frases" ADD CONSTRAINT "sim_frases_persona_fk" FOREIGN KEY ("elenco_huella","persona_id") REFERENCES "simulacion"."personas"("elenco_huella","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."personas" ADD CONSTRAINT "personas_elenco_huella_elencos_huella_fk" FOREIGN KEY ("elenco_huella") REFERENCES "simulacion"."elencos"("huella") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."corridas" ADD CONSTRAINT "corridas_escenario_huella_escenarios_huella_fk" FOREIGN KEY ("escenario_huella") REFERENCES "simulacion"."escenarios"("huella") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."corridas" ADD CONSTRAINT "corridas_funcion_id_funciones_id_fk" FOREIGN KEY ("funcion_id") REFERENCES "simulacion"."funciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."funciones" ADD CONSTRAINT "funciones_escenario_huella_escenarios_huella_fk" FOREIGN KEY ("escenario_huella") REFERENCES "simulacion"."escenarios"("huella") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."funciones" ADD CONSTRAINT "funciones_elenco_huella_elencos_huella_fk" FOREIGN KEY ("elenco_huella") REFERENCES "simulacion"."elencos"("huella") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."adhesiones_ensayadas" ADD CONSTRAINT "sim_adhesiones_senal_fk" FOREIGN KEY ("funcion_id","senal_id") REFERENCES "simulacion"."senales_ensayadas"("funcion_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."confirmaciones_ensayadas" ADD CONSTRAINT "sim_confirmaciones_senal_fk" FOREIGN KEY ("funcion_id","senal_id") REFERENCES "simulacion"."senales_ensayadas"("funcion_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."entrevistas" ADD CONSTRAINT "entrevistas_funcion_id_funciones_id_fk" FOREIGN KEY ("funcion_id") REFERENCES "simulacion"."funciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."entrevistas" ADD CONSTRAINT "sim_entrevistas_persona_fk" FOREIGN KEY ("elenco_huella","persona_id") REFERENCES "simulacion"."personas"("elenco_huella","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."rastro_funcion" ADD CONSTRAINT "rastro_funcion_funcion_id_funciones_id_fk" FOREIGN KEY ("funcion_id") REFERENCES "simulacion"."funciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacion"."senales_ensayadas" ADD CONSTRAINT "senales_ensayadas_funcion_id_funciones_id_fk" FOREIGN KEY ("funcion_id") REFERENCES "simulacion"."funciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sim_personas_provincia_idx" ON "simulacion"."personas" USING btree ("elenco_huella","provincia_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sim_corridas_punto_uidx" ON "simulacion"."corridas" USING btree ("escenario_huella","modo","semilla","cosecha_huella");--> statement-breakpoint
CREATE INDEX "sim_corridas_funcion_idx" ON "simulacion"."corridas" USING btree ("funcion_id");--> statement-breakpoint
CREATE INDEX "sim_funciones_escenario_idx" ON "simulacion"."funciones" USING btree ("escenario_huella");--> statement-breakpoint
CREATE INDEX "sim_funciones_elenco_idx" ON "simulacion"."funciones" USING btree ("elenco_huella");--> statement-breakpoint
CREATE INDEX "sim_entrevistas_funcion_idx" ON "simulacion"."entrevistas" USING btree ("funcion_id");--> statement-breakpoint
CREATE INDEX "sim_rastro_funcion_idx" ON "simulacion"."rastro_funcion" USING btree ("funcion_id","ronda");--> statement-breakpoint
CREATE INDEX "sim_senales_provincia_idx" ON "simulacion"."senales_ensayadas" USING btree ("funcion_id","provincia_id","ronda");--> statement-breakpoint
CREATE INDEX "sim_senales_clase_idx" ON "simulacion"."senales_ensayadas" USING btree ("funcion_id","clase");