ALTER TABLE `civic_need_access_grants` ADD `remote_execution_json` text;
--> statement-breakpoint
ALTER TABLE `civic_need_access_grants` ADD `remote_execution_observed_at` text;
--> statement-breakpoint
CREATE TABLE `civic_custody_execution_intents` (
	`event_id` text PRIMARY KEY NOT NULL CHECK (
		length(`event_id`) = 36
		AND substr(`event_id`, 9, 1) = '-'
		AND substr(`event_id`, 14, 1) = '-'
		AND substr(`event_id`, 15, 1) = '4'
		AND substr(`event_id`, 19, 1) = '-'
		AND substr(`event_id`, 20, 1) IN ('8', '9', 'a', 'b')
		AND substr(`event_id`, 24, 1) = '-'
		AND `event_id` NOT GLOB '*[^0-9a-f-]*'
	),
	`user_id` integer NOT NULL CHECK (`user_id` > 0),
	`proposal_id` text NOT NULL CHECK (
		length(`proposal_id`) = 36
		AND substr(`proposal_id`, 9, 1) = '-'
		AND substr(`proposal_id`, 14, 1) = '-'
		AND substr(`proposal_id`, 15, 1) = '4'
		AND substr(`proposal_id`, 19, 1) = '-'
		AND substr(`proposal_id`, 20, 1) IN ('8', '9', 'a', 'b')
		AND substr(`proposal_id`, 24, 1) = '-'
		AND `proposal_id` NOT GLOB '*[^0-9a-f-]*'
	),
	`event_type` text NOT NULL CHECK (`event_type` IN ('reserve', 'grantor_ready', 'coordinator_ready', 'start_delivery', 'report_delivery', 'confirm_receipt', 'record_follow_up', 'withdraw')),
	`expected_version` text NOT NULL CHECK (length(`expected_version`) = 64 AND `expected_version` NOT GLOB '*[^0-9a-f]*'),
	`request_json` text NOT NULL CHECK (json_valid(`request_json`) AND json_type(`request_json`) = 'object'),
	`execution_json` text NOT NULL CHECK (json_valid(`execution_json`) AND json_type(`execution_json`) = 'object'),
	`snapshot_observed_at` text NOT NULL,
	`created_at` text NOT NULL,
	`last_attempt_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `civic_custody_execution_intents_account_proposal_idx` ON `civic_custody_execution_intents` (`user_id`,`proposal_id`);
--> statement-breakpoint
CREATE INDEX `civic_custody_execution_intents_created_idx` ON `civic_custody_execution_intents` (`created_at`);
