ALTER TABLE "prueba_eventos" ADD COLUMN "id_local" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "prueba_eventos" ADD COLUMN "huella" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pruebas_territoriales" ADD COLUMN "id_local" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "pruebas_territoriales" ADD COLUMN "responsable_nombre" text;--> statement-breakpoint
ALTER TABLE "prueba_eventos" ADD CONSTRAINT "prueba_evento_envio_unique" UNIQUE("prueba_id","id_local");--> statement-breakpoint
ALTER TABLE "pruebas_territoriales" ADD CONSTRAINT "prueba_envio_unique" UNIQUE("creador_id","id_local");