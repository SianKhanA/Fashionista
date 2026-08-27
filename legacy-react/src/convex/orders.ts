import { internal } from "./_generated/api";
import { internalMutation, mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin, requireUser } from "./authz";

const SHIPPING_THRESHOLD = 15_000;
const STANDARD_SHIPPING = 995;
const CURRENCY = "usd";
const MAX_ORDER_ITEMS = 50;

const addressValidator = v.object({
  street: v.string(), city: v.string(), state: v.string(), zip: v.string(), country: v.string(),
});

type ShippingAddress = { street: string; city: string; state: string; zip: string; country: string };

function cleanAddress(address: ShippingAddress) {
  const cleaned = Object.fromEntries(
    Object.entries(address).map(([key, value]) => [key, value.trim()])
  ) as ShippingAddress;
  if (Object.values(cleaned).some((value) => value.length < 2 || value.length > 120)) {
    throw new Error("Please provide a valid shipping address");
  }
  return cleaned;
}

async function buildQuote(
  ctx: Pick<QueryCtx | MutationCtx, "db">,
  userId: Id<"users">,
  couponCode?: string
) {
  const cartItems = await ctx.db.query("cartItems").withIndex("by_user", (q) => q.eq("userId", userId)).take(MAX_ORDER_ITEMS + 1);
  if (cartItems.length === 0) throw new Error("Your cart is empty");
  if (cartItems.length > MAX_ORDER_ITEMS) throw new Error("Cart contains too many items");

  const items = [];
  for (const cartItem of cartItems) {
    const product = await ctx.db.get(cartItem.productId);
    if (!product || !product.active) throw new Error("A cart item is no longer available");
    if (product.inventory < cartItem.quantity) throw new Error(`${product.name} no longer has enough stock`);
    if (!product.sizes.includes(cartItem.selectedSize)) throw new Error("A selected size is unavailable");
    if (!product.colors.some((color) => color.name === cartItem.selectedColor)) throw new Error("A selected color is unavailable");
    items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      size: cartItem.selectedSize,
      color: cartItem.selectedColor,
      imageUrl: product.images[0],
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  let discount = 0;
  let appliedCoupon: string | undefined;
  const normalizedCode = couponCode?.trim().toUpperCase();

  if (normalizedCode) {
    const coupon = await ctx.db.query("coupons").withIndex("by_code", (q) => q.eq("code", normalizedCode)).unique();
    const usable = coupon?.active && (!coupon.expiresAt || coupon.expiresAt > Date.now()) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses) && (!coupon.minOrder || subtotal >= coupon.minOrder);
    if (!usable) throw new Error("This coupon is invalid or has expired");
    if (coupon.type === "percentage") discount = Math.round(subtotal * (Math.min(coupon.value, 100) / 100));
    else if (coupon.type === "fixed") discount = Math.min(coupon.value, subtotal);
    else discount = shippingCost;
    appliedCoupon = coupon.code;
  }

  return {
    items, subtotal, shippingCost, discount,
    total: Math.max(0, subtotal + shippingCost - discount),
    couponCode: appliedCoupon,
  };
}

async function deductInventory(ctx: MutationCtx, items: Awaited<ReturnType<typeof buildQuote>>["items"]) {
  for (const item of items) {
    const product = await ctx.db.get(item.productId);
    if (!product || !product.active || product.inventory < item.quantity) throw new Error(`${item.name} no longer has enough stock`);
    await ctx.db.patch(product._id, { inventory: product.inventory - item.quantity });
  }
}

async function clearUserCart(ctx: MutationCtx, userId: Id<"users">) {
  const cartItems = await ctx.db.query("cartItems").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
  for (const item of cartItems) await ctx.db.delete(item._id);
}

async function recordCouponUse(ctx: MutationCtx, code?: string) {
  if (!code) return;
  const coupon = await ctx.db.query("coupons").withIndex("by_code", (q) => q.eq("code", code)).unique();
  if (coupon) await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount + 1 });
}

export const getCheckoutQuote = query({
  args: { couponCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    try {
      const quote = await buildQuote(ctx, userId, args.couponCode);
      return {
        valid: true as const,
        subtotal: quote.subtotal,
        shippingCost: quote.shippingCost,
        discount: quote.discount,
        total: quote.total,
        couponCode: quote.couponCode,
      };
    } catch (error) {
      return { valid: false as const, error: error instanceof Error ? error.message : "Unable to price this cart" };
    }
  },
});

export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("orders").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").take(100);
  },
});

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const order = await ctx.db.get(args.orderId);
    return order?.userId === userId ? order : null;
  },
});

export const createCashOnDeliveryOrder = mutation({
  args: { shippingAddress: addressValidator, couponCode: v.optional(v.string()), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const quote = await buildQuote(ctx, user._id, args.couponCode);
    await deductInventory(ctx, quote.items);
    for (const item of quote.items) {
      const product = await ctx.db.get(item.productId);
      if (product) await ctx.db.patch(product._id, { salesCount: product.salesCount + item.quantity });
    }
    const orderId = await ctx.db.insert("orders", {
      userId: user._id, items: quote.items, status: "pending", total: quote.total,
      subtotal: quote.subtotal, shippingCost: quote.shippingCost, discount: quote.discount,
      couponCode: quote.couponCode, currency: CURRENCY, shippingAddress: cleanAddress(args.shippingAddress),
      paymentMethod: "cash_on_delivery", paymentStatus: "awaiting_payment",
      notes: args.notes?.trim().slice(0, 500) || undefined,
    });
    await recordCouponUse(ctx, quote.couponCode);
    await clearUserCart(ctx, user._id);
    return orderId;
  },
});

export const prepareStripeOrder = internalMutation({
  args: { userId: v.id("users"), shippingAddress: addressValidator, couponCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const quote = await buildQuote(ctx, args.userId, args.couponCode);
    await deductInventory(ctx, quote.items);
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId, items: quote.items, status: "pending", total: quote.total,
      subtotal: quote.subtotal, shippingCost: quote.shippingCost, discount: quote.discount,
      couponCode: quote.couponCode, currency: CURRENCY, shippingAddress: cleanAddress(args.shippingAddress),
      paymentMethod: "stripe", paymentStatus: "awaiting_payment",
    });
    // Stripe expires the hosted session at 30 minutes; this delayed mutation is a five-minute fallback.
    await ctx.scheduler.runAfter(35 * 60 * 1000, internal.orders.expireStripeOrder, { orderId });
    return { orderId, total: quote.total };
  },
});

export const attachStripeSession = internalMutation({
  args: { orderId: v.id("orders"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.paymentMethod !== "stripe") throw new Error("Order not found");
    await ctx.db.patch(order._id, { stripeSessionId: args.sessionId });
  },
});

export const cancelStripeOrder = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.paymentMethod !== "stripe" || order.paymentStatus !== "awaiting_payment") return;
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId);
      if (product) await ctx.db.patch(product._id, { inventory: product.inventory + item.quantity });
    }
    await ctx.db.patch(order._id, { status: "cancelled", paymentStatus: "failed" });
  },
});

export const expireStripeOrder = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.paymentStatus !== "awaiting_payment") return;
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId);
      if (product) await ctx.db.patch(product._id, { inventory: product.inventory + item.quantity });
    }
    await ctx.db.patch(order._id, { status: "cancelled", paymentStatus: "failed" });
  },
});

export const markStripePaid = internalMutation({
  args: { orderId: v.id("orders"), sessionId: v.string(), paymentIntentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.paymentMethod !== "stripe") throw new Error("Order not found");
    if (order.paymentStatus === "paid") return;
    if (order.stripeSessionId && order.stripeSessionId !== args.sessionId) throw new Error("Stripe session mismatch");
    if (order.paymentStatus !== "awaiting_payment") throw new Error("Order is not payable");
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId);
      if (product) await ctx.db.patch(product._id, { salesCount: product.salesCount + item.quantity });
    }
    await ctx.db.patch(order._id, {
      status: "processing", paymentStatus: "paid", stripeSessionId: args.sessionId,
      paymentIntentId: args.paymentIntentId,
    });
    await recordCouponUse(ctx, order.couponCode);
    await clearUserCart(ctx, order.userId);
  },
});

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").take(500);
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("shipped"), v.literal("delivered"), v.literal("cancelled")),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.paymentMethod === "stripe" && order.paymentStatus !== "paid" && ["processing", "shipped", "delivered"].includes(args.status)) {
      throw new Error("Online payment has not completed");
    }
    await ctx.db.patch(order._id, { status: args.status, trackingNumber: args.trackingNumber?.trim().slice(0, 120) });
  },
});
