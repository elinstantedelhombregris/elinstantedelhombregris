CREATE TABLE "identidades_externas" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"proveedor" text NOT NULL,
	"sujeto" text NOT NULL,
	"correo" text NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL,
	"usada_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "identidades_externas_proveedor_chk" CHECK ("identidades_externas"."proveedor" in ('google'))
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "identidades_externas" ADD CONSTRAINT "identidades_externas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "identidades_externas_sujeto_unique" ON "identidades_externas" USING btree ("proveedor","sujeto");--> statement-breakpoint
CREATE INDEX "identidades_externas_user_idx" ON "identidades_externas" USING btree ("user_id");