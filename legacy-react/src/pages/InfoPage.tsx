import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/Toast";

const pages: Record<string, { title: string; intro: string; sections: { title: string; body: string }[] }> = {
  shipping: {
    title: "Shipping & returns",
    intro: "Clear, thoughtful service from our studio to your wardrobe.",
    sections: [
      { title: "Shipping", body: "Standard shipping is complimentary on orders of $150 or more. Available delivery options and final charges are confirmed at checkout." },
      { title: "Returns", body: "Unworn items with original tags may be requested for return within 30 days of delivery. Final-sale items, pierced jewelry, and worn goods are not eligible." },
      { title: "Order changes", body: "Orders move quickly. Send us a message as soon as possible and include your order number; we’ll help if fulfillment has not begun." },
    ],
  },
  sizing: {
    title: "Sizing guide",
    intro: "Use garment measurements on each product page for the best fit.",
    sections: [
      { title: "How to measure", body: "Measure your bust at the fullest point, your natural waist at its narrowest point, and your hips at their widest point. Keep the tape level and comfortably close." },
      { title: "Between sizes", body: "Choose the larger size for structured fabrics and the smaller size for relaxed or stretch silhouettes. Product-specific fit notes take priority." },
      { title: "Personal help", body: "Contact our customer care team with the product name and your measurements for tailored sizing guidance." },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    intro: "The essentials, all in one place.",
    sections: [
      { title: "Can I track my order?", body: "Yes. Sign in and visit My Orders. Tracking appears as soon as your parcel is handed to the carrier." },
      { title: "Are payments secure?", body: "Online card and wallet payments are handled by Stripe. FashionistA does not collect or store your full card number." },
      { title: "Can I save an item?", body: "Sign in and select the heart on any product to add it to your wishlist." },
    ],
  },
  sustainability: {
    title: "Our responsibility",
    intro: "Style should be considered, enduring, and transparent.",
    sections: [
      { title: "Buy thoughtfully", body: "We favor versatile designs and detailed care instructions that help every piece remain in rotation for longer." },
      { title: "Packaging", body: "Orders are packed with right-sized materials wherever possible. Supplier and material claims are reviewed before they appear in product descriptions." },
      { title: "Continuous progress", body: "We treat sustainability as measurable work, not a slogan, and will publish verified sourcing details as the collection grows." },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "We collect only the information needed to serve your account and fulfill your orders.",
    sections: [
      { title: "Information we use", body: "Account, contact, delivery, order, wishlist, and support information is used to provide the storefront and customer service. Payment card details are handled by Stripe and are not stored by FashionistA." },
      { title: "Your choices", body: "You may request access, correction, or deletion of your profile and support information. You may unsubscribe from marketing at any time." },
      { title: "Retention and security", body: "Information is retained only as needed for service, fraud prevention, and legal obligations, with access limited to authorized operations." },
    ],
  },
  terms: {
    title: "Terms of service",
    intro: "These terms govern use of the FashionistA storefront.",
    sections: [
      { title: "Orders", body: "An order is accepted after inventory and payment are confirmed. We may cancel and refund orders affected by pricing errors, fraud checks, or unavailable stock." },
      { title: "Product information", body: "We work to present colors, sizing, and availability accurately. Displays vary by device, and availability may change before checkout completes." },
      { title: "Acceptable use", body: "Do not misuse the service, attempt unauthorized access, automate abusive requests, or interfere with other customers’ use of the storefront." },
    ],
  },
  cookies: {
    title: "Cookie policy",
    intro: "FashionistA uses essential browser storage to keep the storefront secure and useful.",
    sections: [
      { title: "Essential storage", body: "Authentication session data and local recently viewed preferences support account access and shopping features." },
      { title: "Payments", body: "Stripe may set essential cookies when you choose secure online payment." },
      { title: "Analytics", body: "Optional advertising or analytics cookies should not be enabled without a clear consent choice." },
    ],
  },
};

export default function InfoPage() {
  const { topic = "faq" } = useParams();
  if (topic === "contact") return <ContactPage />;
  const page = pages[topic];
  if (!page) return <div className="mx-auto max-w-3xl px-4 py-20"><h1 className="font-serif text-4xl font-bold">Page not found</h1><Link to="/" className="mt-4 inline-block text-primary hover:underline">Return home</Link></div>;
  return <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">FashionistA care</p><h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{page.title}</h1><p className="mt-4 text-lg text-muted-foreground">{page.intro}</p><div className="mt-12 space-y-9">{page.sections.map((section) => <section key={section.title}><h2 className="font-serif text-2xl font-semibold">{section.title}</h2><p className="mt-3 leading-7 text-muted-foreground">{section.body}</p></section>)}</div></article>;
}

function ContactPage() {
  const sendMessage = useMutation(api.support.sendMessage);
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", orderNumber: "", message: "", website: "" });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSending(true);
    try { await sendMessage({ ...form, orderNumber: form.orderNumber || undefined }); setSent(true); toast("Your message has been received", "success"); }
    catch (error) { toast(error instanceof Error ? error.message : "Unable to send your message", "error"); }
    finally { setSending(false); }
  };
  return <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:py-20"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Customer care</p><h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">How can we help?</h1><p className="mt-4 text-muted-foreground">Send us the details below. For order help, include the order number shown in My Orders.</p>{sent ? <div className="mt-10 rounded-2xl border bg-card p-8 text-center"><h2 className="font-serif text-2xl font-semibold">Message received</h2><p className="mt-2 text-muted-foreground">Our customer care team will follow up using the email you provided.</p></div> : <form onSubmit={submit} className="mt-10 space-y-4 rounded-2xl border bg-card p-6 sm:p-8"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Name<Input className="mt-1.5" required maxLength={80} value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} /></label><label className="text-sm font-medium">Email<Input className="mt-1.5" type="email" required maxLength={254} value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} /></label></div><label className="block text-sm font-medium">Order number <span className="text-muted-foreground">(optional)</span><Input className="mt-1.5" maxLength={80} value={form.orderNumber} onChange={(e) => setForm((v) => ({ ...v, orderNumber: e.target.value }))} /></label><label className="block text-sm font-medium">Message<textarea className="mt-1.5 min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required minLength={20} maxLength={3000} value={form.message} onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))} /></label><input className="absolute -left-[9999px]" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm((v) => ({ ...v, website: e.target.value }))} /><Button variant="rose" disabled={sending}>{sending ? "Sending…" : "Send message"}</Button></form>}</div>;
}
