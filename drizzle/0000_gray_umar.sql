CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_hash` text NOT NULL,
	`alias` text NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accounts_subject_hash` ON `accounts` (`subject_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accounts_alias` ON `accounts` (`alias`);--> statement-breakpoint
CREATE TABLE `api_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`at` text NOT NULL,
	`route` text NOT NULL,
	`model` text NOT NULL,
	`input_tokens` integer NOT NULL,
	`output_tokens` integer NOT NULL,
	`latency_ms` integer NOT NULL,
	`ok` integer NOT NULL,
	`approximate_cost_usd` real NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_api_usage_account_at` ON `api_usage` (`account_id`,`at`);--> statement-breakpoint
CREATE TABLE `check_ins` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`date` text NOT NULL,
	`cigarettes` integer NOT NULL,
	`craving` integer NOT NULL,
	`confidence` integer NOT NULL,
	`goal_attempted` integer NOT NULL,
	`trigger` text NOT NULL,
	`win` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_check_ins_account_date` ON `check_ins` (`account_id`,`date`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`account_id` text PRIMARY KEY NOT NULL,
	`assessment_json` text,
	`goal_json` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA optimize;
