CREATE TABLE `subscriptionLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`promotionalMonthlyPriceCents` int NOT NULL,
	`referenceMonthlyPriceCents` int NOT NULL,
	`activationContactConsent` int NOT NULL DEFAULT 0,
	`status` enum('novo','contatado','convertido','encerrado') NOT NULL DEFAULT 'novo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptionLeads_id` PRIMARY KEY(`id`)
);
