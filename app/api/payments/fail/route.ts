import { siteUrl } from "@/lib/site-url";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";
// Browser return parameters are untrusted and must never change payment or stock state.
export async function POST(request: Request) {
  if (usesVercelBridge()) return proxyToSites(request, "/api/payments/fail");
  return Response.redirect(`${siteUrl()}/checkout?payment=failed`, 303);
}
export async function GET(request: Request) { return POST(request); }
