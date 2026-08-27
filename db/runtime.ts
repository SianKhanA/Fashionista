import { env } from "cloudflare:workers";

let ready: Promise<void> | undefined;
export function database() { return (env as unknown as { DB: D1Database }).DB; }
export function ensureDatabase() {
  if (!ready) ready = database().batch([
    database().prepare("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_code TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, address TEXT NOT NULL, division TEXT NOT NULL, district TEXT NOT NULL, postcode TEXT, notes TEXT, subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL, total INTEGER NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL DEFAULT 'pending', status TEXT NOT NULL DEFAULT 'placed', transaction_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    database().prepare("CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id TEXT NOT NULL, name TEXT NOT NULL, size TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price INTEGER NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id))"),
    database().prepare("CREATE TABLE IF NOT EXISTS newsletter (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL)"),
    database().prepare("CREATE INDEX IF NOT EXISTS idx_orders_lookup ON orders(order_code, phone)"),
    database().prepare("CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)"),
  ]).then(() => undefined);
  return ready;
}
