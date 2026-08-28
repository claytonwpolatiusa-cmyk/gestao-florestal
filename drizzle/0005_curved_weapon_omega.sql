CREATE TABLE `delegatedAccessCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`codeHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	CONSTRAINT `delegatedAccessCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `delegatedAccessCodes_codeHash_unique` UNIQUE(`codeHash`)
);
