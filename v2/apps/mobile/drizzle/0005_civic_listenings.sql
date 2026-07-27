CREATE TABLE `civic_listenings` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`source` text NOT NULL,
	`theme` text NOT NULL,
	`statement` text NOT NULL,
	`desired_outcome` text,
	`existing_strength` text,
	`first_step` text,
	`horizon` text NOT NULL,
	`scope` text NOT NULL,
	`importance` integer DEFAULT 3 NOT NULL,
	`support_wanted` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'private' NOT NULL,
	`observation_id` text,
	`need_id` text,
	`resource_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `civic_listenings_kind_idx` ON `civic_listenings` (`kind`);--> statement-breakpoint
CREATE INDEX `civic_listenings_theme_idx` ON `civic_listenings` (`theme`);--> statement-breakpoint
CREATE INDEX `civic_listenings_status_idx` ON `civic_listenings` (`status`);