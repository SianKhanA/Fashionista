"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store-provider";
import { CHECKOUT_KEY, pendingCheckout, removeStorage } from "@/lib/browser-store";
function SuccessContent() {
  const order = useSearchParams().get("order");
  const { completePurchase, hydrated } = useStore();
  const [state, setState] = useState("checking");
  const completed = useRef(false);
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const pending = pendingCheckout();
    async function verify() {
      if (!order || !pending || pending.orderCode !== order) { if (active) setState("unknown"); return; }
      try {
        const response = await fetch("/api/orders/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderCode: order, phone: pending.phone }) });
        if (!response.ok) throw new Error("Unverified");
        const result = await response.json() as { paymentStatus: string; demo: number };
        if (!active) return;
        const accepted = ["paid", "cash_due", "review"].includes(result.paymentStatus);
        setState(result.paymentStatus === "review" ? "review" : accepted ? result.demo ? "demo" : "confirmed" : "pending");
        if (accepted && !completed.current) {
          completed.current = true; completePurchase(pending.items); removeStorage(CHECKOUT_KEY);
          try { sessionStorage.removeItem("fashionista-delivery"); } catch {}
        }
      } catch { if (active) setState("unknown"); }
    }
    void verify();
    return () => { active = false; };
  }, [order, completePurchase, hydrated]);
  const confirmed = state === "confirmed" || state === "demo";
  return <main className="container success-page">
    {confirmed && <CheckCircle2/>}
    <span className="eyebrow">{state === "demo" ? "Test order received" : confirmed ? "Order received" : "Order status"}</span>
    <h1 className="serif">{state === "checking" ? "Checking your order…" : confirmed ? "Thank you for shopping with us" : state === "review" ? "Your payment is under review" : "Check your order status"}</h1>
    <p>{confirmed ? `Order ${order} has been received.${state === "demo" ? " This is a test order and will not be dispatched." : " We will call before dispatch."}` : "Use your order number and mobile number to check the latest status. Please check before paying again."}</p>
    <div><Link className="button button-primary" href="/track">Track your order</Link><Link className="button button-light" href="/shop">Continue shopping</Link></div>
  </main>;
}
export default function OrderSuccessPage() { return <Suspense fallback={<main className="container loading-state">Loading confirmation…</main>}><SuccessContent/></Suspense>; }
