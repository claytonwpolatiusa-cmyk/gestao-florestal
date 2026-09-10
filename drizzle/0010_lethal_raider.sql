ALTER TABLE `stands` MODIFY COLUMN `polygonUrl` text DEFAULT (null);--> statement-breakpoint
ALTER TABLE `stands` MODIFY COLUMN `polygonGeoJson` text DEFAULT (null);--> statement-breakpoint
ALTER TABLE `stands` MODIFY COLUMN `polygonFileUrl` text DEFAULT (null);--> statement-breakpoint
ALTER TABLE `stands` MODIFY COLUMN `polygonFileKey` text DEFAULT (null);--> statement-breakpoint
ALTER TABLE `stands` MODIFY COLUMN `polygonFormat` enum('kml','geojson','kmz','outro') DEFAULT null;--> statement-breakpoint
ALTER TABLE `stands` MODIFY COLUMN `polygonVersion` varchar(64) DEFAULT null;--> statement-breakpoint
ALTER TABLE `stands` MODIFY COLUMN `notes` text DEFAULT (null);--> statement-breakpoint
ALTER TABLE `properties` ADD `boundaryFileUrl` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `boundaryFileKey` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `boundaryFormat` enum('kml','kmz','geojson') DEFAULT 'kml';