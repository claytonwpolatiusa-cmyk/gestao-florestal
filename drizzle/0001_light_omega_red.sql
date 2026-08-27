CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`standId` int,
	`code` varchar(64) NOT NULL,
	`buyerName` varchar(180) NOT NULL,
	`buyerDocument` varchar(32),
	`type` enum('por_tonelada','preco_fixo') NOT NULL,
	`status` enum('rascunho','ativo','suspenso','encerrado','rescindido') NOT NULL DEFAULT 'rascunho',
	`pricePerTon` decimal(14,2),
	`fixedValue` decimal(14,2),
	`receivedValue` decimal(14,2) NOT NULL DEFAULT '0.00',
	`startDate` timestamp,
	`deadline` timestamp,
	`guaranteeType` enum('nenhuma','nota_promissoria','fiador','seguro_garantia','caucao') NOT NULL DEFAULT 'nenhuma',
	`guaranteeValue` decimal(14,2),
	`documentUrl` text,
	`documentKey` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contracts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`standId` int,
	`contractId` int,
	`title` varchar(220) NOT NULL,
	`type` enum('contrato','relatorio_vistoria','tarefa','licenca','garantia','outro') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`standId` int,
	`contractId` int,
	`occurredAt` timestamp NOT NULL,
	`category` enum('acesso','ticket','infraestrutura','chuva','incendio','ambiental','seguranca','outro') NOT NULL,
	`severity` enum('baixa','media','alta','critica') NOT NULL DEFAULT 'media',
	`status` enum('aberta','em_tratativa','resolvida') NOT NULL DEFAULT 'aberta',
	`title` varchar(220) NOT NULL,
	`description` text NOT NULL,
	`photoUrl` text,
	`photoKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`standId` int NOT NULL,
	`inspectedAt` timestamp NOT NULL,
	`inspectorName` varchar(180) NOT NULL,
	`type` enum('infraestrutura','seguranca','ambiental','colheita','entrega_final') NOT NULL,
	`result` enum('conforme','atencao','nao_conforme') NOT NULL,
	`notes` text,
	`photoUrl` text,
	`photoKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ledgerEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`standId` int,
	`contractId` int,
	`occurredAt` timestamp NOT NULL,
	`flow` enum('receita','despesa') NOT NULL,
	`category` enum('madeira_tonelada','area_fixa','manutencao','diarias','outros') NOT NULL,
	`description` varchar(255) NOT NULL,
	`tons` decimal(12,3),
	`amount` decimal(14,2) NOT NULL,
	`status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`fileUrl` text,
	`fileKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ledgerEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`registry` varchar(120),
	`carNumber` varchar(120),
	`municipality` varchar(120) NOT NULL,
	`state` varchar(2) NOT NULL,
	`address` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(160),
	`species` enum('pinus','eucalipto') NOT NULL,
	`areaHa` decimal(10,2) NOT NULL,
	`cycleStatus` enum('aguardando','primeiro_desbaste','segundo_desbaste','corte_raso') NOT NULL DEFAULT 'aguardando',
	`operationalStatus` enum('ativo','em_colheita','bloqueado','concluido') NOT NULL DEFAULT 'ativo',
	`polygonUrl` text,
	`polygonGeoJson` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stands_id` PRIMARY KEY(`id`),
	CONSTRAINT `stands_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`standId` int NOT NULL,
	`ticketNumber` varchar(100) NOT NULL,
	`issuedAt` timestamp NOT NULL,
	`vehiclePlate` varchar(16) NOT NULL,
	`destination` varchar(180) NOT NULL,
	`netWeightTons` decimal(12,3) NOT NULL,
	`status` enum('pendente','conferido','divergente','recusado') NOT NULL DEFAULT 'pendente',
	`fileUrl` text,
	`fileKey` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
