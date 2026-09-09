CREATE TABLE `inventory` ( `product_id` text NOT NULL, `size` text NOT NULL, `quantity` integer DEFAULT 0 NOT NULL, PRIMARY KEY(`product_id`, `size`), CONSTRAINT "stock_quantity" CHECK("inventory"."quantity" >= 0 AND typeof("inventory"."quantity") = 'integer') );
--> statement-breakpoint
ALTER TABLE `orders` ADD `request_hash` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_url` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `gateway_state` text DEFAULT 'not_started' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `is_demo` integer DEFAULT 0 NOT NULL;
