import { env } from "cloudflare:workers";
export function getBinding(): D1Database {
  const db = (env as unknown as { DB?: D1Database }).DB;
  if (!db) throw new Error("The DB binding is missing.");
  return db;
}
