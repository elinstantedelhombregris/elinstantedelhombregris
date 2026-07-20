CREATE TABLE `civic_need_access_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`need_id` text NOT NULL,
	`recipient_kind` text NOT NULL,
	`recipient_key` text NOT NULL,
	`recipient_label` text NOT NULL,
	`scope` text NOT NULL,
	`purpose` text NOT NULL,
	`authorized_fields_json` text NOT NULL,
	`projection_json` text NOT NULL,
	`policy_version` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`expires_at` text NOT NULL,
	`granted_at` text NOT NULL,
	`revoked_at` text,
	`revocation_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `civic_need_access_grants_need_idx` ON `civic_need_access_grants` (`need_id`);--> statement-breakpoint
CREATE INDEX `civic_need_access_grants_recipient_idx` ON `civic_need_access_grants` (`recipient_kind`,`recipient_key`);--> statement-breakpoint
CREATE INDEX `civic_need_access_grants_status_idx` ON `civic_need_access_grants` (`status`,`expires_at`);
