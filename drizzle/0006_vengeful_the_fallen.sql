CREATE TABLE `ai_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`type` enum('financial','esg','production','health') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`status` enum('pending','viewed','applied','dismissed') DEFAULT 'pending',
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`source` varchar(100) DEFAULT 'ai',
	CONSTRAINT `ai_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `animals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`batchId` int,
	`tagId` varchar(100) NOT NULL,
	`name` varchar(255),
	`species` enum('cattle','sheep','goat','buffalo') NOT NULL,
	`breed` varchar(100),
	`sex` enum('male','female') NOT NULL,
	`birthDate` date,
	`birthWeight` int,
	`currentWeight` int,
	`motherId` int,
	`fatherId` int,
	`status` enum('active','sold','deceased','quarantine') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `animals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`level` enum('bronze','silver','gold') NOT NULL,
	`score` int NOT NULL,
	`awardedAt` timestamp NOT NULL DEFAULT (now()),
	`validUntil` timestamp,
	`metadata` text,
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`animalType` enum('cattle','sheep','goat','buffalo') NOT NULL,
	`phase` enum('cria','recria','engorda','confinamento','lactacao','seca') NOT NULL,
	`quantity` int NOT NULL,
	`averageWeight` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenge_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`farmId` int NOT NULL,
	`progressPercent` int DEFAULT 0,
	`pointsEarned` int DEFAULT 0,
	`completed` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenge_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`points` int NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`targetMetric` varchar(100),
	`targetValue` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `esg_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('environmental','social','governance') NOT NULL,
	`maxPoints` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `esg_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `esg_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`farmId` int NOT NULL,
	`response` boolean NOT NULL,
	`pointsObtained` int NOT NULL,
	`evidenceUrl` varchar(500),
	`notes` text,
	`respondedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `esg_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`region` varchar(100),
	`state` varchar(2),
	`sizeHectares` int,
	`animalCount` int,
	`farmType` enum('cattle','dairy','sheep','goat','buffalo','mixed') DEFAULT 'cattle',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`amount` int NOT NULL,
	`date` date NOT NULL,
	`batchId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('feed','medicine','supplement','equipment','other') NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50) NOT NULL,
	`minStock` int DEFAULT 0,
	`expiryDate` date,
	`unitCost` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milk_production` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`farmId` int NOT NULL,
	`date` date NOT NULL,
	`liters` int NOT NULL,
	`lactationDay` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `milk_production_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pastures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`areaHectares` int NOT NULL,
	`grassType` varchar(100),
	`currentBatchId` int,
	`rotationStartDate` date,
	`restPeriodDays` int DEFAULT 30,
	`status` enum('active','resting','renovation') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pastures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planning_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('vaccination','reproduction','feeding','maintenance','other') NOT NULL,
	`dueDate` date NOT NULL,
	`completed` boolean DEFAULT false,
	`completedAt` timestamp,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planning_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reproductive_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`farmId` int NOT NULL,
	`eventType` enum('heat','insemination','pregnancy_check','birth','abortion') NOT NULL,
	`date` date NOT NULL,
	`bullId` int,
	`semenCode` varchar(100),
	`result` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reproductive_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplementation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchId` int NOT NULL,
	`farmId` int NOT NULL,
	`date` date NOT NULL,
	`supplementType` varchar(100) NOT NULL,
	`quantityKg` int NOT NULL,
	`costPerKg` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplementation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int,
	`batchId` int,
	`farmId` int NOT NULL,
	`vaccineType` varchar(100) NOT NULL,
	`date` date NOT NULL,
	`nextDueDate` date,
	`dosage` varchar(100),
	`veterinarian` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vaccinations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weighings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`weight` int NOT NULL,
	`date` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weighings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `farmId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `language` varchar(5) DEFAULT 'pt';