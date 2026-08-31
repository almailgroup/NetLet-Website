CREATE TABLE `customer_notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`kind` enum('price_drop','bag_reminder','new_arrival','delivery_update') NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_notification_user_kind_unique` UNIQUE(`user_id`,`kind`)
);
--> statement-breakpoint
CREATE TABLE `customer_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`locale` enum('en','ar') NOT NULL DEFAULT 'en',
	`delivery_zone_id` varchar(64),
	`shopify_cart_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `order_tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`order_reference` varchar(191) NOT NULL,
	`status` varchar(64) NOT NULL,
	`message` text,
	`occurred_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`product_id` varchar(191) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `saved_products_user_product_unique` UNIQUE(`user_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`open_id` varchar(191) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`login_method` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`last_signed_in` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_open_id_unique` UNIQUE(`open_id`)
);
--> statement-breakpoint
ALTER TABLE `customer_notification_preferences` ADD CONSTRAINT `customer_notification_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_preferences` ADD CONSTRAINT `customer_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_tracking_events` ADD CONSTRAINT `order_tracking_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_products` ADD CONSTRAINT `saved_products_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `customer_notification_user_id_idx` ON `customer_notification_preferences` (`user_id`);--> statement-breakpoint
CREATE INDEX `order_tracking_user_id_idx` ON `order_tracking_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `order_tracking_user_occurred_idx` ON `order_tracking_events` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `saved_products_user_id_idx` ON `saved_products` (`user_id`);