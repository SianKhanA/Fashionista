# FashionistA Bangladesh

Production-oriented boutique commerce site for sarees, kameez, three-piece sets, kurtis and accessories. It is built with React 19, TypeScript, Vinext and Cloudflare D1, with no Convex or OAuth dependency.

## Included

- Responsive storefront with 96 sample catalog variants, category/material/occasion filters, search, sorting and pagination
- Product galleries, sizing, reviews, wishlist and persistent device cart
- Bangladesh delivery pricing and a guest checkout that revalidates every product and total on the server
- Cash on delivery plus SSLCOMMERZ-hosted bKash and card flows
- Durable D1 orders, idempotent order creation, guest order tracking and newsletter storage
- Product/organization structured data, social metadata, security headers and immutable asset caching

## Local development

Requirements: Node.js 22.13+ and pnpm.

```bash
pnpm install
pnpm dev
```

The local Sites runtime supplies the `DB` D1 binding and creates the required tables on first use. Open `http://127.0.0.1:3000`.

## Configuration

Copy `.env.example` to `.env.local` for local gateway testing. Configure these as encrypted server-side environment values in production:

- `PUBLIC_SITE_URL` — exact HTTPS origin without a trailing slash
- `SSLCOMMERZ_STORE_ID` — merchant store ID
- `SSLCOMMERZ_STORE_PASSWORD` — merchant store password
- `SSLCOMMERZ_SANDBOX` — `true` for sandbox and `false` for live payments

Cash on delivery works without gateway credentials. If SSLCOMMERZ credentials are absent, bKash/card requests fail safely and ask the customer to choose cash on delivery. Never commit live credentials.

## Catalog management

The launch catalog is defined in `lib/catalog.ts`; images live in `public/products`. The base-product/colour model expands a concise merchandising list into efficient variants. Replace the sample product names, prices, descriptions, availability and photography with owner-approved inventory before accepting paid orders.

## Database

The D1 binding name is `DB` in `.openai/hosting.json`. The tracked migration is `drizzle/0000_launch_orders.sql`. Runtime initialization is idempotent, making clean preview deployments usable immediately.

## Verification

```bash
pnpm lint
.\node_modules\.bin\tsc.cmd --noEmit  # Windows
pnpm build
```

Before public launch, add live SSLCOMMERZ credentials, set the canonical site URL, run a real low-value bKash/card payment, confirm callback/IPN processing, and replace all sample catalog content with the store's final inventory. Review the exchange/privacy copy with the owner or local counsel.
