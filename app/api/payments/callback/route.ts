import { database } from "@/db/runtime";
import { confirmPayment } from "@/lib/payment-service";
import { siteUrl } from "@/lib/site-url";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";
export async function POST(request: Request) {
  if (usesVercelBridge()) return proxyToSites(request, "/api/payments/callback");
  try {
    const form = await request.formData();
    const order = await confirmPayment(database(), String(form.get("val_id") || ""));
    return Response.redirect(`${siteUrl()}/order/success?order=${encodeURIComponent(order)}`, 303);
  } catch {
    return Response.redirect(`${siteUrl()}/checkout?payment=unverified`, 303);
  }
}
