CREATE TABLE `inventory` (
	`product_id` text NOT NULL,
	`size` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`product_id`, `size`),
	CONSTRAINT "stock_quantity" CHECK("inventory"."quantity" >= 0 AND typeof("inventory"."quantity") = 'integer')
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `request_hash` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_url` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `gateway_state` text DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `is_demo` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
-- Custom triggers are maintained here; Drizzle snapshots do not represent triggers.
CREATE TRIGGER reserve_order_stock AFTER INSERT ON order_items
WHEN (SELECT is_demo FROM orders WHERE id=NEW.order_id)=0
BEGIN
  UPDATE inventory SET quantity=quantity-NEW.quantity WHERE product_id=NEW.product_id AND size=NEW.size;
  SELECT CASE WHEN changes()<>1 THEN RAISE(ABORT, 'inventory_unavailable') END;
END;
--> statement-breakpoint
-- Cancellation must be performed by an operator after reconciling gateway payment state.
CREATE TRIGGER release_cancelled_stock AFTER UPDATE OF status ON orders
WHEN NEW.status='cancelled' AND OLD.status<>'cancelled' AND NEW.is_demo=0 AND NEW.request_hash IS NOT NULL
BEGIN
  UPDATE inventory SET quantity=quantity+COALESCE((
    SELECT SUM(quantity) FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND size=inventory.size
  ),0) WHERE EXISTS (SELECT 1 FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND size=inventory.size);
END;
