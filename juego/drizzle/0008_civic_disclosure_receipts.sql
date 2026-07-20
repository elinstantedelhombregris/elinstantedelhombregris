CREATE TABLE `civic_disclosure_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`disclosure_key` text NOT NULL,
	`kind` text DEFAULT 'disclosure' NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`revokes_receipt_id` text,
	`audience` text NOT NULL,
	`authorized_fields_json` text DEFAULT '[]' NOT NULL,
	`shared_precision` text NOT NULL,
	`attribution_mode` text NOT NULL,
	`attribution_name` text,
	`purpose` text NOT NULL,
	`policy_version` integer NOT NULL,
	`recorded_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `civic_disclosure_receipts_key_idx` ON `civic_disclosure_receipts` (`disclosure_key`);--> statement-breakpoint
CREATE INDEX `civic_disclosure_receipts_entity_idx` ON `civic_disclosure_receipts` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `civic_disclosure_receipts_recorded_idx` ON `civic_disclosure_receipts` (`recorded_at`);--> statement-breakpoint
CREATE INDEX `civic_disclosure_receipts_revokes_idx` ON `civic_disclosure_receipts` (`revokes_receipt_id`);
