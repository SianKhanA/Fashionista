import { sql } from "drizzle-orm";
import { check, primaryKey, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }), orderCode: text("order_code").notNull().unique(), idempotencyKey: text("idempotency_key").notNull().unique(),
  requestHash: text("request_hash"), paymentUrl: text("payment_url"), gatewayState: text("gateway_state").notNull().default("not_started"), isDemo: integer("is_demo").notNull().default(0),
  name: text("name").notNull(), phone: text("phone").notNull(), email: text("email"), address: text("address").notNull(), division: text("division").notNull(), district: text("district").notNull(), postcode: text("postcode"), notes: text("notes"),
  subtotal: integer("subtotal").notNull(), shipping: integer("shipping").notNull(), total: integer("total").notNull(), paymentMethod: text("payment_method").notNull(), paymentStatus: text("payment_status").notNull().default("pending"), status: text("status").notNull().default("placed"), transactionId: text("transaction_id"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_orders_lookup").on(table.orderCode, table.phone)]);
export const orderItems = sqliteTable("order_items", { id: integer("id").primaryKey({ autoIncrement:true }), orderId: integer("order_id").notNull().references(() => orders.id), productId: text("product_id").notNull(), name: text("name").notNull(), size: text("size").notNull(), quantity: integer("quantity").notNull(), unitPrice: integer("unit_price").notNull() }, (table) => [index("idx_order_items_order").on(table.orderId)]);
export const newsletter = sqliteTable("newsletter", { id: integer("id").primaryKey({ autoIncrement:true }), email: text("email").notNull().unique(), createdAt: text("created_at").notNull() });

export const inventory = sqliteTable("inventory", {
  productId: text("product_id").notNull(), size: text("size").notNull(), quantity: integer("quantity").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.productId, table.size] }), check("stock_quantity", sql`${table.quantity} >= 0 AND typeof(${table.quantity}) = 'integer'`)]);
