CREATE TABLE `animal_vaccinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`vaccineId` int NOT NULL,
	`date` date NOT NULL,
	`nextDueDate` date,
	`batchNumber` varchar(100),
	`appliedBy` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `animal_vaccinations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `animal_weights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`weight` int NOT NULL,
	`date` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `animal_weights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `animals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`batchId` int,
	`tagNumber` varchar(50) NOT NULL,
	`name` varchar(100),
	`species` enum('bovine_milk','bovine_beef','sheep','goat','buffalo','other') NOT NULL,
	`breed` varchar(100),
	`sex` enum('male','female') NOT NULL,
	`birthDate` date,
	`birthWeight` int,
	`currentWeight` int,
	`motherId` int,
	`fatherId` int,
	`acquisitionDate` date,
	`acquisitionType` enum('birth','purchase','transfer'),
	`status` enum('active','sold','deceased','transferred') DEFAULT 'active',
	`phase` enum('calf','weaning','growing','fattening','feedlot','breeding','lactation'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `animals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_supplements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`farmId` int NOT NULL,
	`batchId` int,
	`animalId` int,
	`date` date NOT NULL,
	`feedType` enum('concentrate','silage','hay','mineral','protein','other') NOT NULL,
	`quantity` int NOT NULL,
	`cost` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feed_supplements_id` PRIMARY KEY(`id`)
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
	`currentStockingRate` int,
	`maxStockingRate` int,
	`status` enum('active','resting','maintenance') DEFAULT 'active',
	`lastRotationDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pastures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reproductive_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`animalId` int NOT NULL,
	`eventType` enum('heat','insemination','pregnancy_check','calving','abortion') NOT NULL,
	`date` date NOT NULL,
	`bullId` int,
	`semenCode` varchar(100),
	`inseminationType` enum('natural','artificial'),
	`pregnancyResult` boolean,
	`calvingSex` enum('male','female'),
	`calvingWeight` int,
	`calvingDifficulty` enum('normal','assisted','difficult'),
	`calfId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reproductive_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vaccines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('brucellosis','foot_mouth','rabies','clostridial','leptospirosis','bvd_ibr','other') NOT NULL,
	`manufacturer` varchar(255),
	`dosage` varchar(100),
	`applicationMethod` varchar(100),
	`withdrawalPeriod` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vaccines_id` PRIMARY KEY(`id`)
);
