CREATE TABLE `ai_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`type` varchar(50) DEFAULT 'general',
	`title` varchar(255),
	`content` text NOT NULL,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`source` varchar(100) DEFAULT 'ai',
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`level` enum('bronze','silver','gold') NOT NULL,
	`score` int DEFAULT 0,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) DEFAULT 'cattle',
	`quantity` int DEFAULT 0,
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
	`points` int DEFAULT 0,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`ruleMetrics` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `esg_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(50),
	`maxPoints` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `esg_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `esg_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`farmId` int NOT NULL,
	`response` boolean DEFAULT false,
	`pointsObtained` int DEFAULT 0,
	`notes` text,
	`evidenceUrl` text,
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `esg_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `farms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`region` varchar(100),
	`state` varchar(50),
	`country` varchar(50) DEFAULT 'BR',
	`sizeHectares` int,
	`animalCount` int,
	`farmType` varchar(50) DEFAULT 'cattle',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `farms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`type` enum('sale','purchase','expense','income') NOT NULL,
	`description` text,
	`amount` int NOT NULL,
	`category` varchar(100),
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50),
	`quantity` int DEFAULT 0,
	`unit` varchar(20) DEFAULT 'kg',
	`expiryDate` timestamp,
	`unitCost` int,
	`minStock` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planning_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(50) DEFAULT 'task',
	`date` timestamp NOT NULL,
	`completed` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planning_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','producer','manager','auditor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `farmId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `language` varchar(5) DEFAULT 'pt';