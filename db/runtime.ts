let activeDatabase: D1Database | undefined;
let ready: Promise<void> | undefined;

async function resolveDatabase() {
  if (activeDatabase) return activeDatabase;
  try {
    // Kept indirect so standard Next.js/Vercel builds do not bundle a Cloudflare-only module.
    const load = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<{ env: { DB?: D1Database } }>;
    const cloudflare = await load("cloudflare:workers");
    activeDatabase = cloudflare.env.DB;
  } catch {
    activeDatabase = undefined;
  }
  if (!activeDatabase) throw new Error("Order storage is not configured on this deployment yet.");
  return activeDatabase;
}

export function database() {
  if (!activeDatabase) throw new Error("Order storage is not configured on this deployment yet.");
  return activeDatabase;
}

export function ensureDatabase() {
  if (!ready) ready = resolveDatabase().then((db) => db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_code TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, address TEXT NOT NULL, division TEXT NOT NULL, district TEXT NOT NULL, postcode TEXT, notes TEXT, subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL, total INTEGER NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL DEFAULT 'pending', status TEXT NOT NULL DEFAULT 'placed', transaction_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id TEXT NOT NULL, name TEXT NOT NULL, size TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price INTEGER NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS newsletter (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_lookup ON orders(order_code, phone)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)"),
  ])).then(() => undefined).catch((error) => { ready = undefined; throw error; });
  return ready;
}
