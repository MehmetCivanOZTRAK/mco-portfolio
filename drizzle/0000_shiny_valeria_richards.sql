CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`headline` text NOT NULL,
	`about` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`summary` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`project_url` text,
	`cover_key` text,
	`file_key` text,
	`file_name` text,
	`file_size` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_projects_slug` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_projects_status_created` ON `projects` (`status`,`created_at`);