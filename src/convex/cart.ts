import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) return [];

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );

    return itemsWithProducts.filter((item) => item.product !== null);
  },
});

export const getCartCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) return 0;

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
});

export const addItem = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    selectedSize: v.string(),
    selectedColor: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) throw new Error("User not found");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (product.inventory < args.quantity) throw new Error("Insufficient inventory");

    // Check if item already exists in cart
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .unique();

    if (existing) {
      const newQty = existing.quantity + args.quantity;
      if (product.inventory < newQty) throw new Error("Insufficient inventory");
      await ctx.db.patch(existing._id, { quantity: newQty });
      return existing._id;
    }

    return await ctx.db.insert("cartItems", {
      userId: user._id,
      productId: args.productId,
      quantity: args.quantity,
      selectedSize: args.selectedSize,
      selectedColor: args.selectedColor,
    });
  },
});

export const updateQuantity = mutation({
  args: { cartItemId: v.id("cartItems"), quantity: v.number() },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
      return;
    }

    const item = await ctx.db.get(args.cartItemId);
    if (!item) throw new Error("Cart item not found");

    const product = await ctx.db.get(item.productId);
    if (!product || product.inventory < args.quantity) {
      throw new Error("Insufficient inventory");
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
  },
});

export const removeItem = mutation({
  args: { cartItemId: v.id("cartItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId);
  },
});

export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) return;

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});
