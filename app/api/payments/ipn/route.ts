import { database } from "@/db/runtime";
import { confirmPayment } from "@/lib/payment-service";
import { errorResponse, json } from "@/lib/http";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";
export async function POST(request: Request) {
  if (usesVercelBridge()) return proxyToSites(request, "/api/payments/ipn");
  try {
    const form = await request.formData();
    await confirmPayment(database(), String(form.get("val_id") || ""));
    return json({ received: true });
  } catch (error) { return errorResponse(error); }
}
