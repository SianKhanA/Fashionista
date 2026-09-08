import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve('wrangler/package.json'));
const { Miniflare } = wranglerRequire('miniflare');
const runtime = new Miniflare({
  modules: true, scriptPath: 'dist/server/index.js',
  modulesRules: [{ type: 'ESModule', include: ['**/*.js'], fallthrough: true }],
  compatibilityDate: '2026-05-15', compatibilityFlags: ['nodejs_compat'],
  d1Databases: ['DB'],
  bindings: { PUBLIC_SITE_URL: 'https://store.example', CHECKOUT_MODE: 'sandbox', SSLCOMMERZ_SANDBOX: 'true' },
});
try {
  const db = await runtime.getD1Database('DB');
  for (const file of readdirSync('drizzle').filter((name) => name.endsWith('.sql')).sort()) {
    for (const sql of readFileSync(`drizzle/${file}`, 'utf8').split('--> statement-breakpoint').filter((sql) => sql.trim())) await db.prepare(sql).run();
  }
  const options = await runtime.dispatchFetch('https://store.example/api/checkout');
  assert.equal(options.status, 200);
  assert.equal((await options.json()).mode, 'sandbox');
  const payload = { idempotencyKey: crypto.randomUUID(), customer: { name: 'Worker Test', phone: '01700000000', address: '10 Test Road', division: 'Dhaka', district: 'Dhaka' }, paymentMethod: 'cod', items: [{ productId: 'nokshi-jamdani-1', size: 'Free Size', quantity: 1 }] };
  const place = () => runtime.dispatchFetch('https://store.example/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const response = await place();
  const order = await response.json();
  assert.equal(response.status, 200, JSON.stringify(order));
  assert.ok(order.orderCode);
  assert.equal((await (await place()).json()).orderCode, order.orderCode);
  const tracked = await runtime.dispatchFetch('https://store.example/api/orders/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orderCode: order.orderCode, phone: '+8801700000000' }) });
  assert.equal(tracked.status, 200);
  assert.equal((await tracked.json()).items.length, 1);
  const home = await runtime.dispatchFetch('https://store.example/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Fashionist/);
  console.log('Worker smoke check passed: migrations, real D1 binding, checkout, retry, tracking, home rendering.');
} finally { await runtime.dispose(); }
