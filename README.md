# FashionistA Bangladesh

Bangladesh boutique storefront built with React 19, TypeScript, Next.js 16 and Tailwind. The Sites target uses Vinext and Cloudflare D1. Vercel serves the storefront and forwards all commerce API requests, including payment callbacks, to the separately deployed Worker.

The checked-in catalog is **sample content**. The storefront displays a preview notice and does not accept orders by default. Sandbox orders are explicitly marked as test orders. Real ordering cannot be enabled until the catalog is replaced and inventory is configured.

## Development

Use Node.js 24+ and pnpm 11.19.0. Copy `.env.example` to `.env.local` and set the customer-facing origin.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` runs Next.js. For API work, set `STORE_RUNTIME=proxy` and `SITES_BACKEND_URL` to a separately deployed test backend. Never point development at a live order database.

`pnpm dev:sites` runs the Worker-compatible target with local D1. Apply the SQL files in `drizzle/` in order to that local DB before testing. There is no runtime schema creation. Production migrations are shipped by the Sites build.

## Behavior

- Product filtering, search, sorting, pagination, galleries, sizing and device-local cart/wishlist
- Guest checkout with validated delivery details and server-calculated BDT totals
- Persistent checkout keys, atomic order/item writes and stock reservation for live orders
- COD and SSLCOMMERZ-hosted bKash/cards; no payment details stored in the app
- Exact server-side payment verification, separate IPN acknowledgment and replay-safe updates
- Guest order tracking with normalized Bangladesh phone numbers
- Newsletter storage, metadata and security headers

Cart contents are removed only after the server confirms a matching order. Failed/cancelled payments retain the bag. Retries reuse the saved order and gateway URL. An ambiguous gateway timeout requires reconciliation rather than creating another potentially chargeable session.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check:deployment
pnpm build
pnpm build:sites
pnpm check:worker
```

`check:worker` starts an ephemeral local Cloudflare runtime and applies the actual migrations to D1. It checks order creation, retries, tracking, and home-page rendering. It performs no real payments. The regular regression suite uses real SQLite transactions and mocked gateway responses. The standalone typecheck checks application source; each production build validates its own generated route types, avoiding collisions between Next.js and Vinext output.

See [DEPLOYMENT.md](DEPLOYMENT.md) for environment configuration, migration order, stock loading and payment validation. The old prototypes under `legacy-react/`, `practice/`, `my_code/`, `Turjo bhaia/` and `Eshop Free/` are not part of the current build.
