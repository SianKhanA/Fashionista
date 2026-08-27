import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const addressValidator = v.object({
  street: v.string(), city: v.string(), state: v.string(), zip: v.string(), country: v.string(),
});

function storefrontUrl() {
  const value = process.env.SITE_URL;
  if (!value) throw new Error("Online payments are not configured");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("SITE_URL must use HTTPS");
  }
  return url.origin;
}

export const createCheckoutSession = action({
  args: {
    shippingAddress: addressValidator,
    couponCode: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("Online payments are not configured");

    const prepared = await ctx.runMutation(internal.orders.prepareStripeOrder, {
      userId,
      shippingAddress: args.shippingAddress,
      couponCode: args.couponCode,
    });

    try {
      const origin = storefrontUrl();
      const body = new URLSearchParams();
      body.set("mode", "payment");
      body.set("success_url", `${origin}/orders?checkout=success`);
      body.set("cancel_url", `${origin}/checkout?checkout=cancelled`);
      body.set("client_reference_id", prepared.orderId);
      body.set("expires_at", String(Math.floor(Date.now() / 1000) + 30 * 60));
      body.set("metadata[orderId]", prepared.orderId);
      body.set("line_items[0][quantity]", "1");
      body.set("line_items[0][price_data][currency]", "usd");
      body.set("line_items[0][price_data][unit_amount]", String(prepared.total));
      body.set("line_items[0][price_data][product_data][name]", `FashionistA order ${prepared.orderId.slice(-8).toUpperCase()}`);
      body.set("billing_address_collection", "auto");

      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": `fashionista-${prepared.orderId}`,
        },
        body,
      });
      const payload = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!response.ok || !payload.id || !payload.url) {
        throw new Error(payload.error?.message || "Unable to start secure checkout");
      }
      await ctx.runMutation(internal.orders.attachStripeSession, {
        orderId: prepared.orderId,
        sessionId: payload.id,
      });
      return { url: payload.url };
    } catch (error) {
      await ctx.runMutation(internal.orders.cancelStripeOrder, { orderId: prepared.orderId });
      throw new Error(error instanceof Error ? error.message : "Unable to start secure checkout");
    }
  },
});
