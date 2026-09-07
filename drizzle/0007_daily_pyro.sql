CREATE TABLE `supportRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`subject` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`status` enum('aberta','em_andamento','respondida','encerrada') NOT NULL DEFAULT 'aberta',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supportRequests_id` PRIMARY KEY(`id`)
);
