ALTER TABLE "opiniones" ALTER COLUMN "valor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "opiniones" ALTER COLUMN "respondida_en" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "opiniones" ALTER COLUMN "respondida_en" DROP NOT NULL;