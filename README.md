# FashionistA storefront

FashionistA is a responsive React + TypeScript boutique storefront backed by Convex. It includes catalog browsing, category/size/price filters, product galleries, authenticated carts and wishlists, reviews, order tracking, customer-care forms, server-validated coupons, cash on delivery, and Stripe-hosted online checkout.

## Requirements

- Bun 1.1+ (the tracked `bun.lock` is the source of dependency truth)
- A Convex project
- GitHub and/or Google OAuth applications
- A Stripe account for online payments

## Local setup

1. Run `bun install`.
2. Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL`.
3. Run `bunx convex dev` and link the project.
4. Configure Convex Auth with `bunx @convex-dev/auth` and set the OAuth values listed below.
5. Seed a new catalog once with `bunx convex run seed:seedAll`. For an existing catalog, run `bunx convex run seed:seedCoupons` instead.
6. Start the storefront with `bun run dev`.

The generated files in `src/convex/_generated` are committed intentionally so clean checkouts can type-check. Re-run Convex code generation after changing backend modules or the schema.

## Convex environment

Set these with `bunx convex env set NAME value` for each deployment:

- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- `SITE_URL` — the exact HTTPS storefront origin, with no path
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

At least one OAuth provider must be configured. If only one is enabled, remove the other provider and button before launch.

Create a Stripe webhook for `https://YOUR_CONVEX_DEPLOYMENT.convex.site/stripe/webhook` and subscribe to `checkout.session.completed` and `checkout.session.expired`. Card and wallet details remain on Stripe Checkout; the storefront never receives or stores full card data.

## Production checks

Run:

```text
bun run typecheck
bun run build
```

Deploy the backend first with `bunx convex deploy`, then build the frontend with production values for `VITE_CONVEX_URL` and `VITE_SITE_URL`. Serve `dist/` from an HTTPS static host with SPA fallback enabled. The included `_headers` and `_redirects` files cover compatible hosts; reproduce the same headers and fallback rules elsewhere.

Before opening sales:

- Review the shipping, returns, privacy, cookies, and terms copy with the store owner and applicable counsel.
- Promote the owner’s Convex user document to `role: "admin"` directly in the Convex dashboard. No public API can grant admin access.
- Replace or confirm all catalog photos and product claims, then seed production only once.
- Complete real-mode Stripe and OAuth test orders, including webhook delivery, expiry, refunds, inventory restoration, and mobile checkout.
- Configure operational monitoring for failed webhooks, low inventory, unresolved customer messages, and deployment errors.

## Security model

- Every privileged catalog/category/order/support query is admin-gated on the server.
- Cart mutation ownership, variants, quantities, product availability, and stock are validated server-side.
- Order item names, prices, discounts, shipping, and totals are derived from the database, never trusted from the browser.
- Stripe webhook signatures have a five-minute replay tolerance and are verified before order fulfillment.
- Online checkout reserves stock temporarily and releases it after expiry or checkout creation failure.
- Reviews, profiles, newsletter addresses, and support messages enforce length and format limits.
- Security headers restrict scripts, connections, framing, browser capabilities, and long-lived asset caching.
