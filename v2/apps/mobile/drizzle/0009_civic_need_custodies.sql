CREATE TABLE `civic_need_custodies` (
	`need_id` text PRIMARY KEY NOT NULL,
	`listening_id` text NOT NULL,
	`custodian_kind` text NOT NULL,
	`custodian_label` text,
	`decision_recipient` text NOT NULL,
	`decision_recipient_label` text,
	`contact_route` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `civic_need_custodies_listening_idx` ON `civic_need_custodies` (`listening_id`);--> statement-breakpoint
CREATE INDEX `civic_need_custodies_status_idx` ON `civic_need_custodies` (`status`);
