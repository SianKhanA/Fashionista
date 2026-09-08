import { database } from "@/db/runtime";
import { createOrder } from "@/lib/order-service";
import { errorResponse, json, readJson } from "@/lib/http";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";
export async function POST(request: Request) {
  if (usesVercelBridge()) return proxyToSites(request, "/api/orders");
  try { return json(await createOrder(database(), await readJson(request))); }
  catch (error) { return errorResponse(error); }
}
