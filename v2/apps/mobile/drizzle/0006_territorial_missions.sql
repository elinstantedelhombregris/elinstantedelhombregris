CREATE TABLE `civic_mission_cells` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`cell_key` text NOT NULL,
	`geometry_json` text NOT NULL,
	`center_lat` real NOT NULL,
	`center_lng` real NOT NULL,
	`status` text DEFAULT 'unknown' NOT NULL,
	`observation_id` text,
	`assigned_to_key` text,
	`route_key` text,
	`assigned_at` text,
	`observed_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `civic_mission_cells_key_idx` ON `civic_mission_cells` (`mission_id`,`cell_key`);--> statement-breakpoint
CREATE INDEX `civic_mission_cells_status_idx` ON `civic_mission_cells` (`mission_id`,`status`);--> statement-breakpoint
CREATE INDEX `civic_mission_cells_observation_idx` ON `civic_mission_cells` (`observation_id`);--> statement-breakpoint
CREATE TABLE `civic_missions` (
	`id` text PRIMARY KEY NOT NULL,
	`territory_id` text NOT NULL,
	`campaign_key` text NOT NULL,
	`campaign_version` integer DEFAULT 1 NOT NULL,
	`title` text NOT NULL,
	`purpose` text NOT NULL,
	`decision_recipient` text NOT NULL,
	`steward` text NOT NULL,
	`verification_method` text NOT NULL,
	`min_independent_verifications` integer DEFAULT 2 NOT NULL,
	`public_precision` text NOT NULL,
	`retention_days` integer NOT NULL,
	`closure_condition` text NOT NULL,
	`sensitivity` text DEFAULT 'low' NOT NULL,
	`status` text DEFAULT 'planning' NOT NULL,
	`planned_cells` integer NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `civic_missions_territory_idx` ON `civic_missions` (`territory_id`);--> statement-breakpoint
CREATE INDEX `civic_missions_status_idx` ON `civic_missions` (`status`);