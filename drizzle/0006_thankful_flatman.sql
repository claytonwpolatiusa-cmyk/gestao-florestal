CREATE TABLE `contentLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`whatsapp` varchar(32),
	`contentUpdatesConsent` int NOT NULL DEFAULT 0,
	`commercialContactConsent` int NOT NULL DEFAULT 0,
	`source` varchar(120) NOT NULL DEFAULT 'conteudos',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentLeads_id` PRIMARY KEY(`id`)
);
