"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CHECKOUT_KEY, checkoutAttempt, pendingCheckout, writeStorage } from "@/lib/browser-store";
import { CreditCard, Landmark, Truck } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { calculateShipping, formatBDT, products } from "@/lib/catalog";

const divisions = ["Dhaka","Chattogram","Rajshahi","Khulna","Barishal","Sylhet","Rangpur","Mymensingh"];

export default function CheckoutPage() {
  const router = useRouter(); const { cart, hydrated } = useStore();
  const [division,setDivision] = useState("Dhaka"); const [payment,setPayment] = useState("cod"); const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  const lines = useMemo(() => cart.flatMap((line) => { const product = products.find((p) => p.id === line.productId); return product ? [{...line,product}] : []; }),[cart]);
  const subtotal = lines.reduce((sum,line) => sum + line.product.price * line.quantity,0); const shipping = calculateShipping(subtotal,division); const total = subtotal + shipping;
  const submitting = useRef(false);
  const attempt = useRef<ReturnType<typeof pendingCheckout>>(null);
  const [mode, setMode] = useState("loading");
  const [online, setOnline] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      attempt.current = pendingCheckout();
      try {
        const saved = JSON.parse(sessionStorage.getItem("fashionista-delivery") || "{}");
        setDraft(saved); if (saved.division) setDivision(saved.division);
        if (["cod", "bkash", "card"].includes(saved.payment)) setPayment(saved.payment);
      } catch {}
      const state = new URLSearchParams(window.location.search).get("payment");
      if (state) setError(state === "unverified" ? "We could not confirm the payment yet. Check your order before paying again." : "Payment was not completed. Your bag is saved. You can retry the payment or track your order.");
    });
    fetch("/api/checkout").then(async (response) => {
      if (!response.ok) throw new Error("Unavailable");
      return response.json() as Promise<{ mode: string; online: boolean }>;
    }).then((data) => { if (active) { setMode(data.mode); setOnline(data.online); } })
      .catch(() => { if (active) { setMode("disabled"); setError("Checkout is temporarily unavailable. Please try again later."); } });
    return () => { active = false; };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !["sandbox", "live"].includes(mode) || (payment !== "cod" && !online)) return;
    submitting.current = true; setBusy(true); setError("");
    const customer = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    const fingerprint = JSON.stringify({ customer, paymentMethod: payment, items: cart });
    const current = checkoutAttempt(fingerprint, customer.phone, cart, attempt.current);
    attempt.current = current;
    // Persist before sending: a lost response or reload must reuse the same key.
    if (!writeStorage(CHECKOUT_KEY, JSON.stringify(current))) {
      setError("Please enable browser storage before checking out so your order can be recovered safely.");
      submitting.current = false; setBusy(false); return;
    }
    try { sessionStorage.setItem("fashionista-delivery", JSON.stringify(customer)); } catch {}
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ customer, paymentMethod: payment, items: cart, idempotencyKey: current.key }) });
      const result = await response.json() as { orderCode?: string; paymentUrl?: string; error?: string };
      if (!response.ok || !result.orderCode) throw new Error(result.error || "Could not place the order.");
      current.orderCode = result.orderCode;
      writeStorage(CHECKOUT_KEY, JSON.stringify(current));
      if (result.paymentUrl) window.location.assign(result.paymentUrl);
      else router.push(`/order/success?order=${encodeURIComponent(result.orderCode)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not place the order. Your bag is saved.");
      submitting.current = false; setBusy(false);
    }
  }
  if (!hydrated) return <main className="container loading-state">Preparing checkout…</main>;
  if (!lines.length) return <main className="container empty-state page-space"><h1 className="serif">Your bag is empty</h1><Link className="button button-primary" href="/shop">Go to shop</Link></main>;
  return <main><section className="page-hero compact"><div className="container"><span className="eyebrow">Secure checkout</span><h1 className="serif">Complete your order</h1></div></section><form className="container checkout-layout" onSubmit={submit}><div className="checkout-form"><section className="form-card">{mode === "disabled" && <p role="status">We are preparing our collection. Online ordering is not open yet.</p>}{mode === "sandbox" && <p role="status">Test checkout only. These orders will not be charged or dispatched.</p>}<h2 className="serif">Delivery details</h2><div className="form-grid"><label>Full name<input name="name" defaultValue={draft.name || ""} required minLength={2} autoComplete="name"/></label><label>Mobile number<input name="phone" defaultValue={draft.phone || ""} required pattern="^(?:\+?88)?01[3-9]\d{8}$" placeholder="01XXXXXXXXX" autoComplete="tel"/></label><label className="full">Email (optional)<input name="email" defaultValue={draft.email || ""} type="email" autoComplete="email"/></label><label className="full">Full address<textarea name="address" defaultValue={draft.address || ""} required minLength={8} rows={3} autoComplete="street-address"/></label><label>Division<select name="division" value={division} onChange={(e) => setDivision(e.target.value)}>{divisions.map((x) => <option key={x}>{x}</option>)}</select></label><label>District<input name="district" defaultValue={draft.district || ""} required/></label><label>Postcode (optional)<input name="postcode" defaultValue={draft.postcode || ""} inputMode="numeric"/></label><label className="full">Order note (optional)<textarea name="notes" defaultValue={draft.notes || ""} rows={2} maxLength={300}/></label></div></section><section className="form-card"><h2 className="serif">Payment method</h2><div className="payment-options"><label className={payment === "cod" ? "selected" : ""}><input type="radio" name="payment" value="cod" checked={payment === "cod"} onChange={(e) => setPayment(e.target.value)}/><Truck/><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span></label><label className={payment === "bkash" ? "selected" : ""}><input type="radio" name="payment" value="bkash" disabled={!online} checked={payment === "bkash"} onChange={(e) => setPayment(e.target.value)}/><Landmark/><span><strong>bKash</strong><small>Secure payment through SSLCOMMERZ</small></span></label><label className={payment === "card" ? "selected" : ""}><input type="radio" name="payment" value="card" disabled={!online} checked={payment === "card"} onChange={(e) => setPayment(e.target.value)}/><CreditCard/><span><strong>Credit or debit card</strong><small>Visa, Mastercard or Amex</small></span></label></div>{error && <p className="form-error" role="alert">{error} <Link href="/track">Track an order</Link></p>}</section></div><aside className="order-summary checkout-summary"><h2 className="serif">Your order</h2>{lines.map((line) => <div className="summary-line" key={`${line.productId}-${line.size}`}><img src={line.product.images[0]} alt=""/><span>{line.product.name}<small>{line.size} · Qty {line.quantity}</small></span><b>{formatBDT(line.product.price * line.quantity)}</b></div>)}<hr/><p><span>Subtotal</span><strong>{formatBDT(subtotal)}</strong></p><p><span>Delivery</span><strong>{shipping ? formatBDT(shipping) : "Free"}</strong></p><p className="summary-total"><span>Total</span><strong>{formatBDT(total)}</strong></p><button className="button button-primary button-block" disabled={busy || !["sandbox", "live"].includes(mode)}>{busy ? "Placing order…" : payment === "cod" ? "Place order" : "Continue to secure payment"}</button><small>By ordering, you agree to our delivery and exchange policy.</small></aside></form></main>;
}
