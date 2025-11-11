CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`category` enum('revenue','expense') NOT NULL,
	`subcategory` varchar(100) NOT NULL,
	`plannedAmount` decimal(10,2) NOT NULL,
	`actualAmount` decimal(10,2) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
