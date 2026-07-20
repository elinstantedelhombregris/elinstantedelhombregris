CREATE TABLE `civic_record_contexts` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`location_role` text DEFAULT 'subject' NOT NULL,
	`location_source` text DEFAULT 'none' NOT NULL,
	`exact_lat` real,
	`exact_lng` real,
	`horizontal_accuracy_m` real,
	`captured_at` text,
	`public_lat` real,
	`public_lng` real,
	`shared_precision` text DEFAULT 'neighborhood' NOT NULL,
	`location_label` text,
	`audience` text DEFAULT 'private' NOT NULL,
	`attribution_mode` text DEFAULT 'anonymous' NOT NULL,
	`attribution_name` text,
	`sensitivity` text DEFAULT 'moderate' NOT NULL,
	`location_consent` integer DEFAULT false NOT NULL,
	`attribution_consent` integer DEFAULT false NOT NULL,
	`confirmed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `civic_record_context_entity_idx` ON `civic_record_contexts` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `civic_record_context_public_location_idx` ON `civic_record_contexts` (`public_lat`,`public_lng`);--> statement-breakpoint
CREATE INDEX `civic_record_context_audience_idx` ON `civic_record_contexts` (`audience`);