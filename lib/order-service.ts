import { reserveStock } from "./inventory";
import { requireCheckout } from "./checkout-mode";
import { RequestError } from "./http";
import { hashRequest, parseOrder, priceOrder } from "./order-input";
import { assertPaymentConfigured, initiatePayment } from "./payments";

type SavedOrder = {
  order_code: string; request_hash: string | null; total: number; payment_method: "cod" | "bkash" | "card";
  payment_status: string; payment_url: string | null; gateway_state: string;
  name: string; phone: string; email: string | null; address: string; is_demo: number;
};
export async function createOrder(db: D1Database, raw: unknown) {
  const input = parseOrder(raw);
  const hash = await hashRequest(input.fingerprint);
  const lookup = () => db.prepare("SELECT * FROM orders WHERE idempotency_key = ?").bind(input.key).first<SavedOrder>();
  let order = await lookup();
  if (!order) {
    const mode = requireCheckout();
    if (input.method !== "cod") assertPaymentConfigured(mode);
    const { lines, subtotal, shipping, total } = priceOrder(input);
    const code = `FAS-${crypto.randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`;
    const now = new Date().toISOString(), c = input.delivery;
    try {
      // D1 batches are transactions: item failure rolls back the parent and all stock changes.
      await db.batch([
        db.prepare(`INSERT INTO orders
          (order_code,idempotency_key,request_hash,name,phone,email,address,division,district,postcode,notes,
           subtotal,shipping,total,payment_method,payment_status,status,is_demo,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .bind(code,input.key,hash,c.name,c.phone,c.email||null,c.address,c.division,c.district,c.postcode||null,c.notes||null,
            subtotal,shipping,total,input.method,input.method === "cod" ? "cash_due" : "pending",mode === "sandbox" ? "demo" : "placed",mode === "sandbox" ? 1 : 0,now,now),
        ...(mode === "live" ? lines.map((line) => reserveStock(db,line.product.id,line.size,line.quantity)) : []),
        ...lines.map((line) => db.prepare(`INSERT INTO order_items (order_id,product_id,name,size,quantity,unit_price)
          VALUES ((SELECT id FROM orders WHERE order_code=?),?,?,?,?,?)`)
          .bind(code,line.product.id,line.product.name,line.size,line.quantity,line.product.price)),
      ]);
    } catch (error) {
      // A concurrent request with this key may have committed first.
      order = await lookup();
      if (!order) {
        const message = error instanceof Error ? error.message : "";
        if (/inventory_unavailable|stock_quantity/i.test(message)) throw new RequestError("An item just sold out. Please adjust your bag.", 409);
        throw error;
      }
    }
    order ??= await lookup();
  }
  if (!order) throw new Error("Order persistence failed");
  if (order.request_hash !== hash) throw new RequestError("This checkout was already submitted with different details. Check your existing order before starting another.", 409);
  if (order.payment_method === "cod" || ["paid", "review"].includes(order.payment_status)) return { orderCode: order.order_code, paymentStatus: order.payment_status, demo: Boolean(order.is_demo) };
  if (order.payment_url) return { orderCode: order.order_code, paymentUrl: order.payment_url, demo: Boolean(order.is_demo) };
  // Claim the gateway request exactly once. A timeout is ambiguous: do not create another charge session.
  const claim = await db.prepare("UPDATE orders SET gateway_state='starting', updated_at=? WHERE order_code=? AND gateway_state='not_started'")
    .bind(new Date().toISOString(), order.order_code).run();
  if (!claim.meta.changes) throw new RequestError(`Payment for ${order.order_code} is being checked. Please track your order before trying again.`, 409);
  try {
    const paymentUrl = await initiatePayment({ orderCode: order.order_code, total: order.total, name: order.name, phone: order.phone,
      email: order.email || undefined, address: order.address, paymentMethod: order.payment_method, demo: Boolean(order.is_demo) });
    await db.prepare("UPDATE orders SET payment_url=?, gateway_state='ready', updated_at=? WHERE order_code=?")
      .bind(paymentUrl, new Date().toISOString(), order.order_code).run();
    return { orderCode: order.order_code, paymentUrl, demo: Boolean(order.is_demo) };
  } catch (error) {
    // Only a definite gateway rejection is retryable. Preserve ambiguous attempts for reconciliation.
    if (error instanceof RequestError && error.status === 422) {
      await db.prepare("UPDATE orders SET gateway_state='not_started', updated_at=? WHERE order_code=? AND payment_status='pending'")
        .bind(new Date().toISOString(), order.order_code).run();
    }
    throw error;
  }
}
