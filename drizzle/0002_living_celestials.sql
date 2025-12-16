CREATE TABLE `lottery_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`drawDate` varchar(10) NOT NULL,
	`firstPrize` varchar(10) NOT NULL,
	`last2` varchar(5) NOT NULL,
	`front3` json NOT NULL,
	`back3` json NOT NULL,
	`fullData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lottery_results_id` PRIMARY KEY(`id`),
	CONSTRAINT `lottery_results_drawDate_unique` UNIQUE(`drawDate`)
);
