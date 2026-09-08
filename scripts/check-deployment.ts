import { catalogIsSample } from '../lib/catalog';
import { siteUrl } from '../lib/site-url';
const errors: string[] = [];
try { siteUrl(); } catch { errors.push('Set PUBLIC_SITE_URL to the final HTTPS storefront origin.'); }
const mode = process.env.CHECKOUT_MODE || 'disabled';
if (!['disabled', 'sandbox', 'live'].includes(mode)) errors.push('CHECKOUT_MODE must be disabled, sandbox, or live.');
if (process.env.VERCEL === '1' || process.env.STORE_RUNTIME === 'proxy') {
  try {
    const url = new URL(process.env.SITES_BACKEND_URL || '');
    if (url.protocol !== 'https:' || url.origin === siteUrl() || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error();
  } catch { errors.push('Set SITES_BACKEND_URL to a distinct, reachable HTTPS Worker origin.'); }
}
if (mode === 'live') {
  if (catalogIsSample) errors.push('Replace sample inventory/photos and set catalogIsSample=false in lib/catalog.ts.');
  if (process.env.INVENTORY_READY !== 'true') errors.push('Load verified D1 inventory before setting INVENTORY_READY=true.');
}
if (mode === 'sandbox' && process.env.SSLCOMMERZ_SANDBOX === 'false') errors.push('Sandbox checkout cannot use live gateway credentials.');
const hasId = Boolean(process.env.SSLCOMMERZ_STORE_ID), hasPassword = Boolean(process.env.SSLCOMMERZ_STORE_PASSWORD);
if (hasId !== hasPassword) errors.push('Configure both merchant credential values or neither (COD only).');
if (mode === 'live' && hasId && process.env.SSLCOMMERZ_SANDBOX !== 'false') errors.push('Live online checkout requires SSLCOMMERZ_SANDBOX=false.');
if (errors.length) { for (const error of errors) console.error(error); process.exitCode = 1; }
else console.log(`Deployment configuration passes for ${mode} checkout. Remote connectivity and merchant verification still require deployment checks.`);
