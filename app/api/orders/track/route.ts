import { database } from "@/db/runtime";
import { clean, errorResponse, json, normalizePhone, readJson, RequestError } from "@/lib/http";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";
export async function POST(request: Request) {
  if (usesVercelBridge()) return proxyToSites(request, "/api/orders/track");
  try {
    const body = await readJson(request), code = clean(body.orderCode, 30).toUpperCase(), phone = normalizePhone(body.phone);
    if (!/^FAS-[A-F0-9]{10,20}$/.test(code) || !/^01[3-9]\d{8}$/.test(phone)) throw new RequestError("Enter a valid order number and mobile number.");
    // Recognize older orders that stored a country prefix without exposing delivery details.
    const order = await database().prepare(`SELECT id,order_code AS orderCode,status,payment_status AS paymentStatus,total,created_at AS createdAt,is_demo AS demo
      FROM orders WHERE order_code=? AND phone IN (?,?,?)`).bind(code, phone, `88${phone}`, `+88${phone}`)
      .first<{ id: number; orderCode: string; status: string; paymentStatus: string; total: number; createdAt: string; demo: number }>();
    if (!order) throw new RequestError("We could not find an order with those details.", 404);
    const items = await database().prepare("SELECT product_id AS productId,name,size,quantity FROM order_items WHERE order_id=?").bind(order.id).all();
    const { id: _id, ...details } = order;
    return json({ ...details, items: items.results });
  } catch (error) { return errorResponse(error); }
}
