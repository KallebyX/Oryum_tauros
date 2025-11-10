CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`stripePriceId` varchar(255) NOT NULL,
	`status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);