import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }), orderCode: text("order_code").notNull().unique(), idempotencyKey: text("idempotency_key").notNull().unique(),
  name: text("name").notNull(), phone: text("phone").notNull(), email: text("email"), address: text("address").notNull(), division: text("division").notNull(), district: text("district").notNull(), postcode: text("postcode"), notes: text("notes"),
  subtotal: integer("subtotal").notNull(), shipping: integer("shipping").notNull(), total: integer("total").notNull(), paymentMethod: text("payment_method").notNull(), paymentStatus: text("payment_status").notNull().default("pending"), status: text("status").notNull().default("placed"), transactionId: text("transaction_id"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
});
export const orderItems = sqliteTable("order_items", { id: integer("id").primaryKey({ autoIncrement:true }), orderId: integer("order_id").notNull(), productId: text("product_id").notNull(), name: text("name").notNull(), size: text("size").notNull(), quantity: integer("quantity").notNull(), unitPrice: integer("unit_price").notNull() });
export const newsletter = sqliteTable("newsletter", { id: integer("id").primaryKey({ autoIncrement:true }), email: text("email").notNull().unique(), createdAt: text("created_at").notNull() });
