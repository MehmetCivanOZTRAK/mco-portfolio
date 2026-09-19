CREATE TABLE `admin_login_attempts` (
	`identifier` text PRIMARY KEY NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`blocked_until` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `category` text DEFAULT 'Genel' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `game_root_key` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `play_count` integer DEFAULT 0 NOT NULL;