import { getBinding } from "./binding";

// Migrations own the schema. Never perform DDL during customer requests.
export function database(): D1Database { return getBinding(); }
export async function ensureDatabase() { database(); }
