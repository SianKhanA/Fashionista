# Deployment runbook

## Targets and order

1. Use Node.js 24+ and pnpm 11.19.0. Install with `pnpm install --frozen-lockfile`.
2. Choose the final HTTPS storefront origin. Set `PUBLIC_SITE_URL` to that same origin in the Vercel build environment and the Worker runtime. This is where payment callbacks and customer returns go.
3. Deploy the **backend first** using `pnpm build:sites`. Preserve `.openai/hosting.json` and its existing project ID and `DB` binding. The deployable Worker is `dist/server/index.js`, assets are `dist/client`, and Sites metadata/migrations are in `dist/.openai`. Use the Sites publication workflow to apply migrations before uploading the Worker. Do not publish the Next.js output as a Worker.
4. Confirm the backend's commerce endpoints are reachable by Vercel and SSLCOMMERZ. A sign-in page or private-only backend cannot receive guest checkout or gateway IPN requests. Review the intended audience before changing access. No bypass credential is included in this repository.
5. Deploy the Vercel frontend with `pnpm build`, setting `SITES_BACKEND_URL` to the verified backend HTTPS origin. Vercel sets `VERCEL=1`, which activates forwarding for every commerce route. Do not point this value at the storefront itself.
6. Deploy with `CHECKOUT_MODE=disabled` until ready for sandbox validation. Run `pnpm check:deployment` with the target environment values. Set the same mode on both environments, with the Worker remaining authoritative.

A single Sites deployment is also supported: use its customer-facing URL as `PUBLIC_SITE_URL` and omit `SITES_BACKEND_URL`, `VERCEL` and `STORE_RUNTIME`.

## Database migration

- Preserve `drizzle/0000_launch_orders.sql`; it may already be applied.
- Apply `0001_checkout_safety.sql` after the baseline. This adds nullable request hashes/payment URLs, constant-default gateway/demo columns, inventory and stock triggers. Existing order records are preserved.
- Runtime handlers no longer create tables. On a fresh environment, both migrations must run before accepting requests.
- If an older deployment created tables at runtime without recording the baseline migration, inspect its schema and migration history first. Reconcile the baseline through the deployment tooling before applying new migrations. Do not rerun CREATE TABLE blindly or drop existing tables.
- The baseline Drizzle snapshot has been reconstructed to match the existing SQL, including indexes and foreign keys. Future schema changes use `pnpm db:generate`; append migrations rather than rewriting applied files. The stock triggers are custom SQL and must be preserved separately from Drizzle snapshots.
- Take a database backup before the upgrade. Keep checkout disabled during migration and deployment. An old Worker expecting runtime schema creation must not be used as the schema rollback strategy.

## Checkout modes

| Mode | Behavior |
| --- | --- |
| `disabled` | Catalog can be browsed; new checkout is closed. Default. |
| `sandbox` | Test COD and, with sandbox credentials, test online orders. All records have `is_demo=1`; stock is unaffected. No dispatch. |
| `live` | Requires `catalogIsSample=false` and `INVENTORY_READY=true`. Live order items reserve D1 stock atomically. |

Never send live merchant credentials to a preview environment. Store merchant values only as encrypted server-side Worker secrets. No credentials are required for COD; when missing, online payment options are disabled.

## Real catalog and stock

Replace the sample products, colour-specific photography, prices, size information and store/policy copy with owner-approved content in `lib/catalog.ts` and `public/products`. Set `catalogIsSample=false` only after completing that work. Sample reviews and ratings have been removed; do not add customer claims without real source data.

Populate `inventory` with verified counts for each `(product_id, size)` in the live catalog. Use the database administration tool's parameterized equivalent of:

```sql
INSERT INTO inventory (product_id, size, quantity) VALUES (?, ?, ?)
ON CONFLICT(product_id, size) DO UPDATE SET quantity=excluded.quantity;
```

Load absolute counts only while checkout is disabled; overwriting counts during sales can undo reservations. For restocking an existing row during operation, add the received quantity instead of replacing the available count. Do not invent stock numbers. Missing inventory rows and insufficient quantities reject the entire order transaction.

Only then set `INVENTORY_READY=true` and enable live checkout. Inventory is reserved when the order is created, including unpaid online orders. Pending/ambiguous payments deliberately do not expire automatically. Operators must reconcile these against SSLCOMMERZ before cancelling an order. Changing status to `cancelled` releases reserved stock once; never reopen that order, delete it, or edit its item rows. A paid cancellation must follow the merchant's refund process first. Legacy orders without request hashes do not release stock they never reserved.

There is no administrative dashboard or automatic shipping integration in this app. Fulfillment remains an operator workflow in the database: dispatch only live COD orders or verified, paid live orders. Never dispatch demo, pending, review, cancelled or refunded orders.

## Payments

Worker settings:

- `SSLCOMMERZ_STORE_ID`
- `SSLCOMMERZ_STORE_PASSWORD`
- `SSLCOMMERZ_SANDBOX=true` during tests; `false` for live online payments
- `PUBLIC_SITE_URL` set to the final storefront HTTPS origin

Configure the merchant IPN listener as `<PUBLIC_SITE_URL>/api/payments/ipn`. The app generates success/failure/cancel URLs. Vercel forwards them to the Worker without consuming redirects. IPN returns a machine-readable 200 only after successful validation; transient failures return a non-success status so delivery can be retried. Failure/cancellation return parameters are not trusted to change payment or stock state.

Before enabling live online payments, validate sandbox success, cancellation, failure, repeated callbacks, and IPN without a browser return. Confirm that totals/currency match and replay does not reset fulfillment state. Then perform an owner-authorized low-value live transaction with real stock and confirm both merchant and database records.

Retries reuse an existing gateway URL. A confirmed session-init rejection can retry the same order. If initiation times out after the gateway may have accepted it, `gateway_state` remains `starting`; do not reset it or create another payment until the merchant transaction query confirms the outcome. Reconcile using the order code (`tran_id`). Expired/terminal gateway sessions also need reconciliation; there is no automatic replacement charge session.

Official references: [SSLCOMMERZ integration](https://developer.sslcommerz.com/doc/v4/) and [D1 transactional batches](https://developers.cloudflare.com/d1/worker-api/d1-database/).

## Release checks

The pull request includes regression checks and builds for both targets. The local Worker smoke script uses an ephemeral database and test bindings; it must not be pointed at production. The repository cannot verify merchant credentials, backend access settings or approved catalog/stock without the owner's deployment inputs.
