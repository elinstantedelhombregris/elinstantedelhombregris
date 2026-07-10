CREATE TABLE `commitments` (
	`id` text PRIMARY KEY NOT NULL,
	`texto` text NOT NULL,
	`categoria` text NOT NULL,
	`fecha` text NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `days` (
	`fecha` text PRIMARY KEY NOT NULL,
	`ver` integer DEFAULT false NOT NULL,
	`encender` integer DEFAULT false NOT NULL,
	`dar` integer DEFAULT false NOT NULL,
	`noche_completa` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ember_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`delta` integer NOT NULL,
	`motivo` text NOT NULL,
	`fecha` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expedition_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`expedition_id` text NOT NULL,
	`step_key` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`star_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expeditions` (
	`id` text PRIMARY KEY NOT NULL,
	`plantilla_id` text NOT NULL,
	`titulo` text NOT NULL,
	`zona` text NOT NULL,
	`meta` integer NOT NULL,
	`estado` text DEFAULT 'activa' NOT NULL,
	`origen` text NOT NULL,
	`hitos_otorgados` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `redeemed_nonces` (
	`nonce` text PRIMARY KEY NOT NULL,
	`fecha` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reflections` (
	`id` text PRIMARY KEY NOT NULL,
	`pregunta_id` text NOT NULL,
	`texto` text NOT NULL,
	`fecha` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stars` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`texto` text,
	`photo_uri` text,
	`lat` real,
	`lng` real,
	`fundadora` integer DEFAULT false NOT NULL,
	`nocturna` integer DEFAULT false NOT NULL,
	`fugaz` integer DEFAULT false NOT NULL,
	`expedition_id` text,
	`expedition_step_key` text,
	`constelacion_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `unlocks` (
	`id` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`clave` text NOT NULL,
	`fecha` text NOT NULL
);
