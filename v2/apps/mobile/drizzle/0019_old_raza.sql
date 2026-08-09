ALTER TABLE `stars` RENAME TO `senales`;--> statement-breakpoint
DROP TABLE `commitments`;--> statement-breakpoint
DROP TABLE `days`;--> statement-breakpoint
DROP TABLE `ember_ledger`;--> statement-breakpoint
DROP TABLE `redeemed_nonces`;--> statement-breakpoint
DROP TABLE `reflections`;--> statement-breakpoint
DROP TABLE `unlocks`;--> statement-breakpoint
ALTER TABLE `senales` DROP COLUMN `fundadora`;--> statement-breakpoint
ALTER TABLE `senales` DROP COLUMN `nocturna`;--> statement-breakpoint
ALTER TABLE `senales` DROP COLUMN `fugaz`;--> statement-breakpoint
ALTER TABLE `senales` DROP COLUMN `constelacion_id`;--> statement-breakpoint
-- Las filas con tipo 'amistad' eran chispas de amistad del flujo de QR, que
-- ya no existe: nunca fueron señales del territorio. TipoSenalCapturada ya
-- no incluye 'amistad' entre sus miembros; esto barre las filas heredadas
-- que hayan quedado con ese valor de cuando la tabla se llamaba `stars`.
DELETE FROM `senales` WHERE `tipo` = 'amistad';