CREATE TABLE `players` (
	`osu_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlist_items` (
	`playlist_item_id` integer PRIMARY KEY NOT NULL,
	`room_id` integer NOT NULL,
	`beatmapset_id` integer NOT NULL,
	`beatmapset_title` text NOT NULL,
	`beatmapset_artist` text NOT NULL,
	`beatmap_id` integer NOT NULL,
	`beatmap_version` text NOT NULL,
	`beatmap_difficulty_rating` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`room_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`score_id` integer PRIMARY KEY NOT NULL,
	`playlist_item_id` integer NOT NULL,
	`value` integer NOT NULL,
	`mods` text,
	`player` integer NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`playlist_item_id`) REFERENCES `playlist_items`(`playlist_item_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player`) REFERENCES `players`(`osu_id`) ON UPDATE no action ON DELETE no action
);
