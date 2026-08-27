ALTER TABLE `contracts` ADD `harvestType` enum('primeiro_desbaste','segundo_desbaste','corte_raso','outro') DEFAULT 'corte_raso' NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` ADD `ticketGraceDays` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` ADD `trailCameraImageUrls` text;--> statement-breakpoint
ALTER TABLE `tickets` ADD `trailCameraImageKeys` text;