export type CartLine = { productId: string; size: string; quantity: number };
export const CHECKOUT_KEY = "fashionista-checkout-v2";
export type PendingCheckout = { key: string; fingerprint: string; phone: string; items: CartLine[]; orderCode?: string };
export function readStorage(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function writeStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
export function removeStorage(key: string) { try { localStorage.removeItem(key); } catch {} }
export function parseCart(value: string | null): CartLine[] {
  try {
    const data: unknown = JSON.parse(value || "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((x): x is CartLine => Boolean(x) && typeof x === "object" && typeof x.productId === "string" && typeof x.size === "string" && Number.isInteger(x.quantity) && x.quantity >= 1 && x.quantity <= 10).slice(0, 30);
  } catch { return []; }
}
export function parseWishlist(value: string | null): string[] {
  try { const data: unknown = JSON.parse(value || "[]"); return Array.isArray(data) ? [...new Set(data.filter((x): x is string => typeof x === "string"))].slice(0, 200) : []; }
  catch { return []; }
}
export function pendingCheckout(): PendingCheckout | null {
  try {
    const data = JSON.parse(readStorage(CHECKOUT_KEY) || "null");
    return data && typeof data.key === "string" && typeof data.fingerprint === "string" && typeof data.phone === "string" && Array.isArray(data.items) ? data : null;
  } catch { return null; }
}
export function checkoutAttempt(fingerprint: string, phone: string, items: CartLine[], previous: PendingCheckout | null): PendingCheckout {
  return previous?.fingerprint === fingerprint ? previous : { key: crypto.randomUUID(), fingerprint, phone, items };
}
export function subtractPurchased(cart: CartLine[], purchased: CartLine[]) {
  return cart.flatMap((line) => {
    const quantity = line.quantity - purchased.filter((p) => p.productId === line.productId && p.size === line.size).reduce((sum, p) => sum + p.quantity, 0);
    return quantity > 0 ? [{ ...line, quantity }] : [];
  });
}
