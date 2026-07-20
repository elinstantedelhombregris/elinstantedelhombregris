CREATE TABLE `pv_mision_miembros` (
	`mision_id` text NOT NULL,
	`actor_key` text NOT NULL,
	`rol` text NOT NULL,
	`comprometido_at` text NOT NULL,
	`ultimo_latido_at` text,
	PRIMARY KEY(`mision_id`, `actor_key`)
);
--> statement-breakpoint
CREATE TABLE `pv_misiones` (
	`id` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`proposito` text NOT NULL,
	`tipo` text NOT NULL,
	`oficio_id` text NOT NULL,
	`estado` text DEFAULT 'propuesta' NOT NULL,
	`gobernanza` text NOT NULL,
	`territorio` text,
	`parent_id` text,
	`creada_por` text NOT NULL,
	`created_at` text NOT NULL,
	`resuelta_at` text
);
--> statement-breakpoint
CREATE TABLE `pv_obras` (
	`id` text PRIMARY KEY NOT NULL,
	`mision_id` text,
	`titulo` text NOT NULL,
	`resumen` text,
	`oficio_id` text NOT NULL,
	`evidencia_uri` text,
	`territorio` text,
	`publicada_at` text NOT NULL,
	`estado` text DEFAULT 'sin_corroborar' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pv_pulsos` (
	`id` text PRIMARY KEY NOT NULL,
	`target_tipo` text NOT NULL,
	`target_id` text NOT NULL,
	`actor_key` text NOT NULL,
	`fecha` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pv_pulsos_unico` ON `pv_pulsos` (`actor_key`,`target_tipo`,`target_id`);
