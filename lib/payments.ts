import { siteUrl } from "./site-url";
import { RequestError } from "./http";

type PaymentOrder = { orderCode: string; total: number; name: string; phone: string; email?: string; address: string; paymentMethod: "bkash" | "card"; demo: boolean };
export type Validation = { status?: string; tran_id?: string; amount?: string; currency?: string; risk_level?: string | number; val_id?: string };
function config() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID, password = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!storeId || !password) throw new RequestError("Online payment is temporarily unavailable. Please select cash on delivery.", 503);
  const sandbox = process.env.SSLCOMMERZ_SANDBOX !== "false";
  return { storeId, password, sandbox, base: sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com" };
}
export function assertPaymentConfigured(mode: "sandbox" | "live") {
  const settings = config();
  if ((mode === "sandbox") !== settings.sandbox) throw new RequestError("Payment configuration does not match the store mode.", 503);
  siteUrl();
}
export async function initiatePayment(order: PaymentOrder) {
  assertPaymentConfigured(order.demo ? "sandbox" : "live");
  const { storeId, password, base } = config(), site = siteUrl();
  const body = new URLSearchParams({
    store_id: storeId, store_passwd: password, total_amount: String(order.total), currency: "BDT", tran_id: order.orderCode,
    success_url: `${site}/api/payments/callback`, fail_url: `${site}/api/payments/fail`, cancel_url: `${site}/api/payments/cancel`, ipn_url: `${site}/api/payments/ipn`,
    cus_name: order.name, cus_email: order.email || "customer@fashionista.bd", cus_add1: order.address, cus_city: "Bangladesh", cus_country: "Bangladesh", cus_phone: order.phone,
    shipping_method: "YES", ship_name: order.name, ship_add1: order.address, ship_city: "Bangladesh", ship_country: "Bangladesh",
    product_name: `FashionistA order ${order.orderCode}`, product_category: "Clothing", product_profile: "general",
    multi_card_name: order.paymentMethod === "bkash" ? "bkash" : "visacard,mastercard,amexcard",
  });
  const response = await fetch(`${base}/gwprocess/v4/api.php`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error("Payment gateway unavailable");
  const data = await response.json() as { status?: string; GatewayPageURL?: string };
  if (data.status === "FAILED") throw new RequestError("The payment gateway could not start. Your bag is saved. Please retry.", 422);
  if (data.status !== "SUCCESS" || !data.GatewayPageURL) throw new Error("Unrecognized payment response");
  const paymentUrl = new URL(data.GatewayPageURL);
  if (paymentUrl.protocol !== "https:" || !(paymentUrl.hostname === "sslcommerz.com" || paymentUrl.hostname.endsWith(".sslcommerz.com")) || paymentUrl.username || paymentUrl.password) throw new Error("Invalid payment URL");
  return paymentUrl.toString();
}
export async function validatePayment(valId: string): Promise<Validation> {
  const { storeId, password, base } = config();
  const url = new URL(`${base}/validator/api/validationserverAPI.php`);
  url.search = new URLSearchParams({ val_id: valId, store_id: storeId, store_passwd: password, format: "json" }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: "no-store" });
  if (!response.ok) throw new Error("Payment validation unavailable");
  return response.json();
}
