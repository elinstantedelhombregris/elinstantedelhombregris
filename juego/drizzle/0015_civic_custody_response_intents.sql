CREATE TABLE `civic_custody_response_intents` (
	`response_id` text PRIMARY KEY NOT NULL,
	`responder_user_id` integer NOT NULL CHECK (`responder_user_id` > 0),
	`grant_id` text NOT NULL,
	`disposition` text NOT NULL CHECK (`disposition` IN ('assessing', 'support_available')),
	`quantity` real,
	`request_json` text NOT NULL,
	`grant_json` text NOT NULL,
	`created_at` text NOT NULL,
	`last_attempt_at` text,
	CHECK (
		(`disposition` = 'assessing' AND `quantity` IS NULL)
		OR (`disposition` = 'support_available' AND (`quantity` IS NULL OR `quantity` > 0))
	)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `civic_custody_response_intents_account_grant_idx` ON `civic_custody_response_intents` (`responder_user_id`,`grant_id`);
--> statement-breakpoint
CREATE INDEX `civic_custody_response_intents_created_idx` ON `civic_custody_response_intents` (`created_at`);
