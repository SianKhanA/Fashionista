"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
function SuccessContent() { const order = useSearchParams().get("order"); return <main className="container success-page"><CheckCircle2/><span className="eyebrow">Order confirmed</span><h1 className="serif">Thank you for shopping with us</h1><p>Your order <strong>{order || ""}</strong> has been received. We will call your mobile number before dispatch.</p><div><Link className="button button-primary" href="/track">Track your order</Link><Link className="button button-light" href="/shop">Continue shopping</Link></div></main>; }
export default function OrderSuccessPage() { return <Suspense fallback={<main className="container loading-state">Loading confirmation…</main>}><SuccessContent/></Suspense>; }
