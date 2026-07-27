ALTER TABLE "dreams" ADD COLUMN "lat" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "dreams" ADD COLUMN "lng" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "dreams" ADD COLUMN "precision" text DEFAULT 'province' NOT NULL;--> statement-breakpoint
ALTER TABLE "dreams" ADD COLUMN "location_role" text DEFAULT 'subject' NOT NULL;--> statement-breakpoint
ALTER TABLE "dreams" ADD COLUMN "sensitivity" text DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "city_id" integer;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "lat" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "lng" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "precision" text DEFAULT 'province' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "location_role" text DEFAULT 'subject' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "sensitivity" text DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD COLUMN "city_id" integer;--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD COLUMN "lat" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD COLUMN "lng" numeric(9, 6);--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD COLUMN "precision" text DEFAULT 'province' NOT NULL;--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD COLUMN "location_role" text DEFAULT 'subject' NOT NULL;--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD COLUMN "sensitivity" text DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_city_id_geographic_locations_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_signals" ADD CONSTRAINT "pulse_signals_city_id_geographic_locations_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."geographic_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dreams_geo_idx" ON "dreams" USING btree ("lat","lng") WHERE lat is not null;--> statement-breakpoint
CREATE INDEX "proposals_geo_idx" ON "proposals" USING btree ("lat","lng") WHERE lat is not null;--> statement-breakpoint
CREATE INDEX "pulse_signals_geo_idx" ON "pulse_signals" USING btree ("lat","lng") WHERE lat is not null;