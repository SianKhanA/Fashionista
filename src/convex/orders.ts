import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== user._id) return null;

    return order;
  },
});

export const createOrder = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        size: v.string(),
        color: v.string(),
        imageUrl: v.optional(v.string()),
      })
    ),
    total: v.number(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
    paymentMethod: v.string(),
    paymentIntentId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) throw new Error("User not found");

    // Verify inventory and deduct
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error(`Product ${item.name} not found`);
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for ${item.name}`);
      }
      await ctx.db.patch(item.productId, {
        inventory: product.inventory - item.quantity,
        salesCount: product.salesCount + item.quantity,
      });
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      items: args.items,
      status: "pending",
      total: args.total,
      shippingAddress: args.shippingAddress,
      paymentMethod: args.paymentMethod,
      paymentIntentId: args.paymentIntentId,
      notes: args.notes,
    });

    // Clear cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return orderId;
  },
});

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user || user.role !== "admin") return [];

    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const updates: Record<string, unknown> = { status: args.status };
    if (args.trackingNumber) updates.trackingNumber = args.trackingNumber;
    await ctx.db.patch(args.orderId, updates);
  },
});
