import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null;
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
}

async function validStripeSignature(payload: string, header: string, secret: string) {
  const entries = header.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = entries.find(([key]) => key === "t")?.[1];
  const signatures = entries.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const data = new TextEncoder().encode(`${timestamp}.${payload}`);
  for (const signature of signatures) {
    const bytes = hexToBytes(signature);
    if (bytes && await crypto.subtle.verify("HMAC", key, bytes, data)) return true;
  }
  return false;
}

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get("stripe-signature");
    const payload = await request.text();
    if (!secret || !signature || !(await validStripeSignature(payload, signature, secret))) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(payload) as {
      type?: string;
      data?: { object?: { id?: string; client_reference_id?: string; payment_status?: string; payment_intent?: string } };
    };
    const session = event.data?.object;
    if (!session?.id || !session.client_reference_id) return new Response("ok");
    const orderId = session.client_reference_id as Id<"orders">;

    if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
      await ctx.runMutation(internal.orders.markStripePaid, {
        orderId,
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
      });
    } else if (event.type === "checkout.session.expired") {
      await ctx.runMutation(internal.orders.cancelStripeOrder, { orderId });
    }
    return new Response("ok");
  }),
});

export default http;
