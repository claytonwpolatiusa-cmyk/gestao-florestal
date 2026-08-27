CREATE TABLE `propertyAuditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`actorName` varchar(180),
	`action` enum('criada','atualizada') NOT NULL,
	`changeSummary` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertyAuditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `properties` ADD `createdByUserId` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `updatedByUserId` int;--> statement-breakpoint
ALTER TABLE `stands` ADD `polygonFileUrl` text;--> statement-breakpoint
ALTER TABLE `stands` ADD `polygonFileKey` text;--> statement-breakpoint
ALTER TABLE `stands` ADD `polygonFormat` enum('kml','geojson','kmz','outro');--> statement-breakpoint
ALTER TABLE `stands` ADD `polygonVersion` varchar(64);