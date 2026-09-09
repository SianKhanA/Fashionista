import { calculateShipping, products } from "./catalog";
import { clean, normalizePhone, record, RequestError } from "./http";

export const divisions = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];
export type PaymentMethod = "cod" | "bkash" | "card";
export function parseOrder(value: unknown) {
  const input = record(value), customer = record(input.customer);
  const delivery = {
    name: clean(customer.name, 80), phone: normalizePhone(customer.phone), email: clean(customer.email, 120).toLowerCase(),
    address: clean(customer.address, 300), division: clean(customer.division, 30), district: clean(customer.district, 60),
    postcode: clean(customer.postcode, 12), notes: clean(customer.notes, 300),
  };
  if (delivery.name.length < 2 || !/^01[3-9]\d{8}$/.test(delivery.phone) || delivery.address.length < 8 || !divisions.includes(delivery.division) || delivery.district.length < 2) {
    throw new RequestError("Please provide complete and valid delivery details.");
  }
  if (delivery.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email)) throw new RequestError("Please enter a valid email address.");
  if (!["cod", "bkash", "card"].includes(String(input.paymentMethod))) throw new RequestError("Please select a payment method.");
  const method = input.paymentMethod as PaymentMethod;
  const key = clean(input.idempotencyKey, 80);
  if (!/^[a-f0-9-]{36}$/i.test(key) || !Array.isArray(input.items) || !input.items.length || input.items.length > 30) throw new RequestError("Your shopping bag is invalid.");
  const combined = new Map<string, { productId: string; size: string; quantity: number }>();
  for (const raw of input.items) {
    const item = record(raw), productId = clean(item.productId, 100), size = clean(item.size, 20);
    if (typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) throw new RequestError("Choose a whole quantity between 1 and 10.");
    const lineKey = `${productId}:${size}`;
    const quantity = (combined.get(lineKey)?.quantity ?? 0) + item.quantity;
    if (quantity > 10) throw new RequestError("The maximum quantity per product and size is 10.");
    combined.set(lineKey, { productId, size, quantity });
  }
  const items = [...combined.values()].sort((a, b) => `${a.productId}:${a.size}`.localeCompare(`${b.productId}:${b.size}`));
  const fingerprint = JSON.stringify({ customer: delivery, method, items });
  return { delivery, method, key, items, fingerprint };
}
export function priceOrder(input: ReturnType<typeof parseOrder>) {
  const lines = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.sizes.includes(item.size)) throw new RequestError("One or more items are unavailable. Please refresh your bag.");
    return { ...item, product };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const shipping = calculateShipping(subtotal, input.delivery.division);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}
export async function hashRequest(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (b) => b.toString(16).padStart(2, "0")).join("");
}
