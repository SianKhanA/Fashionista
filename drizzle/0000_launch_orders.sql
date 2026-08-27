CREATE TABLE `orders` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `order_code` text NOT NULL, `idempotency_key` text NOT NULL, `name` text NOT NULL, `phone` text NOT NULL, `email` text, `address` text NOT NULL, `division` text NOT NULL, `district` text NOT NULL, `postcode` text, `notes` text, `subtotal` integer NOT NULL, `shipping` integer NOT NULL, `total` integer NOT NULL, `payment_method` text NOT NULL, `payment_status` text DEFAULT 'pending' NOT NULL, `status` text DEFAULT 'placed' NOT NULL, `transaction_id` text, `created_at` text NOT NULL, `updated_at` text NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_code_unique` ON `orders` (`order_code`);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);
--> statement-breakpoint
CREATE INDEX `idx_orders_lookup` ON `orders` (`order_code`,`phone`);
--> statement-breakpoint
CREATE TABLE `order_items` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `order_id` integer NOT NULL, `product_id` text NOT NULL, `name` text NOT NULL, `size` text NOT NULL, `quantity` integer NOT NULL, `unit_price` integer NOT NULL, FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`));
--> statement-breakpoint
CREATE INDEX `idx_order_items_order` ON `order_items` (`order_id`);
--> statement-breakpoint
CREATE TABLE `newsletter` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `email` text NOT NULL, `created_at` text NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_email_unique` ON `newsletter` (`email`);
