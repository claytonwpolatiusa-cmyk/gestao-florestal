CREATE TABLE `propertyDeletionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deletedPropertyId` int NOT NULL,
	`propertyName` varchar(180) NOT NULL,
	`ownerUserId` int NOT NULL,
	`actorUserId` int NOT NULL,
	`actorName` varchar(180),
	`deletedStandsCount` int NOT NULL DEFAULT 0,
	`deletedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertyDeletionLogs_id` PRIMARY KEY(`id`)
);
