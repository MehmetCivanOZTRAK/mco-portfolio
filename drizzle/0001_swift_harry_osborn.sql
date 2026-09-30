CREATE TABLE IF NOT EXISTS `admin_login_attempts` (
	`identifier` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`blocked_until` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
