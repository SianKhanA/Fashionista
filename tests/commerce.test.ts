import { reserveStock, cancelReconciledOrder } from "../lib/inventory";
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { TestDatabase } from './database';
import { createOrder } from '../lib/order-service';
import { confirmPayment, paymentMatches } from '../lib/payment-service';
import { parseOrder, priceOrder } from '../lib/order-input';
import { parseCart, parseWishlist, checkoutAttempt, subtractPurchased } from '../lib/browser-store';
import { products } from '../lib/catalog';
import { checkoutMode } from '../lib/checkout-mode';
import { POST as track } from '../app/api/orders/track/route';
import { POST as callback } from '../app/api/payments/callback/route';
import { POST as ipn } from '../app/api/payments/ipn/route';
import { POST as orderRoute } from '../app/api/orders/route';
import { proxyToSites } from '../lib/sites-backend';
let db: TestDatabase;
const originalFetch = globalThis.fetch;
const env = { ...process.env };
const item = { productId: products[0].id, size: products[0].sizes[0], quantity: 1 };
function input(method = 'cod') {
  return { idempotencyKey: crypto.randomUUID(), customer: { name: 'Test Customer', phone: '01700000000', address: '10 Test Road', division: 'Dhaka', district: 'Dhaka' }, paymentMethod: method, items: [{ ...item }] };
}
function request(path: string, body: unknown) { return new Request(`https://store.example${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
function validation(orderCode: string, overrides = {}) {
  return { status: 'VALID', tran_id: orderCode, amount: String(products[0].price), currency: 'BDT', risk_level: '0', val_id: 'verified-id', ...overrides };
}
beforeEach(() => {
  db = new TestDatabase(); globalThis.__testDatabase = db;
  process.env.CHECKOUT_MODE = 'sandbox'; process.env.SSLCOMMERZ_SANDBOX = 'true';
  process.env.SSLCOMMERZ_STORE_ID = 'test'; process.env.SSLCOMMERZ_STORE_PASSWORD = 'test';
  process.env.PUBLIC_SITE_URL = 'https://store.example'; delete process.env.VERCEL; delete process.env.STORE_RUNTIME;
  globalThis.fetch = async () => Response.json({ status: 'SUCCESS', GatewayPageURL: 'https://sandbox.sslcommerz.com/pay/test' });
});
afterEach(() => { db.sqlite.close(); globalThis.fetch = originalFetch; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); });

test('server ignores submitted totals and rejects malformed quantities and duplicate-line overflow', () => {
  const raw = { ...input(), total: 1 };
  assert.equal(priceOrder(parseOrder(raw)).total, products[0].price);
  for (const quantity of [0, -1, 1.5, 11, '2', null]) assert.throws(() => parseOrder({ ...raw, items: [{ ...item, quantity }] }));
  assert.throws(() => parseOrder({ ...raw, items: [{ ...item, quantity: 8 }, { ...item, quantity: 8 }] }));
  assert.throws(() => parseOrder({ ...raw, customer: { ...raw.customer, division: 'Invalid' } }));
});
test('concurrent duplicate requests create exactly one complete COD order', async () => {
  const payload = input();
  const [a, b] = await Promise.all([createOrder(db, payload), createOrder(db, payload)]);
  assert.equal(a.orderCode, b.orderCode);
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM orders').get().n, 1);
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM order_items').get().n, 1);
});
test('reusing a key with different delivery details is rejected', async () => {
  const payload = input(); await createOrder(db, payload);
  await assert.rejects(createOrder(db, { ...payload, customer: { ...payload.customer, name: 'Other Person' } }), { status: 409 });
});
test('failure inserting items rolls back the parent order', async () => {
  db.failItemInsert = true;
  await assert.rejects(createOrder(db, input()));
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM orders').get().n, 0);
});
test('payment retries reuse the original order and gateway URL', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ status: 'SUCCESS', GatewayPageURL: 'https://sandbox.sslcommerz.com/pay/test' }); };
  const payload = input('bkash');
  const first = await createOrder(db, payload), retry = await createOrder(db, payload);
  assert.equal(retry.paymentUrl, first.paymentUrl); assert.equal(retry.orderCode, first.orderCode); assert.equal(calls, 1);
});
test('an ambiguous gateway timeout cannot start a second charge session', async () => {
  let calls = 0; globalThis.fetch = async () => { calls++; throw new Error('Timeout'); };
  const payload = input('card'); await assert.rejects(createOrder(db, payload));
  await assert.rejects(createOrder(db, payload), { status: 409 }); assert.equal(calls, 1);
});
test('a definite gateway rejection can be retried without another order', async () => {
  const payload = input('card');
  globalThis.fetch = async () => Response.json({ status: 'FAILED' });
  await assert.rejects(createOrder(db, payload), { status: 422 });
  globalThis.fetch = async () => Response.json({ status: 'SUCCESS', GatewayPageURL: 'https://sandbox.sslcommerz.com/pay/test' });
  assert.ok((await createOrder(db, payload)).paymentUrl);
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM orders').get().n, 1);
});
test('gateway credentials are checked before storing an online order', async () => {
  delete process.env.SSLCOMMERZ_STORE_PASSWORD;
  await assert.rejects(createOrder(db, input('card')), { status: 503 });
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM orders').get().n, 0);
});
test('sample catalog cannot accept live orders even if a live environment flag is set', async () => {
  process.env.CHECKOUT_MODE = 'live'; process.env.INVENTORY_READY = 'true'; process.env.SSLCOMMERZ_SANDBOX = 'false';
  assert.equal(checkoutMode(), 'disabled'); await assert.rejects(createOrder(db, input()), { status: 503 });
});
test('payment validation rejects wrong amounts, currency, transaction, method and missing risk data', () => {
  const order = { order_code: 'FAS-TEST', total: 100, payment_method: 'card', is_demo: 1 };
  const good = validation(order.order_code, { amount: '100.00' });
  assert.equal(paymentMatches(order, good), true);
  for (const patch of [{ amount: '99.99' }, { currency: 'USD' }, { tran_id: 'other' }, { amount: '' }, { risk_level: undefined }, { status: 'FAILED' }]) assert.equal(paymentMatches(order, { ...good, ...patch }), false);
  assert.equal(paymentMatches({ ...order, payment_method: 'cod' }, good), false);
});
test('verified payment is recorded, and replay does not reset fulfillment status', async () => {
  const order = await createOrder(db, input('card'));
  const validate = async () => validation(order.orderCode);
  await confirmPayment(db, 'verified-id', validate);
  db.sqlite.prepare("UPDATE orders SET status='shipped' WHERE order_code=?").run(order.orderCode);
  await confirmPayment(db, 'verified-id', validate);
  const saved = db.sqlite.prepare('SELECT status,payment_status FROM orders').get();
  assert.equal(saved.status, 'shipped'); assert.equal(saved.payment_status, 'paid');
});
test('risky verified payments are held for review', async () => {
  const order = await createOrder(db, input('card'));
  await confirmPayment(db, 'verified-id', async () => validation(order.orderCode, { risk_level: 1 }));
  assert.equal(db.sqlite.prepare('SELECT payment_status FROM orders').get().payment_status, 'review');
});
test('IPN sends a 200 acknowledgment, while browser callback redirects only after verification', async () => {
  const order = await createOrder(db, input('card'));
  globalThis.fetch = async () => Response.json(validation(order.orderCode));
  const make = () => new Request('https://store.example/api/payments/ipn', { method: 'POST', body: new URLSearchParams({ val_id: 'verified-id' }) });
  const response = await ipn(make()); assert.equal(response.status, 200); assert.equal(response.headers.get('location'), null);
  assert.equal((await response.json()).received, true);
  const returned = await callback(make()); assert.equal(returned.status, 303); assert.ok(returned.headers.get('location')?.includes(order.orderCode));
});
test('tracking normalizes country prefixes and never exposes customer details', async () => {
  const order = await createOrder(db, input());
  const response = await track(request('/api/orders/track', { orderCode: order.orderCode, phone: '+88 01700000000' }));
  assert.equal(response.status, 200);
  const data = await response.json(); assert.equal(data.orderCode, order.orderCode); assert.equal(data.phone, undefined); assert.equal(data.address, undefined); assert.equal(data.id, undefined);
  assert.equal((await track(request('/api/orders/track', { orderCode: order.orderCode, phone: {} }))).status, 400);
});
test('malformed JSON and oversized requests produce controlled errors', async () => {
  const bad = new Request('https://store.example/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal((await orderRoute(bad)).status, 400);
  assert.equal((await orderRoute(request('/api/orders', { padding: 'x'.repeat(40_000) }))).status, 413);
});
test('Vercel forwards callback bodies and preserves redirect responses', async () => {
  process.env.VERCEL = '1'; process.env.SITES_BACKEND_URL = 'https://backend.example';
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), 'https://backend.example/api/payments/callback');
    assert.equal(new TextDecoder().decode(init.body), 'val_id=test');
    assert.equal(init.redirect, 'manual');
    return new Response(null, { status: 303, headers: { location: 'https://store.example/order/success', 'content-encoding': 'gzip' } });
  };
  const response = await callback(new Request('https://store.example/api/payments/callback', { method: 'POST', body: new URLSearchParams({ val_id: 'test' }) }));
  assert.equal(response.status, 303); assert.equal(response.headers.get('content-encoding'), null);
});
test('bridge refuses a proxy loop and returns a recoverable unavailable response', async () => {
  process.env.SITES_BACKEND_URL = 'https://store.example';
  const response = await proxyToSites(request('/api/orders', {}), '/api/orders'); assert.equal(response.status, 503);
});
test('browser state tolerates corrupt JSON and retains stable checkout keys across retries', () => {
  for (const value of ['{', '{}', 'null', '"bad"']) { assert.deepEqual(parseCart(value), []); assert.deepEqual(parseWishlist(value), []); }
  assert.deepEqual(parseCart(JSON.stringify([{ ...item, quantity: -1 }, item])), [item]);
  const first = checkoutAttempt('payload', '01700000000', [item], null);
  assert.equal(checkoutAttempt('payload', first.phone, [item], first).key, first.key);
  assert.notEqual(checkoutAttempt('changed', first.phone, [item], first).key, first.key);
  assert.deepEqual(subtractPurchased([{ ...item, quantity: 3 }], [item]), [{ ...item, quantity: 2 }]);
});
test('live stock cannot go negative and item failures roll back all reservations', async () => {
  const demo = await createOrder(db, input());
  const id = db.sqlite.prepare('SELECT id FROM orders WHERE order_code=?').get(demo.orderCode).id;
  db.sqlite.prepare('UPDATE orders SET is_demo=0 WHERE id=?').run(id);
  db.sqlite.prepare('INSERT INTO inventory(product_id,size,quantity) VALUES (?,?,?)').run(item.productId,item.size,1);
  const insert = () => db.prepare('INSERT INTO order_items(order_id,product_id,name,size,quantity,unit_price) VALUES (?,?,?,?,?,?)').bind(id,item.productId,'Test',item.size,1,100);
  const reserve = () => reserveStock(db,item.productId,item.size,1);
  await assert.rejects(db.batch([reserve(),insert(),reserve(),insert()]));
  assert.equal(db.sqlite.prepare('SELECT quantity FROM inventory').get().quantity, 1);
  await db.batch([reserve(),insert()]); assert.equal(db.sqlite.prepare('SELECT quantity FROM inventory').get().quantity, 0);
  await assert.rejects(db.batch([reserve(),insert()]));
});

test('missing inventory aborts reservation and cancellation releases stock only once', async () => {
  await assert.rejects(db.batch([reserveStock(db,item.productId,item.size,1)]));
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM inventory').get().n, 0);
  const order = await createOrder(db,input());
  db.sqlite.prepare('UPDATE orders SET is_demo=0 WHERE order_code=?').run(order.orderCode);
  db.sqlite.prepare('INSERT INTO inventory(product_id,size,quantity) VALUES (?,?,?)').run(item.productId,item.size,2);
  await db.batch([reserveStock(db,item.productId,item.size,1)]);
  await cancelReconciledOrder(db,order.orderCode);
  await cancelReconciledOrder(db,order.orderCode);
  assert.equal(db.sqlite.prepare('SELECT quantity FROM inventory').get().quantity,2);
});
