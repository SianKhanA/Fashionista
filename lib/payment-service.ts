import { RequestError } from "./http";
import { validatePayment, type Validation } from "./payments";

type PaymentRecord = { order_code: string; total: number; payment_method: string; is_demo: number };
export function paymentMatches(order: PaymentRecord, result: Validation) {
  const amount = typeof result.amount === "string" && /^\d+(?:\.\d{1,2})?$/.test(result.amount) ? Number(result.amount) : NaN;
  return result.tran_id === order.order_code && ["VALID", "VALIDATED"].includes(result.status || "") &&
    result.currency === "BDT" && Number.isFinite(amount) && Math.round(amount * 100) === order.total * 100 &&
    order.payment_method !== "cod" && (result.risk_level === "0" || result.risk_level === 0 || result.risk_level === "1" || result.risk_level === 1);
}
export async function confirmPayment(db: D1Database, valId: string, validate = validatePayment) {
  if (!valId || valId.length > 100) throw new RequestError("Invalid payment notification.");
  const result = await validate(valId);
  if (!result.tran_id) throw new RequestError("Payment could not be verified.");
  const order = await db.prepare("SELECT order_code,total,payment_method,is_demo FROM orders WHERE order_code=?").bind(result.tran_id).first<PaymentRecord>();
  if (!order || !paymentMatches(order, result) || (result.val_id && result.val_id !== valId)) throw new RequestError("Payment could not be verified.");
  if (Boolean(order.is_demo) !== (process.env.SSLCOMMERZ_SANDBOX !== "false")) throw new RequestError("Payment environment mismatch.");
  const review = String(result.risk_level) === "1";
  // A repeated notification must never move a shipped/completed order back to confirmed.
  await db.prepare(`UPDATE orders SET payment_status=?,
    status=CASE WHEN status IN ('placed','payment_failed') THEN ? ELSE status END,
    transaction_id=?,updated_at=? WHERE order_code=? AND payment_status='pending'`)
    .bind(review ? "review" : "paid", review ? "payment_review" : "confirmed", valId, new Date().toISOString(), order.order_code).run();
  return order.order_code;
}
