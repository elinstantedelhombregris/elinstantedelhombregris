CREATE TABLE `cuadernos_campo_v2` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` integer NOT NULL,
	`origen` text NOT NULL,
	`version` integer NOT NULL,
	`contenido` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cuadernos_campo_v2_cuenta_idx` ON `cuadernos_campo_v2` (`usuario_id`,`origen`);