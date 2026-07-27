ALTER TABLE `civic_need_access_grants` ADD `remote_coordination_terminal_decision` text;--> statement-breakpoint
UPDATE `civic_need_access_grants`
SET `remote_coordination_terminal_decision` = CASE
  WHEN `remote_coordination_state` = 'accepted' THEN 'accept'
  WHEN `remote_coordination_state` = 'declined' THEN 'decline'
  ELSE NULL
END
WHERE `remote_coordination_terminal_decision` IS NULL
  AND `remote_coordination_state` IN ('accepted', 'declined');
