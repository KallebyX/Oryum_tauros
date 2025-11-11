CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`type` enum('milk_production','gmd','esg_score','revenue','expense_reduction') NOT NULL,
	`title` varchar(255) NOT NULL,
	`targetValue` decimal(10,2) NOT NULL,
	`currentValue` decimal(10,2) DEFAULT '0',
	`unit` varchar(50) NOT NULL,
	`deadline` date NOT NULL,
	`status` enum('active','completed','failed') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
