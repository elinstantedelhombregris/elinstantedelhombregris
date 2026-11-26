ALTER TABLE "pila_respuestas" ADD COLUMN "fuera_de_mirar" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- D-168: una opinión dada en la página del aporte nace mostrada y contestada en el mismo
-- instante (la tanda de Mirar la registra antes). Es la misma marca que ya usa
-- `actividadReciente` para no contarla como tanda. Si después se cambió, la marca se pierde:
-- esas pocas quedan como de Mirar.
UPDATE "pila_respuestas" SET "fuera_de_mirar" = true WHERE "respondida_en" = "mostrada_en";
