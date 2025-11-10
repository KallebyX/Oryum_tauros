DROP TABLE `ai_recommendations`;--> statement-breakpoint
DROP TABLE `badges`;--> statement-breakpoint
DROP TABLE `batches`;--> statement-breakpoint
DROP TABLE `challenge_progress`;--> statement-breakpoint
DROP TABLE `challenges`;--> statement-breakpoint
DROP TABLE `esg_checklists`;--> statement-breakpoint
DROP TABLE `esg_responses`;--> statement-breakpoint
DROP TABLE `farms`;--> statement-breakpoint
DROP TABLE `financial_transactions`;--> statement-breakpoint
DROP TABLE `inventory_items`;--> statement-breakpoint
DROP TABLE `planning_events`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `farmId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `language`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `stripeCustomerId`;