CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`guestName` varchar(128),
	`message` text NOT NULL,
	`isGuest` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`uniqueVisitors` int NOT NULL DEFAULT 0,
	`totalPageViews` int NOT NULL DEFAULT 0,
	`newUsers` int NOT NULL DEFAULT 0,
	`chatMessages` int NOT NULL DEFAULT 0,
	`avgSessionDuration` int NOT NULL DEFAULT 0,
	CONSTRAINT `daily_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_stats_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`path` varchar(512) NOT NULL,
	`referrer` varchar(512),
	`userAgent` text,
	`ipHash` varchar(64),
	`country` varchar(64),
	`deviceType` varchar(32),
	`browser` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int,
	`firstVisit` timestamp NOT NULL DEFAULT (now()),
	`lastActivity` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`pageViewCount` int NOT NULL DEFAULT 0,
	`isReturning` boolean NOT NULL DEFAULT false,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_sessionId_unique` UNIQUE(`sessionId`)
);
