import { checkoutMode } from "@/lib/checkout-mode";
import { json } from "@/lib/http";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";
export async function GET(request: Request) {
  if (usesVercelBridge()) return proxyToSites(request, "/api/checkout");
  const mode = checkoutMode();
  const gatewayMatches = (mode === "sandbox") === (process.env.SSLCOMMERZ_SANDBOX !== "false");
  return json({ mode, online: mode !== "disabled" && gatewayMatches && Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD) });
}
