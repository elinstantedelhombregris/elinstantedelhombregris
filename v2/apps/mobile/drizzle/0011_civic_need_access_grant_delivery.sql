ALTER TABLE `civic_need_access_grants` ADD `delivery_status` text DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE `civic_need_access_grants` ADD `remote_recipient_circle_id` integer;--> statement-breakpoint
ALTER TABLE `civic_need_access_grants` ADD `remote_grantor_user_id` integer;--> statement-breakpoint
ALTER TABLE `civic_need_access_grants` ADD `delivered_at` text;--> statement-breakpoint
ALTER TABLE `civic_need_access_grants` ADD `remote_revoked_at` text;--> statement-breakpoint
ALTER TABLE `civic_need_access_grants` ADD `delivery_last_attempt_at` text;--> statement-breakpoint
ALTER TABLE `civic_need_access_grants` ADD `delivery_last_error` text;--> statement-breakpoint
CREATE INDEX `civic_need_access_grants_delivery_idx` ON `civic_need_access_grants` (`delivery_status`);
