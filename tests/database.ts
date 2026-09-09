import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export class TestDatabase {
  sqlite = new DatabaseSync(':memory:');
  failItemInsert = false;
  constructor() {
    this.sqlite.exec('PRAGMA foreign_keys=ON');
    const dir = fileURLToPath(new URL('../drizzle/', import.meta.url));
    for (const file of readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) this.sqlite.exec(readFileSync(`${dir}/${file}`, 'utf8'));
  }
  prepare(sql: string) {
    const db = this;
    const make = (values: unknown[] = []) => ({
      sql, values,
      bind: (...args: unknown[]) => make(args),
      first: async () => db.sqlite.prepare(sql).get(...values) ?? null,
      all: async () => ({ results: db.sqlite.prepare(sql).all(...values) }),
      run: async () => db.execute(sql, values),
    });
    return make();
  }
  execute(sql: string, values: unknown[]) {
    if (this.failItemInsert && sql.includes('INSERT INTO order_items')) throw new Error('Injected write failure');
    const result = this.sqlite.prepare(sql).run(...values);
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
  }
  async batch(statements: { sql: string; values: unknown[] }[]) {
    this.sqlite.exec('BEGIN');
    try {
      const results = statements.map((statement) => this.execute(statement.sql, statement.values));
      this.sqlite.exec('COMMIT'); return results;
    } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
}
