CREATE TABLE `civic_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`scheduled_at` text,
	`completed_at` text,
	`confirmed_at` text,
	`outcome_json` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `civic_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`purpose` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`granted` integer NOT NULL,
	`granted_at` text,
	`revoked_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `civic_consents_scope_version_idx` ON `civic_consents` (`scope`,`version`);--> statement-breakpoint
CREATE TABLE `civic_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`need_id` text NOT NULL,
	`resource_id` text NOT NULL,
	`score` integer NOT NULL,
	`reasons_json` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'proposed' NOT NULL,
	`accepted_need_at` text,
	`accepted_resource_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `civic_matches_pair_idx` ON `civic_matches` (`need_id`,`resource_id`);--> statement-breakpoint
CREATE INDEX `civic_matches_status_idx` ON `civic_matches` (`status`);--> statement-breakpoint
CREATE TABLE `civic_needs` (
	`id` text PRIMARY KEY NOT NULL,
	`observation_id` text,
	`territory_id` text,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`quantity` real,
	`unit` text,
	`urgency` integer DEFAULT 3 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`public_lat` real,
	`public_lng` real,
	`public_precision` text DEFAULT 'neighborhood' NOT NULL,
	`location_label` text,
	`contact_consent` integer DEFAULT false NOT NULL,
	`expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `civic_needs_category_idx` ON `civic_needs` (`category`);--> statement-breakpoint
CREATE INDEX `civic_needs_status_idx` ON `civic_needs` (`status`);--> statement-breakpoint
CREATE TABLE `civic_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_key` text NOT NULL,
	`campaign_version` integer DEFAULT 1 NOT NULL,
	`territory_id` text,
	`star_id` text,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`data_json` text DEFAULT '{}' NOT NULL,
	`evidence_json` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`confidence` real DEFAULT 0 NOT NULL,
	`exact_lat` real,
	`exact_lng` real,
	`public_lat` real,
	`public_lng` real,
	`public_precision` text DEFAULT '500m' NOT NULL,
	`location_label` text,
	`observed_at` text NOT NULL,
	`expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced_at` text
);
--> statement-breakpoint
CREATE INDEX `civic_observations_campaign_idx` ON `civic_observations` (`campaign_key`);--> statement-breakpoint
CREATE INDEX `civic_observations_status_idx` ON `civic_observations` (`status`);--> statement-breakpoint
CREATE INDEX `civic_observations_territory_idx` ON `civic_observations` (`territory_id`);--> statement-breakpoint
CREATE TABLE `civic_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`territory_id` text,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`quantity` real,
	`unit` text,
	`availability_json` text DEFAULT '{}' NOT NULL,
	`radius_km` real DEFAULT 5 NOT NULL,
	`confidence` real DEFAULT 0.5 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`public_lat` real,
	`public_lng` real,
	`public_precision` text DEFAULT 'neighborhood' NOT NULL,
	`location_label` text,
	`contact_consent` integer DEFAULT false NOT NULL,
	`expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `civic_resources_category_idx` ON `civic_resources` (`category`);--> statement-breakpoint
CREATE INDEX `civic_resources_status_idx` ON `civic_resources` (`status`);--> statement-breakpoint
CREATE TABLE `civic_territories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`geometry_json` text,
	`center_lat` real,
	`center_lng` real,
	`radius_km` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `civic_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`observation_id` text NOT NULL,
	`verdict` text NOT NULL,
	`note` text,
	`evidence_json` text DEFAULT '[]' NOT NULL,
	`verifier_key` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `civic_verifications_observation_idx` ON `civic_verifications` (`observation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `civic_verifications_actor_once_idx` ON `civic_verifications` (`observation_id`,`verifier_key`);--> statement-breakpoint
CREATE TABLE `sync_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`idempotency_key` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`operation` text NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` text,
	`last_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sync_outbox_idempotency_idx` ON `sync_outbox` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `sync_outbox_status_idx` ON `sync_outbox` (`status`);